const constant = require('button-constant');
const { mongo } = require('./server');
const { setResult } = require('./utility');
const { queryPermissionTable } = require('./permission');

/**
 * 判断传输的数据是否为数组
 *
 * @param fromIdArray 要被合并的项目id array
 * @param toId 需要保留的项目id
 * @param res response object
 */
/* eslint-disable no-await-in-loop */
async function merge(userId, fromId, toId, res) {
  try {
    const db = (await mongo).db('data');
    const permissionResultToId = await checkWritePermission(db, 'project', userId, toId);
    if (!permissionResultToId) {
      const message = `the user ${userId} has no-permission`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (fromId instanceof Array) {
      let flag = 1;
      for (let i = 0; i < fromId.length; i += 1) {
        if (fromId[i] !== toId) {
          const permissionResultFromId = await checkWritePermission(db, 'project', userId, fromId[i]);
          if (!permissionResultFromId) {
            flag = 0;
          } else {
            await mergeFromIdToId(userId, fromId[i], toId, db, res);
          }
        }
      }
      if (flag === 1) {
        const message = `merge ${fromId} to ${toId} success`;
        console.log(message);
        setResult(res, 200, { message });
      } else {
        const message = `Some of the merger ${fromId} to ${toId} were successful`;
        console.log(message);
        setResult(res, 206, { message });
        return;
      }
    } else {
      if (fromId === toId) {
        const message = `fromId: ${fromId} is equal to toId `;
        console.error(message);
        setResult(res, 403, { message });
        return;
      }
      const permissionResultFromId = await checkWritePermission(db, 'project', userId, fromId);
      if (!permissionResultFromId) {
        const message = `the user ${userId} has no-permission`;
        console.error(message);
        setResult(res, 400, { message });
        return;
      }
      await mergeFromIdToId(userId, fromId, toId, db, res);
      const message = `merge ${fromId} to ${toId} success`;
      console.log(message);
      setResult(res, 200, { message });
    }
  } catch (e) {
    const message = `fail to merge project due to ${e.name}/${e.message}`;
    console.error(message);
    setResult(res, 500, { message });
  }
}

/**
 * 合并项目
 *
 * @param userId 用户id
 * @param fromId 要被合并的一个项目的id
 * @param toId 需要保留的项目id
 * @param db 数据库对象
 * @param res response object
 */
async function mergeFromIdToId(userId, fromId, toId, db, res) {
  try {
    // 查询要合并的项目
    const fromResult = await db.collection('project').findOne({ id: fromId });
    if (!fromResult) {
      const message = `can not find projectid ${fromId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const toResult = await db.collection('project').findOne({ id: toId });
    if (!toResult) {
      const message = `can not find projectid ${toId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    await updateCollection(db, 'task', fromId, toId);
    await updateCollection(db, 'user_project', fromId, toId);
    await updateCollection(db, 'product', fromId, toId);
    await updateCollection(db, 'fa', fromId, toId);
    await updateCollection(db, 'review', fromId, toId);
    await updateCollection(db, 'service', fromId, toId);
    // 删除被合并的项目
    await db.collection('project').removeOne({ id: fromId });
    console.log(`remove fromId ${fromId} success`);
  } catch (e) {
    const message = `fail to merge project due to ${e.name}/${e.message}`;
    console.error(message);
    setResult(res, 500, { message });
  }
}

/**
 * 更新其他数据库中的项目id
 *
 * @param db 数据库对象
 * @param collection 集合名称
 * @param fromId 传入的单个需要被合并的项目id
 * @param toId 需要保留的项目id
 */
async function updateCollection(db, collection, fromId, toId) {
  const result = await db.collection(collection).updateMany({
    projectId: fromId,
  }, { $set: { projectId: toId } });
  if (result.result.ok) {
    console.log(`update ${collection} success`);
  }
}


/**
 * 查询写权限
 *
 * @param db 数据库对象
 * @param collection 数据库集合名称
 * @param userId 用户id
 * @param id 项目id
 */
/* eslint-disable no-underscore-dangle */
async function checkWritePermission(db, collection, userId, id) {
  try {
    const project = await db.collection(collection).findOne({ id });
    const targetId = project._id;
    const type = constant.PERMISSION.RESOURCE_TYPE[collection];
    const resultList = await queryPermissionTable(db, userId, targetId, type);
    const permission = resultList.find(result => result.permission === 3);
    return permission !== undefined;
  } catch (e) {
    console.error(e);
    return false;
  }
}


module.exports = {
  merge,
  checkWritePermission,
};
