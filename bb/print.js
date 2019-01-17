const { setResult, setError, formatAddress, formatCurrency } = require('./utility');
const { mongo } = require('./server');
const moment = require('moment');
const pandoc = require('node-pandoc-promise');
const uuid4 = require('uuid/v4');
const constant = require('button-constant');
const fs = require('fs');
const request = require('request');
const JSZip = require('jszip');


const TASK_STATUS = {
  0: '进行中',
  1: '已完成',
  2: '已取消',
  3: '暂停',
};

/**
 * Creates a markdown table for a 2d array.
 *
 * @param table {[[str]]} a 2d array as the content of the table
 * @return {string} a string representing the table in markdown style
 */
function createTable(table) {
  if (table.length < 1) {
    return '';
  }
  const result = [];
  result.push(`| ${table[0].map(() => '').join(' | ')} |`);
  result.push(`| ${table[0].map(() => ' --- ').join(' | ')} |`);
  for (const row of table) {
    result.push(`| ${row.join(' | ')} |`);
  }
  return result.join('\n');
}

/**
 * Creates a header.
 *
 * @param header the header text
 * @param level level of header, should be a positive integer
 * @return {string} a string representing the header in markdown style
 */
function createHeader(header, level) {
  return `${'#'.repeat(level)} ${header}`;
}

/**
 * Writes the information of a workflow to docx.
 *
 * A workflow is a set of tasks, which share the same creatorId, projectId and
 * parentId.
 *
 * @param taskId id of a task of this workflow
 * @param db mongodb
 * @param url 请求地址
 * @param level default title level, which should be no smaller than 1
 */
async function workflowToMarkdown(taskId, db, url, req, level = 1) {
  try {
    const task = await db.collection('task').findOne({ id: taskId });
    if (task === null) {
      const message = 'no such task';
      console.error(message);
      return '';
    }
    // Find the workflow
    const workflow = await db.collection('workflow').findOne({ id: task.parentId });
    if (workflow === '') {
      const message = 'this task doesn\'t belong to any workflow';
      console.error(message);
      return '';
    }
    const output = [];
    output.push(createHeader(workflow.name, level));
    const creator = await db.collection('user').findOne({ id: task.creatorId }, { projection: { name: 1 } });
    const project = await db.collection('project').findOne({ id: task.projectId }, { projection: { name: 1, id: 1 } });
    const meta = [
      ['名称', `[${workflow.name}](https://${url}/workflow/task-view/${taskId})`],
      ['状态', TASK_STATUS[task.status] || '未知'],
      ['开始时间', task.time ? moment.unix(task.time).format('YYYY-MM-DD HH:mm') : '未知'],
      ['截止时间', task.due ? moment.unix(task.due).format('YYYY-MM-DD HH:mm') : '未知'],
      ['相关项目', project ? project.name : '未知'],
      ['发起者', creator ? creator.name : '未知'],
    ];
    output.push(createTable(meta));

    // Show the information of project
    const markdownFileList = [];
    if (project !== null) {
      const dataDict = await projectToMarkdown(project.id, db, url, req, level);
      output.push(dataDict.content);
      markdownFileList.push(...dataDict.markdownFileList);
    }

    // Find other tasks of this workflow
    const tasks = await db.collection('task')
      .find({
        creatorId: task.creatorId,
        projectId: task.projectId,
        parentId: task.parentId,
        credit: 0 })
      .toArray();
    for (const t of tasks) {
      // eslint-disable-next-line no-await-in-loop
      const dataDict = await taskToMarkdown(t.id, db, url, req, level);
      output.push(dataDict.content);
      markdownFileList.push(...dataDict.markdownFileList);
    }
    const dataDict = { content: output.join('\n\n'), documentName: '', filename: workflow.name, markdownFileList };
    return dataDict;
  } catch (error) {
    const message = `fail to find product ${error}`;
    console.error(message);
    return '';
  }
}

/**
 * Writes the information of a task to docx.
 *
 * @param taskId id of the task
 * @param db mongodb
 * @param url 请求地址
 * @param level default title level, which should be no smaller than 1
 */
