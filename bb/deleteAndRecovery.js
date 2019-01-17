const constant = require('button-constant');
const uuid4 = require('uuid/v4');
const { mongo } = require('./server');
const { checkWritePermission } = require('./merger');
const { setResult, deepCopy } = require('./utility');
const { ObjectId } = require('mongodb');
const { sendEmailBody } = require('./mail');

/**
 * 查看用户权限，并调用删除 project
 *
 * @param userId 用户id
 * @param projectId 项目id
 * @param res response object
 */
/* eslint-disable no-await-in-loop,no-underscore-dangle */
async function deleteProjectInfo(userId, projectId, res) {
  const db = (await mongo).db('data');
  const projectIdList = await checkDeleteAndRecoveryPermission(db, projectId, 'project', userId);
  if (projectIdList.length === 0) {
    const message = 'no permission';
    console.error(message);
    setResult(res, 400, { message });
    return;
  }
  let flag = true;
  for (const projectIdElement of projectIdList) {
    const project = await db.collection('project').findOne(
      { id: projectIdElement },
      { projection: { _deleted: 1 } });
    try {
      if (project._deleted) {
        const deleteResult = await deleteProject(db, projectIdElement);
        if (!deleteResult) {
          flag = false;
        }
      } else {
        const message = `the data ${projectIdElement} is not in trash`;
        console.error(message);
      }
    } catch (e) {
      console.error(e);
      const message = 'the projects delete failed';
      console.error(message);
      setResult(res, 501, { message });
      return;
    }
  }
  if (flag === false) {
    const message = 'some of project delete failed';
    console.log(message);
    setResult(res, 206, { message });
    return;
  }
  const message = 'delete success';
  console.log(message);
  setResult(res, 200, { message });
}

/**
 * 查看用户权限，并调用删除 task
 *
 * @param userId 用户id
 * @param taskId 任务id
 * @param res response object
 */
async function deleteTaskInfo(userId, taskId, res) {
  const db = (await mongo).db('data');
  const taskIdList = await checkDeleteAndRecoveryPermission(db, taskId, 'task', userId);
  if (taskIdList.length === 0) {
    const message = 'no permission';
    console.error(message);
    setResult(res, 400, { message });
    return false;
  }
  let flag = true;
  for (const taskElement of taskIdList) {
    const taskResult = await db.collection('task').findOne(
      { id: taskElement },
      {
        projection: {
          name: 1,
          _id: 1,
          parentId: 1,
          projectId: 1,
          creatorId: 1,
        },
      });
    const reResult = taskResult.name.match('流程$');
    if (!reResult) {
      const result = await deleteSingleTask(db, taskElement, taskResult._id);
      if (!result) flag = false;
    } else {
      // 根task
      const rootTaskResult = await rootTask(taskResult, db, taskElement);
      if (!rootTaskResult) flag = false;
    }
  }
  if (flag === false) {
    const message = 'some of project delete failed';
    console.log(message);
    setResult(res, 206, { message });
    return;
  }
  const message = 'delete success';
  console.log(message);
  setResult(res, 200, { message });
}

/**
 * 判断是否有删除和恢复的权限
 *
 * @param db 数据库对象
 * @param targetId 数据ID
 * @param collection 数据集合名称
 * @param userId 用户id
 *
 * return 有权限的数据id数组
 */
/* eslint-disable no-await-in-loop */
async function checkDeleteAndRecoveryPermission(db, targetIds, collection, userId) {
  if (Array.isArray(targetIds)) {
    const targetIdArray = [];
    for (const targetId of targetIds) {
      const permission = await checkWritePermission(db, collection, userId, targetId);
      if (permission) {
        targetIdArray.push(targetId);
      }
    }
    return targetIdArray;
  }
  const permission = await checkWritePermission(db, collection, userId, targetIds);
  const targetIdList = [];
  if (permission) {
    targetIdList.push(targetIds);
    return targetIdList;
  }
  return targetIdList;
}


/**
 * 硬删除project
 *
 * @param db 数据库对象
 * @param id 要删除的数据id
 */
