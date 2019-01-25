const puppeteer = require('puppeteer');
const constant = require('button-constant');
const { setResult, deepCopy } = require('./utility');
const { mongo } = require('./server');
const uuid4 = require('uuid/v4');

/**
 * 发送请求，获取每个专利信息详情的url
 *
 * @param name 专利名称
 * @param type 专利类型
 * @param targetId projectId or userId
 * @param res response Object
 */
/* eslint-disable no-await-in-loop */
async function getPatentInfo(name, type, targetId, res) {
  const url = `https://patents.google.com/?assignee=${name}&oq=${name}`;
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    let patentNumList = await getPatentUrl(page, url);
    const resultNum = await page.$eval('#count > div.layout.horizontal.style-scope.search-results > span.flex.style-scope.search-results', x => x.innerText);
    const num = resultNum.match(/(\d+) results$/)[1];
    const pageTotalList = [...Array(parseInt(num / 10, 10)).keys()];
    let pageUrl = null;
    for (const pageNum of pageTotalList) {
      if (pageNum !== 0) {
        pageUrl = `${url}&page=${pageNum}`;
        patentNumList = patentNumList.concat(await getPatentUrl(page, pageUrl));
      }
    }
    let patentList = [];
    for (const patentNum of patentNumList) {
      const patentUrl = `https://patents.google.com/${patentNum}?assignee=assignee=${name}&oq=${name}`;
      await page.goto(patentUrl);
      await page.waitFor(2000);
      patentList = await pageParse(page, type, targetId, patentList);
    }
    const db = (await mongo).db('data');
    const result = await db.collection('patent').insertMany(patentList);
    if (result.result.ok) {
      const message = 'get patent success';
      setResult(res, 200, { message });
    }
    browser.close();
  } catch (e) {
    browser.close();
    const message = 'failed get patent';
    setResult(res, 500, { message });
  }
}

/**
 * 发送请求，获取每个专利信息详情的url
 *
 * @param page page object
 * @param url 搜索页面每页的url
 */
/* eslint-disable no-undef */
async function getPatentUrl(page, url) {
  await page.goto(url);
  await page.waitFor(2000);
  const patentNumList = await page.evaluate(() => {
    const aa = document.querySelectorAll('.result-title.style-scope.search-result-item');
    return Array.from(aa).map(a => a.dataset.result);
  });
  return patentNumList;
}

/**
 * 解析每个专利详情页面
 *
 * @param page page object
 * @param type patent类型
 * @param targetId projectId or userId
 * @param patentList 用于存放专利信息
 */
async function pageParse(page, type, targetId, patentList) {
  const data = await page.evaluate(() => {
    const aa = document.querySelectorAll('dd.style-scope.patent-result > state-modifier >a.style-scope.state-modifier');
    return Array.from(aa).map(a => a.innerText);
  });
  // const time = await page.$eval('.style-scope.state-modifier', x => x.innerText);
  const timeString = data.pop();
  const time = parseInt(new Date(timeString).getTime() / 1000, 10);
  const name = await page.$eval('#title', x => x.innerText);
  const abstract = await page.$eval('#text > abstract > div', x => x.innerText);
  const detail = await page.$eval('.description.style-scope.patent-text', x => x.innerText);
  const patentDict = Object.assign(
    deepCopy(constant.PATENT.TEMPLATE),
    {
      id: uuid4(),
      targetId,
      title: name,
      time,
      type,
      abstract,
      detail,
      credit: 0,
    }
  );
  patentList.push(patentDict);
  return patentList;
}

module.exports = getPatentInfo;