async function taskToMarkdown(taskId, db, url, req, level = 1) {
  /* eslint-disable no-underscore-dangle */
  try {
    const task = await db.collection('task').findOne({ id: taskId });
    if (task === null) {
      const message = 'no such task';
      console.error(message);
      return '';
    }
    const creator = await db.collection('user').findOne({ id: task.creatorId }, { projection: { name: 1 } });
    const operators = await db.collection('user').find({ id: { $in: task.operatorId } }, { projection: { name: 1 } }).toArray();
    const project = await db.collection('project').findOne({ id: task.projectId }, { projection: { name: 1, id: 1 } });
    const output = [];
    output.push(createHeader(task.name, level));
    const meta = [
      ['名称', `[${task.name}](https://${url}/workflow/task-view/${taskId})`],
      ['状态', TASK_STATUS[task.status] || '未知'],
      ['开始时间', task.time ? moment.unix(task.time).format('YYYY-MM-DD HH:mm') : '未知'],
      ['截止时间', task.due ? moment.unix(task.due).format('YYYY-MM-DD HH:mm') : '未知'],
      ['相关项目', project ? `[${project.name}](https://${url}/product/fda-project/${project.id})` : '未知'],
      ['发起者', creator ? creator.name : '未知'],
      ['执行人', operators.map(operator => (operator ? operator.name : '未知')).join(', ')],
    ];
    output.push(createTable(meta));
    const markdownFileList = [];
    // detail information
    output.push(createHeader('详细介绍', level + 1));
    const taskDict = downloadAndRename(task.detail, req);
    markdownFileList.push(...taskDict.markdownFileList);
    output.push(taskDict.data);

    output.push(createHeader('更新记录', level + 1));
    const comments = await db.collection('comment').find(
      { type: 3, targetId: taskId },
      { projection: { name: 1, creatorId: 1, detail: 1, _created: 1 } }).toArray();
    for (const comment of comments) {
      const commentCreator = db.collection('user').findOne({ id: comment.creatorId }, { projection: { name: 1 } });
      output.push(createHeader(comment.name, level + 2));
      const time = moment.unix(comment.time).format('YYYY');
      output.push(`作者:${commentCreator.name || '未知'}  时间:${time}`);
      const commentDict = downloadAndRename(comment.detail, req);
      markdownFileList.push(...commentDict.markdownFileList);
      output.push(`${commentDict.data}`);
    }
    const documentName = await getDocumentName(db, taskId, req);
    const dataDict = { content: output.join('\n\n'), documentName, filename: task.name, markdownFileList };
    return dataDict;
  } catch (error) {
    const message = `fail to find product ${error}`;
    console.error(message);
    return '';
  }
}


const PRODUCT_DETAIL_FIELD = {
  introduction: '产品基本情况',
  market: '行业背景',
  technique: '产品及技术介绍',
};

const PRODUCT_DETAIL_ORDER = {
  introduction: 0,
  market: 1,
  technique: 2,
};

const productDetailSort = (from, to) => {
  const left = Object.prototype.hasOwnProperty.call(PRODUCT_DETAIL_ORDER, from)
    ? PRODUCT_DETAIL_ORDER[from]
    : 100;
  const right = Object.prototype.hasOwnProperty.call(PRODUCT_DETAIL_ORDER, to)
    ? PRODUCT_DETAIL_ORDER[to]
    : 100;
  return left - right;
};

/**
 * Writes the information of a product to docx.
 *
 * @param productId id of the product
 * @param db mongodb
 * @param url 请求地址
 * @param level default title level, which should be no smaller than 1
 */