async function deleteProject(db, id) {
  try {
    const emptyProject = await db.collection('project').findOne({ name: '' });
    let emptyProjectId = uuid4();
    if (!emptyProject) {
      const emptyProjectDict = Object.assign(
        deepCopy(constant.PROJECT.TEMPLATE),
        {
          id: emptyProjectId,
          name: '',
        }
      );
      await db.collection('project').insertOne(emptyProjectDict);
    } else {
      emptyProjectId = emptyProject.id;
    }
    await db.collection('task').updateMany(
      { projectId: id },
      {
        $set: { projectId: emptyProjectId },
      });
    await db.collection('fa').updateMany(
      { projectId: id },
      {
        $set: { projectId: emptyProjectId },
      });
    await db.collection('review').updateMany(
      { projectId: id },
      { $set: { projectId: emptyProjectId } }
    );
    await db.collection('service').updateMany(
      { projectId: id },
      { $set: { projectId: emptyProjectId } }
    );

    await db.collection('product').removeMany({ projectId: id });
    await db.collection('found').removeMany({ projectId: id });
    await db.collection('investment').removeMany({ projectId: id });
    await db.collection('note').removeMany({ targetId: id, type: 1 });
    await db.collection('patent').removeMany({ targetId: id, type: 1 });
    await db.collection('document').removeMany({ targetId: id, type: 1 });
    await db.collection('comment').removeMany({ targetId: id, type: 1 });
    const result = await db.collection('project').removeOne({ id });
    return result.result.ok;
  } catch (e) {
    return false;
  }
}


/**
 * 删除单个task
 *
 * @param db 数据库对象
 * @param taskId taskId
 * @param id 用于查询权限的_id
 */
async function deleteSingleTask(db, taskId, id) {
  // 普通task
  await db.collection('comment').removeMany({ targetId: taskId });
  await db.collection('permission').removeOne({ type: 3, targetId: ObjectId(id) });
  // document
  try {
    // 删除独占的
    await db.collection('document').removeMany(
      { type: 3,
        $and: [
          { targetId: taskId },
          { targetId: { $size: 1 } },
        ],
      });
    // 更新共有的
    await db.collection('document').updateMany(
      { type: 3, targetId: taskId },
      { $pull: { targetId: taskId } });
  } catch (e) {
    console.error(e);
  }
  const info = await db.collection('task').removeOne({ id: taskId });
  console.log(info.result);
  return info.result.ok;
}

/**
 * 删除根任务
 *
 * @param result
 * @param db 数据库对象
 * @param taskId taskId
 */
async function rootTask(result, db, taskId) {
  const whereString = {
    parentId: result.parentId,
    projectId: result.projectId,
    creatorId: result.creatorId,
  };
  const tasks = await db.collection('task').find(
    whereString,
    {
      projection: {
        name: 1,
        _id: 1,
        id: 1,
      },
    }).toArray();
  for (const task of tasks) {
    deleteSingleTask(db, task.id, task._id);
  }
  await db.collection('permission').removeMany(
    {
      type: 3,
      targetId: ObjectId(result._id),
    });
  const removeResult = await db.collection('task').removeOne({ id: taskId });
  return removeResult.result.ok;
}

/**
 * 清空回收站
 *
 * @param userId  用户id
 * @param res response object
 */
async function emptyTrash(userId, res) {
  const db = (await mongo).db('data');
  const projectIdArray = await db.collection('project').find(
    { creatorId: userId, _deleted: true },
    { projection: { id: 1, _id: 0 } }
  ).toArray();
  if (projectIdArray.length === 0) {
    const message = 'the trash is empty';
    setResult(res, 200, { message });
    return;
  }
  let flag = false;
  for (const project of projectIdArray) {
    const permission = await checkWritePermission(db, 'project', userId, project.id);
    if (permission) {
      const a = await db.collection('project').removeOne({ id: project.id });
      if (a.result.ok) flag = true;
    }
  }
  if (!flag) {
    const message = 'some of project deleted failed';
    setResult(res, 206, { message });
    return;
  }
  const message = 'empty trash succeed';
  setResult(res, 200, { message });
}

/**
 * 恢复数据
 *
 * @param userId  用户id
 * @param projectId 需要恢复的项目id，可传数组
 * @param res response object
 */
