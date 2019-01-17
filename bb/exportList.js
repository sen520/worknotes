const excel = require('exceljs');
const uuid4 = require('uuid/v4');
const fs = require('fs');
const moment = require('moment');
const constant = require('button-constant');
const { mongo } = require('./server');
const { setResult, setError, reverseDictionary, formatAddress, formatCurrency,
} = require('./utility');


// 判断是否支持
function isFormatSupported(format) {
  return Object.values(constant.PRINT.FILE_FORMAT)
    .find(value => value === parseInt(format, 10)) !== undefined;
}

// 支持的集合
const TARGET_TYPE = reverseDictionary(constant.PRINT.TARGET_TYPE);

/**
 * Queries projects via permission
 *
 * @param  db 数据库对象
 * @param  type 集合
 * @param  query json格式 查询条件
 * @param  req request object
 * @param  res respon object
 * @return 正常执行无返回值，报错返回错误信息
 */
async function queryProjectByPermission(db, type, query, req, res) {
  const dataList = await db.collection(TARGET_TYPE[type])
    .aggregate([
      { $match: query.$where },
      {
        $lookup: {
          from: 'project',
          localField: 'targetId',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'project.creatorId',
          foreignField: 'id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      { $unwind: '$project' },
      { $match: query.$extraWhere },
      { $sort: query.$order },
    ])
    .toArray();
  const projects = [];
  for (const data of dataList) {
    if (data.project) {
      projects.push({ ...data.project, creator: data.creator });
    }
  }
  const typeToExcel = constant.PRINT.TARGET_TYPE.project;
  await jsonToExcel(projects, typeToExcel, req, res);
}

/**
 * Queries projects via user project relationship
 *
 * @param  db 数据库对象
 * @param  type 集合
 * @param  query json格式 查询条件
 * @param  req request object
 * @param  res respon object
 * @return 正常执行无返回值，报错返回错误信息
 */
async function queryProjectByUser(db, type, query, req, res) {
  const dataList = await db.collection(TARGET_TYPE[type])
    .aggregate([
      { $match: query.$where },
      {
        $lookup: {
          from: 'project',
          localField: 'projectId',
          foreignField: 'id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'project.creatorId',
          foreignField: 'id',
          as: 'creator',
        },
      },
      { $unwind: '$project' },
      { $unwind: '$creator' },
      { $match: query.$extraWhere },
      { $sort: query.$order },
    ])
    .toArray();
  const projects = [];
  for (const data of dataList) {
    if (data.project) {
      projects.push({ ...data.project, creator: data.creator });
    }
  }
  const typeToExcel = constant.PRINT.TARGET_TYPE.project;
  await jsonToExcel(projects, typeToExcel, req, res);
}

/**
 * Queries projects via group.
 *
 * @param  db 数据库对象
 * @param  type 集合名称
 * @param  query json格式 查询条件
 * @param  req request object
 * @param  res respon object
 * @return 正常执行无返回值，报错返回错误信息
 */
async function queryProjectByGroup(db, type, query, req, res) {
  const dataList = await db.collection('group')
    .aggregate([
      { $match: query.$where },
      {
        $facet: {
          // the tasks related to the managers of group
          creator: [
            {
              $lookup: {
                from: 'project',
                localField: 'creatorId',
                foreignField: 'creatorId',
                as: 'project',
              },
            },
            { $unwind: '$project' },
          ],
          manager: [
            { $unwind: '$managerId' },
            {
              $lookup: {
                from: 'project',
                localField: 'managerId',
                foreignField: 'creatorId',
                as: 'project',
              },
            },
            { $unwind: '$project' },
          ],
          member: [
            { $unwind: '$memberId' },
            {
              $lookup: {
                from: 'project',
                localField: 'memberId',
                foreignField: 'creatorId',
                as: 'project',
              },
            },
            { $unwind: '$project' },
          ],
        },
      },
      {
        $project: {
          _result: {
            $concatArrays: [
              '$creator.project', '$manager.project', '$member.project'],
          },
        },
      },
      { $unwind: '$_result' },
      { $replaceRoot: { newRoot: '$_result' } },
      // remove the duplicated project
      {
        $group: {
          _id: '$_id',
          id: { $first: '$id' },
          _updated: { $first: '$_updated' },
          _deleted: { $first: '$_deleted' },
          name: { $first: '$name' },
          address: { $first: '$address' },
          keyword: { $first: '$keyword' },
          creatorId: { $first: '$creatorId' },
          referral: { $first: '$referral' },
          logo: { $first: '$logo' },
          bp: { $first: '$bp' },
          banner: { $first: '$banner' },
          abstract: { $first: '$abstract' },
          detail: { $first: '$detail' },
          stage: { $first: '$stage' },
          website: { $first: '$website' },
          valuation: { $first: '$valuation' },
          phone: { $first: '$phone' },
          askFor: { $first: '$askFor' },
          email: { $first: '$email' },
          share: { $first: '$share' },
          time: { $first: '$time' },
          credit: { $first: '$credit' },
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'creatorId',
          foreignField: 'id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      { $match: query.$extraWhere },
      { $sort: query.$order },
    ])
    .toArray();
  await jsonToExcel(dataList, type, req, res);
}

/**
 * 数据集合普通查询
 *
 * @param  db 数据库对象
 * @param  type 集合
 * @param  query json格式 查询条件
 * @param  req request object
 * @param  res respon object
 * @return 正常执行无返回值，报错返回错误信息
 */
async function queryProject(db, type, query, req, res) {
  const dataList = query.$where
    ? await db.collection(TARGET_TYPE[type])
      .aggregate([
        { $match: query.$where },
        {
          $lookup: {
            from: 'user',
            localField: 'creatorId',
            foreignField: 'id',
            as: 'creator',
          },
        },
        { $unwind: '$creator' },
        { $match: query.$extraWhere },
        { $sort: query.$order },
      ])
      .toArray()
    : await db.collection(TARGET_TYPE[type])
      .find(query)
      .toArray();
  const typeToExcel = constant.PRINT.TARGET_TYPE.project;
  await jsonToExcel(dataList, typeToExcel, req, res);
}

// 读写操作
function readFiles(filename, res) {
  fs.readFile(filename, (err, data) => {
    if (!err) {
      writeFiles(filename, data, res);
    }
  });
}

/**
 * 主要执行写文件操作（包括将转化的文件复制到本地，删除服务器文件）
 *
 * @param  filename 文件名 str
 * @param  data 需要写入文件的数据 str
 * @param  res respon object
 */
function writeFiles(filename, data, res) {
  fs.writeFile(filename, data, () => {
    res.sendFile(filename, null, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      fs.unlink(filename, (err2) => {
        if (err2) {
          console.error(err2);
          return;
        }
        console.log(`${filename} is deleted`);
      });
    });
  });
}


/**
 * 将查询道的结果转化为Excel格式
 *
 * @param  content 查询到的数据数组  arr
 * @param  type 用于判断导出的是哪种数据
 * @param  req request object
 * @param  res respon object
 */
async function jsonToExcel(content, type, req, res) {
  const result = `${__dirname}/${uuid4()}.xlsx`;
  const workbook = await new excel.stream.xlsx.WorkbookWriter(
    { filename: result });
  const worksheet = await workbook.addWorksheet('Sheet');
  switch (type) {
    case constant.PRINT.TARGET_TYPE.project:
      await projectToExcel(content, worksheet, req);
      break;
    case constant.PRINT.TARGET_TYPE.task:
      await taskToExcel(content, worksheet, req);
      break;
    case constant.PRINT.TARGET_TYPE.fa:
      await faToExcel(content, worksheet, req);
      break;
    default:
    // pass
  }
  await workbook.commit();
  await readFiles(result, res);
}

/**
 * 将查询到的fa数据转化为Excel格式
 *
 * @param  content 查询到的数据数组  arr
 * @param  worksheet object
 * @param  req request object
 */
async function faToExcel(content, worksheet, req) {
  const url = req.headers.origin;
  await content.forEach((data) => {
    /* eslint-disable no-param-reassign */
    data.start = moment.unix(parseInt(data.start, 10))
      .toISOString();
    data.end = moment.unix(parseInt(data.end, 10))
      .toISOString();
    if (data.project) {
      data.projectUrl = `${url}/product/fda-project/${data.project.id}`;
      data.keyword = data.project.keyword.join(', ');
      const stageGet = Object.entries(constant.PROJECT.STAGE).filter(
        e => e[1] === data.project.stage).map(e => e[0]).shift();
      data.stage = stageGet;
      if (stageGet.length === 1) {
        data.stage = `${stageGet.toLocaleUpperCase()} 轮`;
      }
      data.projectCreator = data.creator.name;
      data.projectName = { text: data.project.name, hyperlink: data.projectUrl };
    }
    data.creatorUrl = `${url}/people/user/${data.creator.id}`;
    const operatorList = [];
    const operatorUrlList = [];
    data.operator.forEach((singleOperator) => {
      operatorList.push(singleOperator.name);
      operatorUrlList.push(`${url}/people/user/${singleOperator.id}`);
    });
    data.operator = operatorList.join(', ');
    data.operatorUrl = operatorUrlList.join(', ');
    data.creator = { text: data.creator.name, hyperlink: data.creatorUrl };
    data.status = Object.entries(constant.FA.STATUS).filter(
      e => e[1] === data.status).map(e => e[0]).shift();
    const faUrl = `${url}/dashboard/fa-view/${data.id}`;
    data.name = { text: data.name, hyperlink: faUrl };
    worksheet.columns = [
      { header: '标题', key: 'name' },
      { header: '发起方', key: 'creator' },
      { header: '代理方', key: 'operator' },
      { header: '代理方链接', key: 'operatorUrl' },
      { header: '开始时间', key: 'start' },
      { header: '结束时间', key: 'end' },
      { header: '状态', key: 'status' },
      { header: '更新时间', key: '_updated' },
      // projection
      { header: '项目名称', key: 'projectName' },
      { header: '标签', key: 'keyword' },
      { header: '阶段', key: 'stage' },
      { header: '创建者', key: 'projectCreator' },
    ];
    worksheet.addRow(data);
  });
}

/**
 * 将查询到的task数据转化为Excel格式
 *
 * @param  content 查询到的数据数组  arr
 * @param  worksheet object
 * @param  req request object
 */
async function taskToExcel(content, worksheet, req) {
  const url = req.headers.origin;
  await content.forEach((data) => {
    /* eslint-disable no-param-reassign,no-underscore-dangle */
    data.time = moment.unix(parseInt(data.time, 10))
      .toISOString();
    data.due = moment.unix(parseInt(data.due, 10))
      .toISOString();
    if (data.project) {
      data.projectUrl = `${url}/product/fda-project/${data.project.id}`;
      data.keyword = data.project.keyword.join(', ');
      const stageGet = Object.entries(constant.PROJECT.STAGE).filter(
        e => e[1] === data.project.stage).map(e => e[0]).shift();
      data.stage = stageGet;
      if (stageGet.length === 1) {
        data.stage = `${stageGet.toLocaleUpperCase()} 轮`;
      }
      data.projectCreator = data.creator.name;
      data.projectName = { text: data.project.name, hyperlink: data.projectUrl };
    }
    data.creatorUrl = `${url}/people/user/${data.creator.id}`;
    const operatorList = [];
    const operatorUrlList = [];
    data.operator.forEach((singleOperator) => {
      operatorList.push(singleOperator.name);
      operatorUrlList.push(`${url}/people/user/${singleOperator.id}`);
    });
    data.operator = operatorList.join(', ');
    data.operatorUrl = operatorUrlList.join(', ');
    data.creator = { text: data.creator.name, hyperlink: data.creatorUrl };
    data.status = Object.entries(constant.TASK.STATUS).filter(
      e => e[1] === data.status).map(e => e[0]).shift();
    data.priority = Object.entries(constant.TASK.PRIORITY).filter(
      e => e[1] === data.priority).map(e => e[0]).shift();
    const taskUrl = `${url}/workflow/task-view/${data.id}`;
    data.name = { text: data.name, hyperlink: taskUrl };
    worksheet.columns = [
      { header: '标题', key: 'name' },
      { header: '创建者', key: 'creator' },
      { header: '执行人', key: 'operator' },
      { header: '执行人链接', key: 'operatorUrl' },
      { header: '开始时间', key: 'time' },
      { header: '结束时间', key: 'due' },
      { header: '状态', key: 'status' },
      { header: '优先级', key: 'priority' },
      { header: '更新时间', key: '_updated' },
      // projection
      { header: '项目名称', key: 'projectName' },
      { header: '标签', key: 'keyword' },
      { header: '阶段', key: 'stage' },
      { header: '项目创建者', key: 'projectCreator' },
    ];
    worksheet.addRow(data);
  });
}

/**
 * 将查询到的project数据转化为Excel格式
 *
 * @param  content 查询到的数据数组  arr
 * @param  worksheet object
 * @param  req request object
 */
async function projectToExcel(content, worksheet, req) {
  const url = req.headers.origin;
  await content.forEach((data) => {
    /* eslint-disable no-param-reassign */
    data.keywords = data.keyword.join(', ');
    data.creator = data.creator ? data.creator.name : '';
    data.href = `${url}/product/fda-project/${data.id}`;
    const projectUrl = `${url}/product/fda-product/${data.id}`;
    data.name = { text: data.name, hyperlink: projectUrl };
    const stageGet = Object.entries(constant.PROJECT.STAGE).filter(
      e => e[1] === data.stage).map(e => e[0]).shift();
    data.stage = stageGet;
    if (stageGet.length === 1) {
      data.stage = `${stageGet.toLocaleUpperCase()} 轮`;
    }
    data.valuation = formatCurrency(data.valuation);
    data.askFor = formatCurrency(data.askFor);
    data.address = formatAddress(data.address);
    try {
      data.formatTime = moment.unix(parseInt(data.time, 10))
        .toISOString();
    } catch (error) {
      data.formatTime = '';
    }
    data.share = `${parseFloat(data.share * 100).toFixed(2)}%`;
    /* eslint-disable no-param-reassign */
    worksheet.columns = [
      { header: '名称', key: 'name' },
      { header: '地址', key: 'address' },
      { header: '关键词', key: 'keywords' },
      { header: '简介', key: 'abstract' },
      { header: '阶段', key: 'stage' },
      { header: '网址', key: 'website' },
      { header: '电话', key: 'phone' },
      { header: '邮件', key: 'email' },
      { header: '投前估值', key: 'valuation' },
      { header: '融资需求', key: 'askFor' },
      { header: '出让股份', key: 'share' },
      { header: '成立时间', key: 'formatTime' },
      { header: '链接', key: 'href' },
      { header: '创建者', key: 'creator' },
    ];
    worksheet.addRow(data);
  });
}

/**
 * 查询 fa
 *
 * @param db 数据库对象
 * @param type 集合名称代数
 * @param query 查询条件
 * @param req request object
 * @param res response object
 */
async function queryFa(db, type, query, req, res) {
  const dataList = await db.collection(TARGET_TYPE[type])
    .aggregate([
      { $match: query.$where },
      {
        $lookup: {
          from: 'project',
          localField: 'projectId',
          foreignField: 'id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'creatorId',
          foreignField: 'id',
          as: 'creator',
        },
      },
      { $unwind: '$operatorId' },
      {
        $lookup: {
          from: 'user',
          localField: 'operatorId',
          foreignField: 'id',
          as: 'operator',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'project.creatorId',
          foreignField: 'id',
          as: 'projectCreator',
        },
      },
      { $unwind: '$project' },
      { $unwind: '$operator' },
      { $unwind: '$creator' },
      { $unwind: { path: '$projectCreator', preserveNullAndEmptyArrays: true } },
      { $match: query.$extraWhere },
      { $sort: query.$order },
      {
        $group: {
          _id: '$_id',
          id: { $first: '$id' },
          name: { $first: '$name' },
          creator: { $first: '$creator' },
          operator: { $addToSet: '$operator' },
          start: { $first: '$start' },
          end: { $first: '$end' },
          status: { $first: '$status' },
          _updated: { $first: '$_updated' },
          project: { $first: '$project' },
        },
      },
    ])
    .toArray();
  await jsonToExcel(dataList, type, req, res);
}

/**
 * fa的组查询
 *
 * @param db 数据库对象
 * @param type 集合名称代数
 * @param query 查询条件
 * @param req request object
 * @param res response object
 */
async function queryFaByGroup(db, type, query, req, res) {
  const dataList = await db.collection('group')
    .aggregate([
      { $match: query.$where },
      {
        $facet: {
          creator_creator: [
            {
              $lookup: {
                from: 'fa',
                localField: 'creatorId',
                foreignField: 'creatorId',
                as: 'fa',
              },
            },
            { $unwind: '$fa' },
          ],
          creator_operator: [
            {
              $lookup: {
                from: 'fa',
                localField: 'creatorId',
                foreignField: 'operatorId',
                as: 'fa',
              },
            },
            { $unwind: '$fa' },
          ],
          manager_creator: [
            { $unwind: '$managerId' },
            {
              $lookup: {
                from: 'fa',
                localField: 'managerId',
                foreignField: 'creatorId',
                as: 'fa',
              },
            },
            { $unwind: '$fa' },
          ],
          manager_operator: [
            { $unwind: '$managerId' },
            {
              $lookup: {
                from: 'fa',
                localField: 'managerId',
                foreignField: 'operatorId',
                as: 'fa',
              },
            },
            { $unwind: '$fa' },
          ],
          member_creator: [
            { $unwind: '$memberId' },
            {
              $lookup: {
                from: 'fa',
                localField: 'memberId',
                foreignField: 'creatorId',
                as: 'fa',
              },
            },
            { $unwind: '$fa' },
          ],
          member_operator: [
            { $unwind: '$memberId' },
            {
              $lookup: {
                from: 'fa',
                localField: 'memberId',
                foreignField: 'operatorId',
                as: 'fa',
              },
            },
            { $unwind: '$fa' },
          ],
        },
      },
      {
        $project: {
          _result: {
            $concatArrays: [
              '$creator_creator.fa', '$creator_operator.fa',
              '$manager_creator.fa', '$manager_operator.fa',
              '$member_creator.fa', '$member_operator.fa',
            ],
          },
        },
      },
      { $unwind: '$_result' },
      { $replaceRoot: { newRoot: '$_result' } },
      { $unwind: '$operatorId' },
      {
        $group: {
          _id: '$_id',
          _updated: { $first: '$_updated' },
          id: { $first: '$id' },
          name: { $first: '$name' },
          status: { $first: '$status' },
          end: { $first: '$end' },
          start: { $first: '$start' },
          detail: { $first: '$detail' },
          fee: { $first: '$fee' },
          credit: { $first: '$credit' },
          projectId: { $first: '$projectId' },
          creatorId: { $first: '$creatorId' },
          operatorId: { $addToSet: '$operatorId' },
        },
      },
      {
        $lookup: {
          from: 'project',
          localField: 'projectId',
          foreignField: 'id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'creatorId',
          foreignField: 'id',
          as: 'creator',
        },
      },
      { $unwind: '$operatorId' },
      {
        $lookup: {
          from: 'user',
          localField: 'operatorId',
          foreignField: 'id',
          as: 'operator',
        },
      },
      { $unwind: '$project' },
      { $unwind: '$creator' },
      { $unwind: '$operator' },
      { $match: query.$extraWhere },
      {
        $group: {
          _id: '$_id',
          _updated: { $first: '$_updated' },
          id: { $first: '$id' },
          name: { $first: '$name' },
          status: { $first: '$status' },
          end: { $first: '$end' },
          start: { $first: '$start' },
          detail: { $first: '$detail' },
          fee: { $first: '$fee' },
          credit: { $first: '$credit' },
          projectId: { $first: '$projectId' },
          creatorId: { $first: '$creatorId' },
          operatorId: { $push: '$operatorId' },
          project: { $first: '$project' },
          creator: { $first: '$creator' },
          operator: { $push: '$operator' },
        },
      },
      { $sort: query.$order },
    ])
    .toArray();
  await jsonToExcel(dataList, type, req, res);
}

/**
 * 查询 task
 *
 * @param db 数据库对象
 * @param type 集合名称代数
 * @param query 查询条件
 * @param req request object
 * @param res response object
 */
async function queryTask(db, type, query, req, res) {
  const dataList = await db.collection(TARGET_TYPE[type])
    .aggregate([
      { $match: query.$where },
      {
        $lookup: {
          from: 'project',
          localField: 'projectId',
          foreignField: 'id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'creatorId',
          foreignField: 'id',
          as: 'creator',
        },
      },
      { $unwind: '$operatorId' },
      {
        $lookup: {
          from: 'user',
          localField: 'operatorId',
          foreignField: 'id',
          as: 'operator',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'project.creatorId',
          foreignField: 'id',
          as: 'projectCreator',
        },
      },
      { $unwind: '$operator' },
      { $unwind: '$creator' },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$projectCreator', preserveNullAndEmptyArrays: true } },
      { $match: query.$extraWhere },
      { $sort: query.$order },
      {
        $group: {
          _id: '$_id',
          id: { $first: '$id' },
          name: { $first: '$name' },
          creator: { $first: '$creator' },
          operator: { $addToSet: '$operator' },
          time: { $first: '$time' },
          due: { $first: '$due' },
          status: { $first: '$status' },
          _updated: { $first: '$_updated' },
          priority: { $first: '$priority' },
          project: { $first: '$project' },
        },
      },
    ])
    .toArray();
  await jsonToExcel(dataList, type, req, res);
}

/**
 * 查询 task
 *
 * @param db 数据库对象
 * @param type 集合名称代数
 * @param query 查询条件
 * @param req request object
 * @param res response object
 */
async function queryTaskByGroup(db, type, query, req, res) {
  const dataList = await db.collection('group')
    .aggregate([
      { $match: query.$where },
      {
        $facet: {
          creator_creator: [
            {
              $lookup: {
                from: 'task',
                localField: 'creatorId',
                foreignField: 'creatorId',
                as: 'task',
              },
            },
            { $unwind: '$task' },
          ],
          creator_operator: [
            {
              $lookup: {
                from: 'task',
                localField: 'creatorId',
                foreignField: 'operatorId',
                as: 'task',
              },
            },
            { $unwind: '$task' },
          ],
          manager_creator: [
            { $unwind: '$managerId' },
            {
              $lookup: {
                from: 'task',
                localField: 'managerId',
                foreignField: 'creatorId',
                as: 'task',
              },
            },
            { $unwind: '$task' },
          ],
          manager_operator: [
            { $unwind: '$managerId' },
            {
              $lookup: {
                from: 'task',
                localField: 'managerId',
                foreignField: 'operatorId',
                as: 'task',
              },
            },
            { $unwind: '$task' },
          ],
          member_creator: [
            { $unwind: '$memberId' },
            {
              $lookup: {
                from: 'task',
                localField: 'memberId',
                foreignField: 'creatorId',
                as: 'task',
              },
            },
            { $unwind: '$task' },
          ],
          member_operator: [
            { $unwind: '$memberId' },
            {
              $lookup: {
                from: 'task',
                localField: 'memberId',
                foreignField: 'operatorId',
                as: 'task',
              },
            },
            { $unwind: '$task' },
          ],
        },
      },
      {
        $project: {
          _result: {
            $concatArrays: [
              '$creator_creator.task', '$creator_operator.task',
              '$manager_creator.task', '$manager_operator.task',
              '$member_creator.task', '$member_operator.task',
            ],
          },
        },
      },
      { $unwind: '$_result' },
      { $replaceRoot: { newRoot: '$_result' } },
      { $unwind: '$operatorId' },
      {
        $group: {
          _id: '$_id',
          _updated: { $first: '$_updated' },
          id: { $first: '$id' },
          name: { $first: '$name' },
          status: { $first: '$status' },
          due: { $first: '$due' },
          time: { $first: '$time' },
          detail: { $first: '$detail' },
          credit: { $first: '$credit' },
          priority: { $first: '$priority' },
          parentId: { $first: '$parentId' },
          projectId: { $first: '$projectId' },
          creatorId: { $first: '$creatorId' },
          operatorId: { $addToSet: '$operatorId' },
        },
      },
      {
        $lookup: {
          from: 'project',
          localField: 'projectId',
          foreignField: 'id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'creatorId',
          foreignField: 'id',
          as: 'creator',
        },
      },
      { $unwind: '$operatorId' },
      {
        $lookup: {
          from: 'user',
          localField: 'operatorId',
          foreignField: 'id',
          as: 'operator',
        },
      },

      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $unwind: '$creator' },
      { $unwind: '$operator' },
      { $match: query.$extraWhere },
      {
        $group: {
          _id: '$_id',
          _updated: { $first: '$_updated' },
          id: { $first: '$id' },
          name: { $first: '$name' },
          status: { $first: '$status' },
          due: { $first: '$due' },
          time: { $first: '$time' },
          detail: { $first: '$detail' },
          credit: { $first: '$credit' },
          priority: { $first: '$priority' },
          parentId: { $first: '$parentId' },
          projectId: { $first: '$projectId' },
          creatorId: { $first: '$creatorId' },
          operatorId: { $push: '$operatorId' },
          project: { $first: '$project' },
          creator: { $first: '$creator' },
          operator: { $push: '$operator' },
        },
      },
      { $sort: query.$order },
    ])
    .toArray();
  await jsonToExcel(dataList, type, req, res);
}


/**
 * 项目列表导出Excel
 *
 * @param  type 集合名
 *     0 user_user
 *     1 project
 * @param  userId 用户id
 * @param  format 支持的文件格式
 *     0 xlsx
 * @param  query 查询条件
 * @param  group 是否为组查询
 * @param  req request object
 * @param  res response object
 * @return 返回错误信息
 */
module.exports = async function (type, userId, format, query, group, req, res) {
  try {
    if (!isFormatSupported(format)) {
      setResult(
        res, 400, { message: `format=${format} is not supported` });
      return '';
    }
    if (typeof (query) !== 'object' || Object.keys(query).length === 0) {
      setResult(
        res, 400, { message: `query=${query} is not supported` });
      return '';
    }
    const db = (await mongo).db('data');
    // 查询
    if (group) {
      switch (type) {
        case constant.PRINT.TARGET_TYPE.project:
          await queryProjectByGroup(db, type, query, req, res);
          break;
        case constant.PRINT.TARGET_TYPE.fa:
          await queryFaByGroup(db, type, query, req, res);
          break;
        case constant.PRINT.TARGET_TYPE.task:
          await queryTaskByGroup(db, type, query, req, res);
          break;
        default:
          setResult(res, 400, { message: `type=${type} is not supported` });
      }
      return;
    }
    switch (type) {
      case constant.PRINT.TARGET_TYPE.project:
        await queryProject(db, type, query, req, res);
        break;
      case constant.PRINT.TARGET_TYPE.user_project:
        await queryProjectByUser(db, type, query, req, res);
        break;
      case constant.PRINT.TARGET_TYPE.permission:
        await queryProjectByPermission(db, type, query, req, res);
        break;
      case constant.PRINT.TARGET_TYPE.fa:
        await queryFa(db, type, query, req, res);
        break;
      case constant.PRINT.TARGET_TYPE.task:
        await queryTask(db, type, query, req, res);
        break;
      default:
        setResult(res, 400, { message: `type=${type} is not supported` });
    }
  } catch (error) {
    setError(res, 500, error);
  }
};