async function productToMarkdown(productId, db, url, req, level = 1) {
  try {
    const product = await db.collection('product').findOne({ id: productId });
    if (product === null) {
      const message = 'no such product';
      console.error(message);
      return '';
    }
    const output = [];
    output.push(createHeader(`[${product.name}](https://${url}/product/fda-product/${productId})`, level));
    output.push(product.abstract);
    const meta = [
      ['关键词', product.type.join(', ')],
      ['状态', product.status],
      ['许可证', product.license.join(', ')],
      ['上市时间', product.time ? moment.unix(product.time).format('YYYY') : '未知'],
    ];
    // contact information
    if (typeof product.price !== 'string') {
      output.push(createTable(meta));
      output.push(createHeader('价格', level + 1));
      let cost = '未知';
      if (product.price.cost.amount) {
        cost = `${product.price.cost.unit} ${product.price.cost.amount.toString()}`;
      }
      let exw = '未知';
      if (product.price.exw.amount) {
        exw = `${product.price.exw.unit} ${product.price.exw.amount.toString()}`;
      }
      let market = '未知';
      if (product.price.market.amount) {
        market = `${product.price.market.unit} ${product.price.market.amount.toString()}`;
      }
      const contact = [
        ['成本价格', cost],
        ['出厂价格', exw],
        ['市场价格', market],
      ];
      output.push(createTable(contact));
    } else {
      let price = '未知';
      if (product.price) {
        price = product.price.toLocaleString();
      }
      meta.push(['价格', price]);
      output.push(createTable(meta));
    }
    // detail information
    output.push(createHeader('详细介绍', level + 1));
    // TODO: convert markdown to docx
    const markdownFileList = [];
    Object.keys(product.detail).sort(productDetailSort).forEach((text) => {
      output.push(createHeader(PRODUCT_DETAIL_FIELD[text] || text, level + 2));
      // docx.createP().addText(project.detail[text], STYLE.normal);
      // renderMarkdown(project.detail[text], docx);
      const productDict = downloadAndRename(product.detail[text], req);
      markdownFileList.push(...productDict.markdownFileList);
      output.push(product.detail[text]);
    });
    const documentName = await getDocumentName(db, productId, req);
    const dataDict = { content: output.join('\n\n'), documentName, filename: product.name, markdownFileList };
    return dataDict;
  } catch (error) {
    const message = `fail to find product ${error}`;
    console.error(message);
    return '';
  }
}

const PROJECT_DETAIL_FIELD = {
  market: '行业背景',
  introduction: '一页纸介绍',
  team: '团队核心成员介绍',
  product: '产品及技术介绍',
  business: '商业模式',
  grant: '获得荣誉',
};

const PROJECT_DETAIL_ORDER = {
  market: 1,
  introduction: 0,
  team: 2,
  product: 3,
  business: 4,
  grant: 5,
};

const projectDetailSort = (from, to) => {
  const left = Object.prototype.hasOwnProperty.call(PROJECT_DETAIL_ORDER, from)
    ? PROJECT_DETAIL_ORDER[from]
    : 100;
  const right = Object.prototype.hasOwnProperty.call(PROJECT_DETAIL_ORDER, to)
    ? PROJECT_DETAIL_ORDER[to]
    : 100;
  return left - right;
};

/**
 * 将md中的云文件改为本地，并调用下载
 *
 * @param originalData md详情数据
 * @param req request object
 */
/* eslint-disable no-param-reassign */
function downloadAndRename(originalData, req) {
  originalData = originalData.replace(/(上传了一个新附件：)\[(\S+\.\w+)\]\((https:\/\/buttondata.oss-cn-shanghai.aliyuncs.com\/\S+)\)$/, '$1[$2](./Enclosure/$2)');
  const fileUrls = originalData.match(/https:\/\/buttondata.oss-cn-shanghai.aliyuncs.com\/.*\.\w+/g);
  const markdownFileList = [];
  if (fileUrls) {
    for (const a of fileUrls) {
      const fileType = a.match(/\w\/.*(\..*)/)[1];
      const name = `${uuid4()}${fileType}`;
      markdownFileList.push(name);
      originalData = originalData.replace(a, `./${name}`);
      getDocument(a, name, req);
    }
  }
  return { markdownFileList, data: originalData };
}

/**
 * Writes the information of a project to docx.
 *
 * @param projectId id of the project
 * @param db mongodb
 * @param url 请求地址
 * @param level default title level, which should be no smaller than 1
 */
