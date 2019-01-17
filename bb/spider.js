const fetch = require('node-fetch');
const { setResult } = require('./utility');
const { mongo } = require('./server');
const config = require('./config.json');

/**
 * 判断应该由哪个url响应
 *
 * @param userId 用户id
 * @param projectUrl 项目链接
 * @param req request object
 * @param res response object
 */
async function getProjectInfo(userId, projectUrl, req, res) {
  const production = req.host === 'auth.button.tech';
  let spiderHost = config.spider.development;
  if (production) spiderHost = config.spider.production;
  const angelList = ['angel.co', 'www.angel.co'];
  const gsxtList = ['www.gsxt.gov.cn', 'gsxt.gov.cn'];
  const requestJson = {
    method: 'POST',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, projectUrl, production }),
  };
  const url = projectUrl.split('/')[2];
  if (angelList.indexOf(url) !== -1) {
    const requestUrl = `https://${spiderHost}/project/import/angellist`;
    await fetchRequest(requestUrl, projectUrl, requestJson, res);
  } else if (gsxtList.indexOf(url) !== -1) {
    const requestUrl = `https://${spiderHost}/project/import/gsxt`;
    await fetchRequest(requestUrl, projectUrl, requestJson, res);
  } else {
    const message = `The URL ${projectUrl} you entered is incorrect`;
    console.error(message);
    setResult(res, 400, { message });
  }
}

/**
 * 发送请求，调用爬虫服务器
 *
 * @param  requestUrl 响应请求的url
 * @param  nameString 项目url或者专利名称
 * @param  requestJson 发送请求的json数据
 * @param res response object
 */
async function fetchRequest(requestUrl, nameString, requestJson, res) {
  /* eslint-disable compat/compat */
  const info = 'Getting information...';
  console.log(info);
  try {
    const result = await fetch(requestUrl, requestJson);
    if (result.ok) {
      const fetchResult = await result.json();
      setResult(res, fetchResult.status, fetchResult);
    } else {
      const message = `fail to get info ${nameString}`;
      console.error(message);
      setResult(res, 500, { message });
    }
  } catch (e) {
    const db = (await mongo).db('data');
    if (nameString.search(/^http/ !== -1)) {
      const result = await db.collection('project').findOne({ website: nameString });
      if (result) {
        setResult(res, 200, { id: result.id });
        return;
      }
    }
    const message = `fail to get info ${nameString} due to ${e.name}/${e.message}`;
    console.error(message);
    setResult(res, 500, { message });
  }
}

/**
 * 发送请求，获取每个专利信息详情的url
 *
 * @param name 专利名称
 * @param type 专利类型
 * @param targetId projectId or userId
 * @param res response Object
 */
/* eslint-disable no-await-in-loop */
async function getPatentInfo(userId, name, type, targetId, res, req) {
  const production = req.host === 'auth.button.tech';
  let spiderHost = config.spider.development;
  if (production) spiderHost = config.spider.production;
  const requestJson = {
    method: 'POST',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, name, type, targetId, production }),
  };
  const requestUrl = `https://${spiderHost}/patent/import/google`;
  await fetchRequest(requestUrl, name, requestJson, res);
}


module.exports = {
  getProjectInfo,
  getPatentInfo,
};
