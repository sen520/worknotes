const uuid4 = require('uuid/v4');
const moment = require('moment');
const request = require('request');
const cheerio = require('cheerio');
const { promisify } = require('util');
const puppeteer = require('puppeteer');
const { mongo, mongoProduction } = require('./server');
const { setResult, deepCopy } = require('./utility');
const userAgents = require('./userAgents');
const constant = require('button-constant');
const { newPermission } = require('./permission');
const { sendEmailBody } = require('./mail');

let requestNum = 0;
const PROJECT_STAGE = {
  SEED: { value: 0, ch: '种子轮', en: 'Seed' },
  'SERIES A': { value: 2, ch: 'A', en: 'A' },
  'SERIES B': { value: 3, ch: 'B', en: 'B' },
  'SERIES C': { value: 4, ch: 'C', en: 'C' },
  'SERIES D': { value: 5, ch: 'D', en: 'D' },
  'SERIES E': { value: 6, ch: 'E', en: 'E' },
  ACQUIRED: { value: 12, ch: '被收购', en: 'Acquired' },
};

/**
 * 如果项目信息获取成功，发送成功邮件
 *
 * @param db 数据库对象
 * @param userId 用户id
 * @param projectDict 项目对象
 * @param production 判断是哪个服务器
 */
async function sendSuccessEmail(db, userId, projectDict, production) {
  const url = production ? 'https://www.button.tech/product/fda-project/' : 'https://alpha.button.tech/product/fda-project/';
  console.log(url);
  const fullUrl = url + projectDict.id;
  const user = await db.collection('user').findOne({ id: userId });
  const { email } = user;
  const body = `<h1>Dear ${email} Sir/Madam</h1>
<p>Thank you for using Button Platform. The project ${projectDict.website} that you previously requested to import at the Button Platform has been retrieved successfully and the website of the project is ${fullUrl}</p>
<p>Thank you!</p>
<h1>尊敬的 ${email} 先生/女士（用户）：</h1>
<p>您好！</p>
<p>您在巴特恩数据平台提交的导入 ${projectDict.website} 的数据信息已经获取成功，项目的链接为${fullUrl}</p>
<p>感谢您注册使用巴特恩数据平台，祝您愉快！</p>`;
  const subject = 'Verify Email from Button Platform';
  sendEmailBody(email, subject, body);
}

/**
 * 如果项目信息获取失败，发送失败邮件
 *
 * @param db 数据库对象
 * @param userId 用户id
 * @param projectUrl 项目链接
 */
async function sendFailEmail(db, userId, projectUrl) {
  const user = await db.collection('user').findOne({ id: userId });
  const { email } = user;
  const body = `<h1>Dear ${email} Sir/Madam</h1>
<p>I am sorry that the project for ${projectUrl} you requested to import in the Baton data platform may have failed to be fetched for a number of reasons.</p>
<p>Thank you!</p>
<h1>尊敬的 ${email} 先生/女士（用户）：</h1>
<p>您好！</p>
<p>非常抱歉，您在巴特恩数据平台提交的导入 ${projectUrl} 的数据信息可能由于一些原因导致获取失败。</p>
<p>感谢您注册使用巴特恩数据平台，祝您愉快！</p>`;
  const subject = 'Verify Email from Button Platform';
  sendEmailBody(email, subject, body);
}

/**
 * 获取请求头userAgent
 *
 * @param userAgentsList userAgent数组
 */
function getUserAgent(userAgentsList) {
  let num = parseInt(Math.random() * userAgentsList.length, 10);
  if (num === userAgentsList.length) {
    num = userAgentsList.length - 1;
  }
  const userAgent = userAgentsList[num];
  return userAgent;
}

/**
 * 从Angel上获取信息
 *
 * @param creatorId 用户id
 * @param projectUrl 公司信息的链接
 * @param production 判断使用哪个数据库
 * @param res response object
 */