async function projectToMarkdown(projectId, db, url, req, level = 1) {
  try {
    const project = await db.collection('project').findOne({ id: projectId });
    if (project === null) {
      const message = 'no such product';
      console.error(message);
      return '';
    }
    const output = [];

    output.push(createHeader(`[${project.name}](https://${url}/product/fda-project/${projectId})`, level));
    output.push(project.abstract);
    output.push(`**关键词**: ${project.keyword.join(', ')}`);
    // contact information
    output.push(createHeader('联系方式', level + 1));
    const contact = [
      ['地址', project.address ? formatAddress(project.address) : '未知'],
      ['电话', project.phone || '未知'],
      ['邮箱', project.email || '未知'],
      ['网址', project.website || '未知'],
    ];
    output.push(createTable(contact));
    // finance information
    output.push(createHeader('融资需求', level + 1));
    const stageGet = Object.entries(constant.PROJECT.STAGE).filter(
      e => e[1] === project.stage).map(e => e[0]).shift();
    let stage = `${stageGet.toLocaleUpperCase()} 轮`;
    if (stageGet === 'unknown' || stageGet === 'acquired') {
      stage = `${stageGet.toLocaleUpperCase()}`;
    }
    const askFor = formatCurrency(project.askFor);
    const valuation = formatCurrency(project.valuation);
    let share = '未知';
    if (project.share) {
      share = `${parseFloat(project.share * 100).toFixed(2)}%`;
    }
    const finance = [
      ['成立时间', project.time ? moment.unix(project.time).format('YYYY') : '未知'],
      ['阶段', stage || '未知'],
      ['融资需求', askFor],
      ['融资出让股份', share],
      ['融资后估值', valuation],
    ];
    output.push(createTable(finance));

    // detail information
    output.push(createHeader('详细介绍', level + 1));
    const markdownFileList = [];
    await Object.keys(project.detail).sort(projectDetailSort).forEach((text) => {
      output.push(createHeader(PROJECT_DETAIL_FIELD[text] || text, level + 2));
      const dict = downloadAndRename(project.detail[text], req);
      markdownFileList.push(...dict.markdownFileList);
      try {
        const content = JSON.parse(dict.data);
        Object.keys(content).forEach((key) => {
          output.push(createHeader(key, level + 3));
          output.push(content[key]);
        });
      } catch (e) {
        output.push(dict.data);
      }
    });

    // product information
    try {
      const products = await db.collection('product')
        .find({ projectId: project.id }, { id: 1 })
        .toArray();
      if (products === null || products.length === 0) {
        const message = 'no such product';
        console.error(message);
      }
      for (const product of products) {
        // eslint-disable-next-line no-await-in-loop
        const dataDict = await productToMarkdown(product.id, db, url, req, level);
        output.push(dataDict.content);
      }
    } catch (error) {
      const message = `fail to find product with ${project.id}`;
      console.error(message);
    }

    // founder information
    await tableForFounder(output, level, projectId, db, project, url);

    // investment information
    await tableForInvest(output, level, projectId, url, db);

    // patent information
    await tableForPatent(output, level, projectId, db, url);

    output.push(createHeader('项目动态', level + 1));
    const comments = await db.collection('comment').find(
      { type: 1, targetId: projectId },
      { projection: { name: 1, creatorId: 1, detail: 1, time: 1 } }).toArray();
    for (const comment of comments) {
      const commentCreator = db.collection('user').findOne({ id: comment.creatorId }, { projection: { name: 1 } });
      output.push(createHeader(comment.name, level + 2));
      const time = moment.unix(comment.time).format('YYYY');
      output.push(`作者:${commentCreator.name || '未知'}  时间:${time}`);
      const commentDict = downloadAndRename(comment.detail, req);
      markdownFileList.push(...commentDict.markdownFileList);
      output.push(`${commentDict.data}`);
    }
    const documentName = await getDocumentName(db, projectId, req);
    const dataDict = { content: output.join('\n\n'), documentName, filename: project.name, markdownFileList };
    return dataDict;
  } catch (error) {
    const message = `fail to find project ${error}`;
    console.error(message);
    return '';
  }
}

/**
 * 团队成员列表
 *
 * @param output 要生成markdown格式的列表
 * @param projectId id of the project
 * @param db mongodb
 * @param level default title level, which should be no smaller than 1
 * @param project
 * @param url 请求地址
 */
