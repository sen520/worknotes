[官方中文API](https://zhaoqize.github.io/puppeteer-api-zh_CN/#/?id=%e6%a6%82%e8%bf%b0)

npm i --save puppeteer --ignore-scripts    忽略安装谷歌浏览器

记得要搭配 async  --- await 使用



以下是示例，可能由于版本的原因部分功能已经被移除


```js
const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');

async function spider(){
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    // 若是手动下载的chromium需要指定chromium地址, 默认引用地址为 /项目目录/node_modules/puppeteer/.local-chromium/
    executablePath: xxx,
    //设置超时时间
    timeout: 15000,
    //如果是访问https页面 此属性会忽略https错误
    ignoreHTTPSErrors: true,
    // 打开开发者工具, 当此值为true时, headless总为false
    devtools: false,
    // 关闭headless模式, 不会打开浏览器
    headless: false
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.crunchbase.com/organization/netflix');
  } catch (e) {
    if ( e instanceof TimeoutError){  // 捕获超时error
      console.log('time out and try again')
    }
  }

  // 设置页面大小
  page.setViewport({
      width: 1376,
      height: 768,
  });

  await page.goto('https://www.baidu.com');
  await page.waitForNavigation({ timeout: 60000 });// 等待不再有网络连接

  // 保存截图
  await page.screenshot({
    path: 'path/to/saved.png',
  });

  // 保存网页为pdf
  await page.pdf({
    path: 'path/to/saved.pdf',
    format: 'A4', // 保存尺寸
  });

  // ===========================执行脚本===============================
  // 获取上下文句柄
  const htmlHandle = await page.$('html');
  // 执行计算
  const html = await page.evaluate(body => body.outerHTML, htmlHandle);
  // 销毁句柄
  await htmlHandle.dispose();

  // ===========================自动添加表单===============================
  // 聚焦搜索框
  // await page.click('#lst-ib');
  await page.focus('#lst-ib');
  // 输入搜索关键字
  await page.type('辣子鸡', {
     delay: 1000, // 控制 keypress 也就是每个字母输入的间隔
  });
  // 回车
  await page.press('Enter');

  const a = await page.$$eval('#u1 > a:nth-child(3)',x => x.map(a =>a.innerText))
  const a1 = await page.$eval('#u1 > a:nth-child(3)',x => x.innerText)
  console.log(a)
  console.log(a1)
  // 可以发现a是一个列表，a1是一个文本
  // page还支持xpath输入，详细可以查看上方官网API
}
```