async function projectFromAngel(creatorId, projectUrl, production, res) {
  const userAgent = getUserAgent(userAgents);
  const db = production ? (await mongo).db('data') : (await mongoProduction).db('data');
  try {
    const projectUrlHost = projectUrl.split('/')[2];
    if (projectUrlHost !== 'angel.co' && projectUrlHost !== 'www.angel.co') {
      const message = `The URL ${projectUrl} you entered is incorrect`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const projectResult = await db.collection('project').findOne({ website: projectUrl });
    if (projectResult) {
      const message = `the project ${projectResult.name} already exists`;
      console.log(message);
      setResult(res, 200, { id: projectResult.id });
      return;
    } else {
      const message = `the project ${projectUrl} In the process of obtaining, once completed, we will notify you via email`;
      console.log(message);
      setResult(res, 200, { message });
    }
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 去除ssl验证
    const body = await sendRequest(projectUrl, userAgent);
    if (!body) await sendFailEmail(db, creatorId, projectUrl);
    const mainHtml = cheerio.load(body, { decodeEntities: false });
    const projectDict = createProjectFromAngel(mainHtml, creatorId, projectUrl);
    const href = mainHtml('div.section.team > div > div > div > a');
    const teamList = [];
    const nameList = [];
    for (let i = 0; i < href.length; i += 1) {
      const hrefUrl = `https://angel.co${href[i].attribs.href}`;
      try {
        /* eslint-disable no-await-in-loop */
        const teamBody = await sendRequest(hrefUrl, userAgent);
        if (!teamBody) return;
        const html = cheerio.load(teamBody, { decodeEntities: false });
        const jsonStr = JSON.parse(html.text())['startup_roles/startup_profile'];
        const jsonLen = jsonStr.length;
        for (let j = 0; j < jsonLen; j += 1) {
          const htmlStr = jsonStr[j].html;
          const teamHtml = cheerio.load(htmlStr, { decodeEntities: false });
          const name = teamHtml('body > div > div > div.text > div.name ').text();
          const userUrl = teamHtml('body > div > div > div.text > div.name > a ')[0].attribs.href;
          const positions = teamHtml('body > div > div > div.text > div.role_title').text();
          const logo = teamHtml('body > div > div > div.photo > a > img')['0'].attribs.src;
          const team = { name, logo, userUrl, positions };
          teamList.push(team);
          nameList.push(['职位', team.positions]);
          nameList.push(['姓名', team.name]);
        }
      } catch (e) {
        console.log(e);
      }
    }
    const nameStr = createTable(nameList);
    projectDict.detail.team = nameStr;
    await createProjectWithPermission(projectDict, db, creatorId, projectUrl, res);
    const message = 'add company info to the project ';
    console.log(message);
    await sendSuccessEmail(db, creatorId, projectDict, production);
    await getAndSaveInvestmentFromAngel(mainHtml, projectDict, db);
    await saveUserAndTeam(teamList, projectDict, db);
  } catch (e) {
    const message = `fail to get info from the ${projectUrl} website`;
    console.error(message);
    await sendFailEmail(db, creatorId, projectUrl);
  }
}

/**
 * 获取和保存投资人信息
 *
 * @param mainHtml html对象
 * @param projectDict project对象
 * @param db 数据库对象
 */
async function getAndSaveInvestmentFromAngel(mainHtml, projectDict, db) {
  const div = mainHtml('div.dsss17.startups-show-sections.fss49.startup_rounds._a._jm > ul').html();
  if (!div) return;
  const divList = div.split('</li>');
  for (let i = 0; i < divList.length; i += 1) {
    if (divList[i] !== '') {
      const investHtml = cheerio.load(divList[i], { decodeEntities: false });
      const amountGet = investHtml('div.details.inner_section > div.raised ').text().trim();
      const investurl = investHtml('div.details.inner_section > div.raised > a');
      const timeNormal = investHtml('div.details.inner_section > div.header > div.date_display').text();
      const investors = investHtml('div.participant.g-lockup > div.text > div.name').text().split('\n\n');
      const urls = investHtml('div.participant_list.inner_section > div > div.text > div.name > a');
      const logo = investHtml('div.participant_list.inner_section > div > div.photo > a > img');
      if (amountGet) {
        let amount = 0;
        try {
          const amountStr = amountGet.split('$')[1];
          amount = parseInt(amountStr.split(',').join(''), 10);
        } catch (e) {
          // pass
        }
        const time = parseInt(new Date(timeNormal).getTime() / 1000, 10);
        await saveInvestmentFromAngel(
          investors,
          logo,
          investurl,
          urls,
          time,
          amount,
          projectDict,
          db);
      }
    }
  }
}


/**
 * 修改格式为markdown表格格式
 *
 * @param table 确定格式的数组
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
 * 发送request请求
 *
 * @param url 请求地址
 * @param userAgent 请求UA
 */
async function sendRequest(url, userAgent) {
  const options = {
    url,
    headers: {
      'User-Agent': userAgent,
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      Host: 'angel.co',
      Referer: url,
      'X-Requested-With': 'XMLHttpRequest',
    },
    gzip: true,
    encoding: null,
    timeout: 30000,
  };
  const requestPromise = promisify(request);
  try {
    const response = await requestPromise(options);
    if (response === undefined) {
      const message = `no response from the ${url} website`;
      console.error(message);
      return;
    }
    if (response.statusCode === 200) {
      return response.body;
    } else {
      const message = `fail to get info from the ${url} website, response code = ${response.statusCode}`;
      console.error(message);
    }
  } catch (error) {
    const message = `fail to get info from the ${url} website`;
    console.error(message);
  }
}

/**
 * 创建项目对象
 *
 * @param mainHtml html对象
 * @param creatorId 用户id
 * @param projectUrl 公司信息的链接
 * @return projectDict 项目对象
 */
function createProjectFromAngel(mainHtml, creatorId, projectUrl) {
  const projectDict = deepCopy(constant.PROJECT.TEMPLATE);
  projectDict.id = uuid4();
  const logo = mainHtml('div.photo.subheader-avatar > img');
  projectDict.logo = logo['0'].attribs.src;
  projectDict.name = mainHtml('h1').text().trim() || '';
  projectDict.address = mainHtml('span.js-location_tags').text();
  const key = mainHtml('span.js-market_tags').text();
  projectDict.keyword = key.split('·');
  projectDict.website = mainHtml('span.link.s-vgRight0_5 > a').text();
  projectDict.detail.introduction = mainHtml('div.show.windows').text();
  projectDict.detail.product = mainHtml('div.product_desc.editable_region').text();
  projectDict.creatorId = creatorId;
  projectDict.website = projectUrl;
  const stageName = mainHtml('div.header > div.type').text().split('\n\n')[0];
  if (stageName) {
    const status = stageName.split('\n')[1].toUpperCase();
    if (Object.prototype.hasOwnProperty.call(PROJECT_STAGE, status)) {
      projectDict.stage = PROJECT_STAGE[status].value;
    }
  } else {
    projectDict.stage = 11;
  }

  return projectDict;
}

/**
 * 保存投资人信息
 *
 * @param investors 投资人列表
 * @param logo 投资人logo
 * @param investurls 投资信息url
 * @param urls 投资人连接
 * @param time 投资时间
 * @param amount 投资金额
 * @param projectDict 项目对象
 * @param projectDict 项目对象
 * @param db 数据库对象
 */
async function saveInvestmentFromAngel(
  investors,
  logo,
  investurls,
  urls,
  time,
  amount,
  projectDict,
  db) {
  for (let i = 0; i < investors.length; i += 1) {
    if (investors[i] !== '') {
      const investmentDict = Object.assign(
        deepCopy(constant.INVESTMENT.TEMPLATE),
        {
          name: investors[i].trim(),
          projectId: projectDict.id,
          id: uuid4(),
          amount,
          time,
        });
      try {
        investmentDict.url = investurls[0].attribs.href;
      } catch (e) {
        investmentDict.url = '';
      }
      const userResult = await db.collection('user').findOne({ website: urls[i].attribs.href });
      if (userResult) {
        investmentDict.userId = userResult.id;
      } else {
        const userDict = Object.assign(
          deepCopy(constant.USER.TEMPLATE),
          {
            website: urls[i].attribs.href,
            name: investors[i].trim(),
            creationTime: moment().unix(),
            logo: logo[i].attribs.src,
            id: uuid4(),
          }
        );
        db.collection('user').insertOne(userDict);
        investmentDict.userId = userDict.id;
      }
      db.collection('investment').insertOne(investmentDict);
    }
  }
}

/**
 * 存储团队成员信息
 *
 * @param teamList 团队成员列表
 * @param projectDict 项目对象
 * @param db 数据库对象
 */
async function saveUserAndTeam(teamList, projectDict, db) {
  for (let i = 0; i < teamList.length; i += 1) {
    const teamDict = Object.assign(
      deepCopy(constant.FOUND.TEMPLATE),
      {
        projectId: projectDict.id,
        role: teamList[i].positions,
        id: uuid4(),
      }
    );
    const userDict = Object.assign(
      deepCopy(constant.USER.TEMPLATE),
      {
        name: teamList[i].name.trim(),
        creationTime: moment().unix(),
        company: projectDict.name,
        id: uuid4(),
      }
    );
    let userResult = null;
    if (teamList[i].userurl === undefined) {
      userResult = await db.collection('user').findOne({ name: teamList[i].name });
      if (userResult) {
        teamDict.userId = userResult.id;
      } else {
        db.collection('user').insertOne(userDict);
      }
    } else {
      userResult = await db.collection('user').findOne({ website: teamList[i].userurl });
      if (userResult) {
        teamDict.userId = userResult.id;
      } else {
        userDict.website = teamList[i].userUrl;
        userDict.logo = teamList[i].logo;
        db.collection('user').insertOne(userDict);
        teamDict.userId = userDict.id;
      }
    }
    db.collection('found').insertOne(teamDict);
  }
}

/**
 * 从国家企业信用信息公示系统上获取信息
 *
 * @param creatorId 用户id
 * @param projectUrl 公司信息的链接
 * @param production 判断使用哪个数据库
 * @param res response object
 */
async function projectFromGsxt(creatorId, projectUrl, production, res) {
  const db = production ? (await mongo).db('data') : (await mongoProduction).db('data');
  try {
    const projectUrlHost = projectUrl.split('/')[2];
    if (projectUrlHost !== 'www.gsxt.gov.cn' && projectUrlHost !== 'gsxt.gov.cn') {
      const message = `The URL ${projectUrl} you entered is incorrect`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const projectResult = await db.collection('project').findOne({ website: projectUrl });
    if (projectResult) {
      const message = `the project ${projectResult.name} already exists`;
      console.log(message);
      setResult(res, 200, { id: projectResult.id });
      return;
    } else {
      if (requestNum > 10) {
        const message = 'server is too busy';
        console.error(message);
        setResult(res, 500, { message });
        return;
      }
      const message = `the project ${projectUrl} In the process of obtaining, once completed, we will notify you via email`;
      console.log(message);
      setResult(res, 200, { message });
    }
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    requestNum += 1;
    try {
      const page = await browser.newPage();
      await page.goto('http://www.gsxt.gov.cn/index.html');
      await page.waitForNavigation({ timeout: 60000 });// 等待不再有网络连接
      await page.goto(projectUrl);
      await getProjectInfoFromGsxt(page, creatorId, projectUrl, browser, db, production, res);
    } catch (e) {
      const message = `fail to open the ${projectUrl} website`;
      console.error(message);
      await sendFailEmail(db, creatorId, projectUrl);
      requestNum -= 1;
    }
  } catch (e) {
    const message = `fail to get info from the ${projectUrl} website`;
    console.error(message);
    await sendFailEmail(db, creatorId, projectUrl);
    requestNum -= 1;
  }
}

/**
 * 获取基本页面信息
 *
 * @param page html对象
 * @param creatorId 用户id
 * @param projectUrl 项目url
 * @param browser 浏览器对象
 * @param db 数据库对象
 * @param production 判断是哪个服务器
 * @param res response object
 */
async function getProjectInfoFromGsxt(page, creatorId, projectUrl, browser, db, production, res) {
  const companyName = await page.$$eval('h1', x => x.map(a => a.innerText)[0]);
  const detailIntroduction = await page.$eval('#primaryInfo > div', x => x.innerText);
  const key = await page.$eval('#primaryInfo > div > div.overview > dl:nth-child(13) > dd', x => x.innerText);
  const keyword = key.split('；');
  const timeGet = await page.$eval('#primaryInfo > div > div.overview > dl:nth-child(6) > dd', x => x.innerText);
  const time = await timeGetTotime(timeGet);
  const address = await page.$eval('#primaryInfo > div > div.overview > dl:nth-child(12) > dd', x => x.innerText);
  const projectDict = Object.assign(
    deepCopy(constant.PROJECT.TEMPLATE),
    {
      id: uuid4(),
      name: companyName,
      abstract: detailIntroduction,
      keyword,
      time,
      website: projectUrl,
      address,
      creatorId,
    }
  );
  await getInvestorsAndTeamFromGsxt(
    page,
    creatorId,
    projectUrl,
    projectDict,
    browser,
    db,
    production,
    res,
  );
}

/**
 * 将中文日期 例如 2018年10月18日 转化为 从1970年1月1日至2018年10月18日 的秒数。
 *
 * @param timeGet 中文日期
 */
function timeGetTotime(timeGet) {
  let time = 0;
  try {
    const regStr = /(\d+)\S(\d+)\S(\d+)\S/;
    const timeStr = timeGet.replace(regStr, '$1/$2/$3');
    time = new Date(timeStr).getTime() / 1000;
  } catch (e) {
    // pass
  }
  if (isNaN(time)) {
    time = 0;
  }
  return time;
}

/**
 * 保存项目，并创建权限
 *
 * @param projectDict 项目对象
 * @param db 数据库对象
 * @param creatorId 用户id
 * @param projectUrl 项目的url
 */
async function createProjectWithPermission(projectDict, db, creatorId, projectUrl) {
  const result = await db.collection('project').insertOne(projectDict);
  if (result.insertedCount < 1) {
    const message = `fails to create project ${projectDict.name}`;
    console.error(message);
    await sendFailEmail(db, creatorId, projectUrl);
    return;
  }
  const permission = newPermission(
    creatorId,
    result.insertedId,
    constant.PERMISSION.RESOURCE_TYPE.project,
    constant.PERMISSION.PERMISSION_TYPE.write);
  await db.collection('permission').insertOne(permission);
  const message = `project ${projectDict.name} created with attachment ${projectUrl}`;
  console.log(message);
}

/**
 * 保存项目，并创建权限
 *
 * @param projectDict 项目对象
 * @param page html对象
 * @param db 数据库对象
 */
async function getInvestmentAndSaveDataFromGsxt(projectDict, page, db) {
  const investornameList = [];
  const tr = await page.$$eval('#needPaging_stock > tbody > tr', x => x.map(a => a.innerHTML));
  for (let i = 0; i < tr.length; i += 1) {
    const investmentDict = Object.assign(
      deepCopy(constant.INVESTMENT.TEMPLATE),
      { id: uuid4() });
    const userDict = Object.assign(
      deepCopy(constant.USER.TEMPLATE),
      { id: uuid4() });
    const num = i + 1;
    const investorname = await page.$$eval(`#needPaging_stock > tbody > tr:nth-child(${num}) > td:nth-child(1)`, x => x.map(a => a.innerText)[0]);
    const investTime = await page.$$eval(`#needPaging_stock > tbody > tr:nth-child(${num}) > td:nth-child(10) > div > table > tbody > tr > td`, x => x.map(a => a.innerText)[0]);
    const amount = await page.$$eval(`#needPaging_stock > tbody > tr:nth-child(${num}) > td:nth-child(9) > div > table > tbody > tr > td`, x => x.map(a => a.innerText)[0]);
    if (investorname === undefined) break;
    if (investTime === undefined) break;
    const userResult = await db.collection('user').findOne({ name: investorname });
    investornameList.push(investorname);
    if (userResult) {
      investmentDict.userId = userResult.id;
    } else {
      investmentDict.userId = userDict.id;
      userDict.name = investorname;
      userDict.creationTime = moment().unix();
      investmentDict.name = userDict.name;
      investmentDict.projectId = projectDict.id;
      investmentDict.amount = (parseInt(amount, 10) / 6.9) * 10000; // 单位更改为美元
      const time = await timeGetTotime(investTime);
      investmentDict.time = time;
      db.collection('user').insertOne(userDict);
    }
    db.collection('investment').insertOne(investmentDict);
  }
  return investornameList;
}

/**
 * 保存项目，并创建权限
 *
 * @param creatorId 用户id
 * @param projectUrl 项目url
 * @param projectDict 项目对象
 * @param page html对象
 * @param browser 浏览器对象
 * @param db 数据库对象
 * @param production 判断是哪个服务器
 * @param res response object
 */
async function getInvestorsAndTeamFromGsxt(
  page,
  creatorId,
  projectUrl,
  projectDict,
  browser,
  db,
  production,
  res) {
  let investornameList = [];
  const team = []; // projectDict team
  const teamLists = []; // 要保存的team信息
  const nameLists = []; // 要保存的成员名字
  let numberOfTrials = 0; // 如果没有数据，控制滚动条下拉次数，
  while (true) {
    /* eslint-disable no-undef, no-loop-func, no-return-assign */
    const preScrollTop = await page.evaluate(() => document.documentElement.scrollTop);
    await page.evaluate(() => document.documentElement.scrollTop += 1000);
    const laterScrollTop = await page.evaluate(() => document.documentElement.scrollTop);
    await page.waitFor(10000);
    if (preScrollTop === laterScrollTop) {
      await page.evaluate(() => document.documentElement.scrollTop -= 500);
      numberOfTrials += 1;
      if (numberOfTrials > 3) {
        break;
      }
    }
    if (team.length === 0) {
      const li = await page.$$eval('#personInfo > ul > li', x => x.map(a => a.innerHTML));
      for (let i = 0; i < li.length; i += 1) {
        const num = i + 1;
        const nameGet = await page.$$eval(`#personInfo > ul > li:nth-child(${num}) > a > div.people-list-div.list${i}`, x => x.map(a => a.innerText)[0]);
        const position = await page.$$eval(`#personInfo > ul > li:nth-child(${num}) > a > div.people-list-position > span`, x => x.map(a => a.innerText)[0]);
        if (nameGet === undefined) break;
        const nameList = nameGet.split('\n');
        let name = '';
        for (let j = 0; j < nameList.length; j += 1) {
          if (nameList[j].length < 4) {
            name += nameList[j];
          }
        }
        if (nameLists.indexOf(name) === -1) {
          teamLists.push({ name, positions: position });
          team.push(['职位', position]);
          team.push(['姓名', name]);
          nameLists.push(name); // 用于去重
        }
      }
      const teamStr = createTable(team);
      /* eslint-disable no-param-reassign */
      projectDict.detail.team = teamStr;
      await createProjectWithPermission(projectDict, db, creatorId, projectUrl, res);
      const message = 'add company info to the project ';
      console.log(message);
      await sendSuccessEmail(db, creatorId, projectDict, production);
      await saveUserAndTeam(teamLists, projectDict, db);
    }
    if (investornameList.length === 0) {
      investornameList = await getInvestmentAndSaveDataFromGsxt(projectDict, page, db);
    }
    if (investornameList.length !== 0 && teamLists.length !== 0) {
      break;
    }
  }
  browser.close();
  requestNum -= 1;
}

module.exports = {
  projectFromAngel,
  projectFromGsxt,
};