async function tableForFounder(output, level, projectId, db, project, url) {
  output.push(createHeader('团队信息', level + 1));
  const teams = await db.collection('found').find(
    { projectId },
    { projection: { role: 1, time: 1, detail: 1, userId: 1 } }).toArray();
  /* eslint-disable no-await-in-loop */
  const teamMemebersInfo = [['姓名', '职务', '加入时间', '介绍']];
  for (const team of teams) {
    const teamMemebers = await db.collection('user').findOne({ id: team.userId }, { projection: { name: 1 } });
    teamMemebersInfo.push([
      `[${teamMemebers.name}](https://${url}/people/user/${teamMemebers.id})` || '未知',
      team.role || '未知',
      team.time ? moment.unix(team.time).format('YYYY') : '未知',
      team.detail || '未知',
    ]);
    output.push(createTable(teamMemebersInfo));
  }
}

/**
 * 融资记录列表
 *
 * @param output 要生成markdown格式的列表
 * @param projectId id of the project
 * @param url 请求地址
 * @param db mongodb
 * @param level default title level, which should be no smaller than 1
 */
async function tableForInvest(output, level, projectId, url, db) {
  output.push(createHeader('融资记录', level + 1));
  const investments = await db.collection('investment').find(
    { projectId },
    { projection:
        { name: 1, time: 1, amount: 1, valuation: 1, share: 1, detail: 1, userId: 1 },
    }).toArray();
  /* eslint-disable no-await-in-loop,no-underscore-dangle */
  const teamMemebersInfo = [
    ['投资人', '信息来源', '融资时间', '投资额', '投前估值', '投资出让股份']];

  for (const investment of investments) {
    const investor = await db.collection('user').findOne({ id: investment.userId }, { projection: { name: 1, id: 1 } });
    const amount = formatCurrency(investment.amount);
    const valuation = formatCurrency(investment.valuation);
    let share = '未知';
    if (investment.share) {
      share = `${investment.share * 100}%`;
    }
    teamMemebersInfo.push(
      [
        `[${investor.name}](https://${url}/people/user/${investor.id})` || '未知',
        investment.name || '未知',
        investment.time ? moment.unix(investment.time).format('YYYY') : '未知',
        amount,
        valuation,
        share,
      ]);
  }
  output.push(createTable(teamMemebersInfo));
}

/**
 * 专利列表
 *
 * @param output 要生成markdown格式的列表
 * @param projectId id of the project
 * @param db mongodb
 * @param level default title level, which should be no smaller than 1
 * @param url 请求地址
 */
async function tableForPatent(output, level, projectId, db, url) {
  /* eslint-disable no-await-in-loop,no-underscore-dangle */
  output.push(createHeader('专利信息', level + 1));
  const patents = await db.collection('patent').find(
    { targetId: projectId },
    { projection: { title: 1, detail: 1, time: 1 } }).toArray();

  const patentInfoList = [];
  const patentInfo = [['专利名', '专利号', '获批时间', '国家']];
  for (const patent of patents) {
    patentInfo.push(
      [
        `[${patent.title}](https://${url}/product/fda-project/${patent.detail.number})` || '未知',
        `[${patent.detail.number}](https://${url}/product/fda-project/${patent.detail.number})` || '未知',
        patent.time ? moment.unix(patent.time).format('YYYY') : '未知',
        patent.detail.country,
      ]);
  }
  patentInfoList.push(patentInfo);
  for (const patentInfos of patentInfoList) {
    output.push(createTable(patentInfos));
  }
}

/**
 * 流程列表
 *
 * @param faId id
 * @param userId 用户id
 * @param db mongodb
 * @param level default title level, which should be no smaller than 1
 * @param url 请求地址
 * @param req request object
 */
