## puppeteer

[使用手册](https://zhaoqize.github.io/puppeteer-api-zh_CN/#/)

[linux使用puppeteer报错](http://cssor.com/centos-puppeteer-visit-page-error-socket-hang-up.html)

Puppeteer是谷歌官方出品的一个通过DevTools协议控制headless Chrome的Node库。可以通过Puppeteer的提供的api直接控制Chrome模拟大部分用户操作来进行UI Test或者作为爬虫访问页面来收集数据。

#### ① 环境和安装

推荐使用7.6以上版本的node

> npm i puppeteer

Puppeteer安装时自带一个最新版本的Chromium，可以通过设置环境变量或者npm config中的`PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`跳过下载。如果不下载的话，启动时可以通过puppeteer.launch([options])配置项中的executablePath指定Chromium的位置。

此外，由于puppeteer安装的chromium被墙，可以修改目标服务器的配置

`npm config set puppeteer_download_host https://storage.googleapis.com.cnpmjs.org`

#### ② 使用示例

`const puppeteer = require('puppeteer');`

```javascript
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://rennaiqian.com');
  await page.screenshot({path: 'example.png'});
  await page.pdf({path: 'example.pdf', format: 'A4'});
  await browser.close();
})();
```

此外 可以不使用callback方法

```javascript
   const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
   const page = await browser.newPage();
   await page.goto('https://www.baidu.com/');
   await page.waitForNavigation({ timeout: 60000 });// 等待不再有网络连接
   await page.goto(projectUrl);
```

其中：

1. 可以关闭无界面模式，可以观察到浏览器的具体操作步骤

   ```javascript
   const browser = await puppeteer.launch({headless: false})
   ```

2. 减慢速度，slowMo选项以指定的毫秒减慢Puppeteer的操作。这是另一个看到发生了什么的方法：

   ```javascript
   const browser = await puppeteer.launch({
     headless:false,
     slowMo:250
   });
   ```

3. 捕获console的输出,通过监听console事件。在page.evaluate里调试代码时这也很方便：

    ```javascript
    page.on('console', msg => console.log('PAGE LOG:', ...msg.args));
    await page.evaluate(() => console.log(`url is ${location.href}`));
    ```

4. 启动详细日志记录，所有公共API调用和内部协议流量都将通过puppeteer命名空间下的debug模块进行记录

   ```
    # Basic verbose logging
    env DEBUG="puppeteer:*" node script.js
   
    # Debug output can be enabled/disabled by namespace
    env DEBUG="puppeteer:*,-puppeteer:protocol" node script.js # everything BUT protocol messages
    env DEBUG="puppeteer:session" node script.js # protocol session messages (protocol messages to targets)
    env DEBUG="puppeteer:mouse,puppeteer:keyboard" node script.js # only Mouse and Keyboard API calls
   
    # Protocol traffic can be rather noisy. This example filters out all Network domain messages
    env DEBUG="puppeteer:*" env DEBUG_COLORS=true node script.js 2>&1 | grep -v '"Network'
   ```

#### ③ 获取内容

###### 1、page.$(selector)

`page.$eval('#primaryInfo > div', x => x.innerText);`

使用css选择器，没有元素匹配返回null，有多个元素匹配返回第一个

###### 2、page.$(selector)

  `const companyName = await page.$$eval('h1', x => x.map(a => a.innerText)[0]);`

使用css选择器，没有元素匹配返回空数组[]。

###### 3、点击事件

```javascript
page.click('CSS选择器');
```

###### 4、输入框输入

```javascript
await page.type('#username', username, { delay: 50 });
await page.type('#password', password, { delay: 50 });
```

#### ④ 爬虫实例

   很多网页通过user-agent来判断设备，可以通过page.emulate(options)来进行模拟。options有两个配置项，一个为userAgent，另一个为viewport可以设置宽度(width)、高度(height)、屏幕缩放(deviceScaleFactor)、是否是移动端(isMobile)、有无touch事件(hasTouch)。

   ```javascript
   const puppeteer = require('puppeteer');
   const devices = require('puppeteer/DeviceDescriptors');
   const iPhone = devices['iPhone 6'];
   
   puppeteer.launch().then(async browser => {
     const page = await browser.newPage();
     await page.emulate(iPhone);
     await page.goto('https://www.example.com');
     // other actions...
     await browser.close();
   });
   ```

   上述代码则模拟了iPhone6访问某网站，其中devices是puppeteer内置的一些常见设备的模拟参数。

   很多网页需要登录，有两种解决方案：

   1. 让puppeteer去输入账号密码
       常用方法：点击可以使用page.click(selector[, options])方法，也可以选择聚焦page.focus(selector)。
       输入可以使用page.type(selector, text[, options])输入指定的字符串，还可以在options中设置delay缓慢输入更像真人一些。也可以使用keyboard.down(key[, options])来一个字符一个字符的输入。
   2. 如果是通过cookie判断登录状态的可以通过page.setCookie(...cookies)，想要维持cookie可以定时访问。