async function recoverProject(userId, projectId, res) {
  try {
    const db = (await mongo).db('data');
    const projectIdArray = await checkDeleteAndRecoveryPermission(db, projectId, 'project', userId);
    if (projectIdArray.length === 0) {
      const message = 'no permission';
      console.error(message);
      setResult(res, 503, { message });
      return;
    }
    const result = await db.collection('project').updateMany({ id: { $in: projectIdArray } }, { $set: { _deleted: false } });
    if (result.result.ok) {
      const message = 'data recovery succeed';
      console.log(message);
      setResult(res, 200, { message });
      return;
    }
  } catch (e) {
    const message = 'data recovery failed';
    console.error(message);
    setResult(res, 500, { message });
  }
}

/**
 * 软删除时发送邮件
 *
 * @param userId  用户id
 * @param projectIdList projectId数组
 * @param res response object
 */
async function deleteSendEmail(userId, projectIdList, res) {
  try {
    const db = (await mongo).db('data');
    // 遍历projectIdList
    for (const projectId of projectIdList) {
      // 找到每个项目对应的 任务，流程，FA 的创建者，协作人
      let emailList = new Set();
      const project = await db.collection('project').findOne(
        { id: projectId },
        { projection: { creatorId: 1, name: 1 } });
      // 项目创建人
      const projectCreator = await db.collection('user').findOne(
        { id: project.creatorId },
        { projection: { email: 1 } });
      emailList.add(projectCreator.email);
      // fa
      emailList = await searchCollectionEmail(db, 'fa', projectId, emailList);
      // task
      emailList = await searchCollectionEmail(db, 'task', projectId, emailList);
      // review
      emailList = await searchCollectionEmail(db, 'review', projectId, emailList);
      // service
      emailList = await searchCollectionEmail(db, 'service', projectId, emailList);
      for (const email of emailList) {
        await sendDeleteEmail(db, email, userId, project, res);
      }
    }
    const message = '发送邮件成功';
    console.log(message);
    setResult(res, 200, { message });
  } catch (e) {
    const message = '邮件发送失败';
    console.log(message);
    setResult(res, 500, { message });
  }
}

/**
 * 查询task、fa相关用户的邮箱
 *
 * @param db 数据库对象
 * @param collection 查询出的数据
 * @param projectId 项目id
 * @param emailList 已经查询到的email数组
 */
async function searchCollectionEmail(db, collection, projectId, emailList) {
  const collectionInfos = await db.collection(collection).find(
    { projectId },
    { projection: { operatorId: 1, creatorId: 1 } }
  ).toArray();
  for (const collectionInfo of collectionInfos) {
    let operators = await db.collection('user').find(
      { id: collectionInfo.operatorId },
      { projection: { email: 1 } }
    ).toArray();
    if (Array.isArray(collectionInfo.operatorId)) {
      operators = await db.collection('user').find(
        { id: { $in: collectionInfo.operatorId } },
        { projection: { email: 1 } }
      ).toArray();
    }
    for (const operator of operators) {
      if (operator.email) emailList.add(operator.email);
    }
    const creator = await db.collection('user').findOne(
      { id: collectionInfo.creatorId },
      { projection: { email: 1 } });
    if (creator.email) emailList.add(creator.email);
  }
  return emailList;
}

/**
 * 发送邮件
 *
 * @param db 数据库对象
 * @param email 邮箱地址
 * @param operatorId 操作者id
 * @param project 被删除的项目
 * @param res response object
 */
async function sendDeleteEmail(db, email, operatorId, project, res) {
  const operator = await db.collection('user').findOne({ id: operatorId }, { projection: { name: 1 } });
  const body = `<h1>Dear ${email} Sir/Madam</h1>
<p>The ${project.name} you are participating in has been moved to the trash. If you have questions, please communicate with the sponsor of this operation ${operator.name}.</p>
<p>Thank you!</p>
<h1>尊敬的 ${email} 先生/女士（用户）：</h1>
<p>您好！</p>
<p>您所参与的${project.name}被移入回收站，如果有疑问，请与此操作发起人${operator.name}沟通。</p>
<p>感谢您使用巴特恩数据平台，祝您愉快！</p>`;
  const subject = 'Verify Email from Button Platform';
  if (email) {
    await sendEmailBody(email, subject, body, res);
  }
}


module.exports = {
  deleteProjectInfo,
  deleteTaskInfo,
  emptyTrash,
  recoverProject,
  deleteSendEmail,
};