async function faToMarkdown(faId, userId, db, url, req, level = 1) {
  try {
    const fa = await db.collection('fa').findOne({ id: faId });
    if (fa === null) {
      const message = 'no such fa';
      console.error(message);
      return '';
    }
    const operators = await db.collection('user').find({ id: { $in: fa.operatorId } }).toArray();
    const project = await db.collection('project').findOne({ id: fa.projectId });
    const creator = await db.collection('user').findOne({ id: fa.creatorId });
    const output = [];
    output.push(createHeader(`[${fa.name}](https://${url}/dashboard/fa-view/${fa.id})`, level));
    const meta = [
      ['名称', `[${fa.name}](https://${url}/dashboard/fa-view/${fa.id})`],
      ['状态', TASK_STATUS[fa.status] || '未知'],
      ['开始时间', fa.start ? moment.unix(fa.start).format('YYYY-MM-DD HH:mm') : '未知'],
      ['截止时间', fa.end ? moment.unix(fa.end).format('YYYY-MM-DD HH:mm') : '未知'],
      ['发起者', creator ? `[${creator.name}](https://${url}/people/user/${creator.id})` : '未知'],
      ['执行人', operators.map(operator => (operator ? operator.name : '未知')).join(', ')],
      ['相关项目', project ? `[${project.name}](https://${url}/product/fda-project/${project.id})` : '未知'],
      ['详情', fa.detail || '未知'],
    ];
    output.push(createTable(meta));

    output.push(createHeader('费用分成', level + 1));
    const feeList = [
      ['次数', '百分比', '股份', '费用'],
    ];
    feeList.push([
      ' ',
      fa.fee.creator.percent,
      fa.fee.creator.equity,
      formatCurrency(fa.fee.creator.fee),
    ]);
    feeList.push([
      ' ',
      `${fa.fee.platform.percent * 100}%`,
      fa.fee.platform.equity,
      formatCurrency(fa.fee.platform.fee),
    ]);
    fa.fee.operator.forEach((singleOpertor, index) => {
      feeList.push(
        [
          `第${index}次`,
          `${singleOpertor.percent * 100}%`,
          singleOpertor.equity,
          formatCurrency(singleOpertor.fee),
        ]);
    });
    output.push(createTable(feeList));
    output.push(createHeader('更新记录', level + 1));
    const comments = await db.collection('comment').find(
      { type: 5, targetId: faId },
      { projection: { name: 1, creatorId: 1, detail: 1, _created: 1 } }).toArray();
    const markdownFileList = [];
    for (const comment of comments) {
      const commentCreator = db.collection('user').findOne({ id: comment.creatorId }, { projection: { name: 1 } });
      output.push(createHeader(comment.name, level + 2));
      const time = moment.unix(comment.time).format('YYYY-MM-DD HH:mm');
      output.push(`作者:${commentCreator.name || '未知'}  时间:${time}`);
      const commentDict = downloadAndRename(comment.detail, req);
      markdownFileList.push(...commentDict.markdownFileList);
      output.push(`${commentDict.data}`);
    }
    output.push(createHeader('笔记', level + 1));
    const notes = await db.collection('note').find({ type: 5, targetId: fa.id, creatorId: userId }).toArray();
    for (const note of notes) {
      const noteCreator = await db.collection('user').findOne({ id: note.creatorId }, { projection: { name: 1 } });
      output.push(createHeader(note.name, level + 2));
      const time = moment.unix(note.time).format('YYYY-MM-DD HH:mm');
      output.push(`作者:${noteCreator.name || '未知'}  时间:${time}`);
      const nodeDict = downloadAndRename(note.detail, req);
      markdownFileList.push(...nodeDict.markdownFileList);
      output.push(`${nodeDict.data}`);
    }
    const documentName = await getDocumentName(db, faId, req);
    const dataDict = { content: output.join('\n\n'), documentName, filename: fa.name, markdownFileList };
    return dataDict;
  } catch (error) {
    const message = `fail to find project ${error}`;
    console.error(message);
    return '';
  }
}


/**
 * 获取相关文档相关内容
 *
 * @param targetId 对象id
 * @param db mongodb 对象
 * @param req request object
 */
async function getDocumentName(db, targetId, req) {
  const documents = await db.collection('document').find({ targetId }, { projection: { name: 1, url: 1 } }).toArray();
  const documentName = [];
  for (const document of documents) {
    // 提取文档
    let filename = document.name;
    if (documentName.indexOf(filename) >= 0) {
      const fileObject = document.name.match(/^(.*)\.(\w+)$/);
      filename = `${fileObject[1]}${uuid4().slice(0, 4)}.${fileObject[2]}`;
    }
    await getDocument(document.url, filename, req);
    documentName.push(filename);
  }
  return documentName;
}

/**
 * 获取相关文档文件
 *
 * @param url 数据链接
 * @param fileName 文件名称
 * @param req request object
 */
async function getDocument(url, fileName, req) {
  /* eslint-disable compat/compat */
  const options = {
    url,
    headers: {
      Host: 'buttondata.oss-cn-shanghai.aliyuncs.com',
      Referer: req.headers.referer,
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36',
    },
  };

  const readStream = request.get(options);
  const writeStream = fs.createWriteStream(fileName);
  let resolve = null;
  let reject = null;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  readStream.pipe(writeStream);
  readStream.on('error', (err) => {
    console.log(`错误信息:${err}`);
    writeStream.end();
    reject();
  });
  writeStream.on('finish', () => {
    console.log('文件写入成功');
    writeStream.end();
    resolve();
  });
  await promise;
}

/**
 * 转化成pdf，并调用打包zip
 *
 * @param dataDict 数据对象
 * @param res response object
 */
async function mardkownToPdf(dataDict, res) {
  const filename = `${uuid4()}.pdf`;
  const result = `${__dirname}/${filename}`;
  const input = `${__dirname}/${uuid4()}.md`;
  const args = `-f markdown -t latex --pdf-engine=xelatex -V geometry:margin=.5in --template ./user.latex -o ${result}`;
  fs.writeFileSync(input, dataDict.content, (err) => {
    if (err) {
      console.error(err);
    }
  });
  // 转化成pdf
  await pandoc(input, args);
  // 删除markdown
  fs.unlink(input, (err1) => {
    if (err1) {
      console.error(err1);
      return;
    }
    console.log(`${input} is deleted`);
  });
  for (const file of dataDict.markdownFileList) {
    fs.unlink(file, (err1) => {
      if (err1) {
        console.error(err1);
        return;
      }
      console.log(`${input} is deleted`);
    });
  }
  await zipAndSend(dataDict, result, input, filename, args, res);
}

/**
 * 打包zip，并发送前端
 *
 * @param dataDict 数据对象
 * @param result pdf文件全路径
 * @param input 传入的markdown文件名
 * @param filename pdf文件名
 * @param args 转pdf,docx所需要的参数
 * @param res response object
 */
async function zipAndSend(dataDict, result, input, filename, args, res) {
  // 写markdown文件
  try {
    // 添加zip
    const zipResult = await addFileToZip(filename, dataDict);
    // 删除docx
    fs.unlink(result, (err2) => {
      if (err2) {
        console.error(err2);
        return;
      }
      console.log(`${result} is deleted`);
    });
    res.sendFile(zipResult, null, (err1) => {
      if (err1) {
        console.error(err1);
        return;
      }
      // 删除zip
      fs.unlink(zipResult, (err2) => {
        if (err2) {
          console.error(err2);
          return;
        }
        console.log(`${zipResult} is deleted`);
      });
    });
  } catch (e) {
    fs.unlink(input, (err1) => {
      if (err1) {
        console.error(err1);
        return;
      }
      console.log(`${input} is deleted`);
    });
    // 删除docx
    fs.unlink(result, (err2) => {
      if (err2) {
        console.error(err2);
        return;
      }
      console.log(`${result} is deleted`);
    });
    throw e;
  }
}

/**
 * 转化成docx，并调用打包zip
 *
 * @param dataDict 数据对象
 * @param res response object
 */
async function mardkownToDocx(dataDict, res) {
  const filename = `${uuid4()}.docx`;
  const result = `${__dirname}/${filename}`;
  const input = `${__dirname}/${uuid4()}.md`;
  const reference = `${__dirname}/reference.docx`;
  const args = `-f markdown -t docx --reference-doc=${reference} -o ${result}`;
  fs.writeFileSync(input, dataDict.content, (err) => {
    if (err) {
      console.error(err);
    }
  });
  // 转化成docx
  await pandoc(input, args);
  // 删除markdown
  fs.unlink(input, (err1) => {
    if (err1) {
      console.error(err1);
      return;
    }
    console.log(`${input} is deleted`);
  });
  for (const file of dataDict.markdownFileList) {
    fs.unlink(file, (err1) => {
      if (err1) {
        console.error(err1);
        return;
      }
      console.log(`${input} is deleted`);
    });
  }
  await zipAndSend(dataDict, result, input, filename, args, res);
}

/**
 * 添加zip文件
 *
 * @param filename 设定的数据文件名
 * @param dataDict content markdown文本, documentName 相关文档名, filename: 输出的相关数据名
 */
async function addFileToZip(filename, dataDict) {
  const zip = new JSZip();
  const docxData = fs.readFileSync(filename);
  for (const documentName of dataDict.documentName) {
    const documentData = fs.readFileSync(documentName);
    await zip.file(`Enclosure/${documentName}`, documentData, { base64: true });
    fs.unlink(documentName, (err2) => {
      if (err2) {
        console.error(err2);
        return;
      }
      console.log(`${documentName} is deleted`);
    });
  }
  const fileType = filename.match(/^.*\.(\w+)$/);
  zip.file(`${dataDict.filename}.${fileType[1]}`, docxData, { base64: true });
  // 调用zip中的generateNodeStream方法，通过管道方式打包导出文件
  const zipName = `${uuid4()}.zip`;
  const content = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(zipName, content, err => console.error(err));
  return `${__dirname}/${zipName}`;
}

/**
 * Prints a document.
 *
 * @param targetId the target document, which can be a project, a task or a
 *    workflow.
 * @param type type of the document
 *    0 user [unused]
 *    1 project
 *    2 product [unused]
 *    3 task
 *    4 workflow
 *    5 comment [unused]
 *    6 fa
 * @param userId id of user making this request. Used for permission checking
 * @param format format of the print
 *    0 pdf [not yet supported]
 *    1 word
 *    2 excel [not yet supported]
 *    3 power point [not yet supported]
 * @param embedAttachment shall include the attachment in the output
 * @param res response object
 * @param req request object
 */
async function print(targetId, type, userId, format, embedAttachment, res, req) {
  try {
    let url = 'alpha.button.tech';
    if (req.host === 'auth.button.tech') {
      url = 'www.button.tech';
    }
    // TODO: check userId is log in and its permission
    const db = (await mongo).db('data');
    let dataDict = null;
    switch (type) {
      case constant.PRINT.TARGET_TYPE.project:
        // for project
        dataDict = await projectToMarkdown(targetId, db, url, req);
        break;
      case constant.PRINT.TARGET_TYPE.product:
        // for product
        dataDict = await productToMarkdown(targetId, db, url, req);
        break;
      case constant.PRINT.TARGET_TYPE.task:
        // for task
        dataDict = await taskToMarkdown(targetId, db, url, req);
        break;
      case constant.PRINT.TARGET_TYPE.workflow:
        // for workflow
        // targetId is id of an task, but we need to find all related task
        // with the same creator, project and parent.
        dataDict = await workflowToMarkdown(targetId, db, url, req);
        break;
      case constant.PRINT.TARGET_TYPE.fa:
        // for fa
        dataDict = await faToMarkdown(targetId, userId, db, url, req);
        break;
      default:
        setResult(res, 400,
          { message: `type=${format} is not supported` });
        return;
    }
    if (Object.keys(dataDict).length === 0) {
      setResult(res, 400, { message: 'the data is not exist' });
      return;
    }
    switch (format) {
      case constant.PRINT.FILE_FORMAT.pdf:
        // pdf
        mardkownToPdf(dataDict, res);
        break;
      case constant.PRINT.FILE_FORMAT.docx:
        // word
        mardkownToDocx(dataDict, res);
        break;
      default:
        setResult(res, 400,
          { message: `unsupported format ${format}` });
        return;
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

module.exports = {
  print,
  getDocument,
};
