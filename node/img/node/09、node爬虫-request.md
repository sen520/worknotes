首先，关于node做爬虫这方面没想过，也没敢想过，js竟然还可以做爬虫，可怕

## 0、前期准备

闲话少说，进入正题，首先node爬虫可以有多个库来支持，我选择了两个request、superagent，当然也可以使用http去发送请求，关于js动态加载的，我们可以使用Selenium与PhantomJS 这两种方法这里不介绍，没有用到。

在使用之前，我们先安装几个依赖包

- request 发送请求
- cheerio 分析html
- iconv-lite 用于解码 由于node本身的解码方式是utf-8，但网页可能会有gbk，gb2312等等

此外，一个最重要的东西userAgent，因为爬虫本身就是模仿浏览器进行发送请求，获取页面信息，UA是一个浏览器的标志，每个浏览器都会有自己的UA，所以我们在目录下单独创建了一个文件用于存放UA，这里提供了几个UA供使用

userAgents.js

```js
const userAgents = [
  'Mozilla/5.0(Macintosh;U;IntelMacOSX10_6_8;en-us)AppleWebKit/534.50(KHTML,likeGecko)Version/5.1Safari/534.50',
  'Mozilla/5.0(Windows;U;WindowsNT6.1;en-us)AppleWebKit/534.50(KHTML,likeGecko)Version/5.1Safari/534.50',
  'Mozilla/5.0(compatible;MSIE9.0;WindowsNT6.1;Trident/5.0;',
  'Mozilla/4.0(compatible;MSIE8.0;WindowsNT6.0;Trident/4.0)',
  'Mozilla/4.0(compatible;MSIE7.0;WindowsNT6.0)',
  'Mozilla/5.0(Macintosh;IntelMacOSX10.6;rv:2.0.1)Gecko/20100101Firefox/4.0.1',
  'Mozilla/5.0(WindowsNT6.1;rv:2.0.1)Gecko/20100101Firefox/4.0.1',
  'Opera/9.80(Macintosh;IntelMacOSX10.6.8;U;en)Presto/2.8.131Version/11.11',
  'Mozilla/5.0(Macintosh;IntelMacOSX10_7_0)AppleWebKit/535.11(KHTML,likeGecko)Chrome/17.0.963.56Safari/535.11',
  'Mozilla/4.0(compatible;MSIE7.0;WindowsNT5.1;TencentTraveler4.0)',
  'Mozilla/4.0(compatible;MSIE7.0;WindowsNT5.1;Trident/4.0;SE2.XMetaSr1.0;SE2.XMetaSr1.0;.NETCLR2.0.50727;SE2.XMetaSr1.0)',
  'Mozilla/4.0(compatible;MSIE7.0;WindowsNT5.1;360SE)',
  "Mozilla/5.0 (Linux; U; Android 2.3.6; en-us; Nexus S Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
  "Avant Browser/1.2.789rel1 (http://www.avantbrowser.com)",
  "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/532.5 (KHTML, like Gecko) Chrome/4.0.249.0 Safari/532.5",
  "Mozilla/5.0 (Windows; U; Windows NT 5.2; en-US) AppleWebKit/532.9 (KHTML, like Gecko) Chrome/5.0.310.0 Safari/532.9",
  "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.514.0 Safari/534.7",
  "Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/534.14 (KHTML, like Gecko) Chrome/9.0.601.0 Safari/534.14",
  "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.14 (KHTML, like Gecko) Chrome/10.0.601.0 Safari/534.14",
  "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.20 (KHTML, like Gecko) Chrome/11.0.672.2 Safari/534.20",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.27 (KHTML, like Gecko) Chrome/12.0.712.0 Safari/534.27",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.24 Safari/535.1",
  "Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/15.0.874.120 Safari/535.2",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.36 Safari/535.7",
  "Mozilla/5.0 (Windows; U; Windows NT 6.0 x64; en-US; rv:1.9pre) Gecko/2008072421 Minefield/3.0.2pre",
  "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.10) Gecko/2009042316 Firefox/3.0.10",
  "Mozilla/5.0 (Windows; U; Windows NT 6.0; en-GB; rv:1.9.0.11) Gecko/2009060215 Firefox/3.0.11 (.NET CLR 3.5.30729)",
  "Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6 GTB5",
  "Mozilla/5.0 (Windows; U; Windows NT 5.1; tr; rv:1.9.2.8) Gecko/20100722 Firefox/3.6.8 ( .NET CLR 3.5.30729; .NET4.0E)",
  "Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
  "Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:6.0a2) Gecko/20110622 Firefox/6.0a2",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:7.0.1) Gecko/20100101 Firefox/7.0.1",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:2.0b4pre) Gecko/20100815 Minefield/4.0b4pre",
  "Mozilla/4.0 (compatible; MSIE 5.5; Windows NT 5.0 )",
  "Mozilla/4.0 (compatible; MSIE 5.5; Windows 98; Win 9x 4.90)",
  "Mozilla/5.0 (Windows; U; Windows XP) Gecko MultiZilla/1.6.1.0a",
  "Mozilla/4.8 [en] (Windows NT 5.1; U)",
  "Mozilla/5.0 (Windows; U; Win98; en-US; rv:1.4) Gecko Netscape/7.1 (ax)",
  "HTC_Dream Mozilla/5.0 (Linux; U; Android 1.5; en-ca; Build/CUPCAKE) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
  "Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.2; U; de-DE) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/234.40.1 Safari/534.6 TouchPad/1.0",
  "Mozilla/5.0 (Linux; U; Android 1.5; en-us; sdk Build/CUPCAKE) AppleWebkit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
  "Mozilla/5.0 (Linux; U; Android 2.1; en-us; Nexus One Build/ERD62) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
  "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
  "Mozilla/5.0 (Linux; U; Android 1.5; en-us; htc_bahamas Build/CRB17) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
  "Mozilla/5.0 (Linux; U; Android 2.1-update1; de-de; HTC Desire 1.19.161.5 Build/ERE27) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
  "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Sprint APA9292KT Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
  "Mozilla/5.0 (Linux; U; Android 1.5; de-ch; HTC Hero Build/CUPCAKE) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
  "Mozilla/5.0 (Linux; U; Android 2.2; en-us; ADR6300 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
  "Mozilla/5.0 (Linux; U; Android 2.1; en-us; HTC Legend Build/cupcake) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
  "Mozilla/5.0 (Linux; U; Android 1.5; de-de; HTC Magic Build/PLAT-RC33) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1 FirePHP/0.3",
  "Mozilla/5.0 (Linux; U; Android 1.6; en-us; HTC_TATTOO_A3288 Build/DRC79) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
  "Mozilla/5.0 (Linux; U; Android 1.0; en-us; dream) AppleWebKit/525.10  (KHTML, like Gecko) Version/3.0.4 Mobile Safari/523.12.2",
  "Mozilla/5.0 (Linux; U; Android 1.5; en-us; T-Mobile G1 Build/CRB43) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari 525.20.1",
  "Mozilla/5.0 (Linux; U; Android 1.5; en-gb; T-Mobile_G2_Touch Build/CUPCAKE) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
  "Mozilla/5.0 (Linux; U; Android 2.0; en-us; Droid Build/ESD20) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
  "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Droid Build/FRG22D) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
  "Mozilla/5.0 (Linux; U; Android 2.0; en-us; Milestone Build/ SHOLS_U2_01.03.1) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
  "Mozilla/5.0 (Linux; U; Android 2.0.1; de-de; Milestone Build/SHOLS_U2_01.14.0) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
  "Mozilla/5.0 (Linux; U; Android 3.0; en-us; Xoom Build/HRI39) AppleWebKit/525.10  (KHTML, like Gecko) Version/3.0.4 Mobile Safari/523.12.2",
  "Mozilla/5.0 (Linux; U; Android 0.5; en-us) AppleWebKit/522  (KHTML, like Gecko) Safari/419.3",
  "Mozilla/5.0 (Linux; U; Android 1.1; en-gb; dream) AppleWebKit/525.10  (KHTML, like Gecko) Version/3.0.4 Mobile Safari/523.12.2",
  "Mozilla/5.0 (Linux; U; Android 2.0; en-us; Droid Build/ESD20) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
  "Mozilla/5.0 (Linux; U; Android 2.1; en-us; Nexus One Build/ERD62) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17",
  "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Sprint APA9292KT Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
  "Mozilla/5.0 (Linux; U; Android 2.2; en-us; ADR6300 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
  "Mozilla/5.0 (Linux; U; Android 2.2; en-ca; GT-P1000M Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
  "Mozilla/5.0 (Linux; U; Android 3.0.1; fr-fr; A500 Build/HRI66) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13",
  "Mozilla/5.0 (Linux; U; Android 3.0; en-us; Xoom Build/HRI39) AppleWebKit/525.10  (KHTML, like Gecko) Version/3.0.4 Mobile Safari/523.12.2",
  "Mozilla/5.0 (Linux; U; Android 1.6; es-es; SonyEricssonX10i Build/R1FA016) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
  "Mozilla/5.0 (Linux; U; Android 1.6; en-us; SonyEricssonX10i Build/R1AA056) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
]

module.exports = userAgents
```

建立好之后我们就开始爬虫的基本步骤了，

## 1、分析页面并开始抓取

我们抓取的是国家企业信息公示网的某个特定的企业信息<https://www.szcredit.org.cn/GJQYCredit/GSZJGSPTS/QYGS.aspx?rid=6B553DC2860F51DD7501B40D8BFA3C22925D34646F3F1C5EBA17F44330224BB4> 

当然，开始之前记得导包

```js
const request = require('request');
const uuid4 = require('uuid/uuid4');
const cheerio = require('cheerio');
const userAgents = require('./userAgents');
const iconv = require('iconv-lite');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = "mongodb://localhost:27017/";
const userAgent = userAgents[parseInt(Math.random() * userAgents.length)] //获取UA
console.log(userAgent);
const url = 'https://www.szcredit.org.cn/GJQYCredit/GSZJGSPTS/QYGS.aspx?rid=6B553DC2860F51DD7501B40D8BFA3C22925D34646F3F1C5EBA17F44330224BB4'
```

#### 1、设置请求头（直接在浏览器下F12复制粘贴就好了）

```js
options = {
  url: url,
  headers:{
    'User-Agent': userAgent,
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Host': 'www.szcredit.org.cn'
  },
  gzip:true,
  encoding:null,
  timeout: 3000, //我们在这里设置了一个超时时间3秒，如果没有响应，便不再请求
}
```

#### 2、解析url

因为url是https的请求，所以我们要做一个去除ssl验证的操作

```js
process.env.NODE_TLS_REJECT_UNAUTHORIZED ="0";  // 去除ssl验证
```

#### 3、发送请求

直接上代码

```js
request(options, function (error, response, body) {
  if (response === undefined){ // 这里为了防止因为超时报错
    console.log('timeout')
    return
  }
  if (!error && response.statusCode === 200) {
      // 保存下cookie，接下来会用到
        const cookie = response.headers['set-cookie']; 
      // 解析编码格式，这里就比较坑了，在页面上我们发现编码格式是UTF-8的，但是无论怎么更改编码格式都会乱码。这里我也是尝试了很多次才找到
        let html = iconv.decode(body, 'gbk'); 
      // 解析页面
        const $ = cheerio.load(html, {decodeEntities: false}); 
      // 设置保存的数据及其格式
        const dict = {"id": "", "name": "", "abstract": "", "logo": "", "banner": "", "keyword": [],
          "time": 0, "email": "", "phone": "", "website": "", "address": "", "stage": "", "askFor": 0,
          "share": 0, "evaluation": 0, "credit": 0, "referral": "",
          "detail": {"market": "", "introduction": "", "team": "", "product": "", "business": "", "grant": ""}
        };
      // 接下来就是获取数据和保存数据，数据我们使用的是css选择器来获取
        dict['id'] = uuid4();
        dict['name'] = $('#wucYYZZInfo_qymc').text(); 
        dict['address'] = $('#wucYYZZInfo_zs').text();
        const key = $('#wucYYZZInfo_jyfw').text();
        dict['keyword'] = key.split('；');
        dict['time'] = $('#wucYYZZInfo_clrq').text();
      
      // 这里我们要做一个拼接，把人名和职位放在一个列表中
        // 核心团队 
        const nameSelector = $('#MainPeople > ul:nth-child(1) > li > p:nth-child(1)');
        const positionSelector = $('#MainPeople > ul > li > p:nth-child(2)');

        const names = [];
        for(i=0;i<nameSelector.length;i++){
          names.push(nameSelector[i].children[0].data);
        }

        const positions = [];
        for(i=0;i<positionSelector.length;i++){
          positions.push(positionSelector[i].children[0].data);
        }
        console.log('===================================')
        console.log('name: '+names+'positions: '+positions)
        team = [];
        for(i=0;i<names.length;i++){
          team.push({'name':names[i],'position':positions[i]});
        }
        
        dict['detail']['team'] = team;

        // 公司法人
        const legalPerson = $('#wucYYZZInfo_fddbr').text(); 
        // 核准日期
        const approval = $('#wucYYZZInfo_hzrq').text(); 
        // 营业期限
        const duration = $('#wucYYZZInfo_yyqxz').text(); 
        // 注册号
        const registration = $('#wucYYZZInfo_yyzzhm').text();
        // 公司类型
        const type = $('#wucYYZZInfo_gslx').text(); 
        // 注册资本
        const regCapital = $('#wucYYZZInfo_txtQYYX').text(); 
        // 开始营业时间
        const startTime = $('#wucYYZZInfo_Label1').text(); 
        // 登记机关
        const regAuthor = $('#wucYYZZInfo_djjg').text(); 
        // 登记状态
        const status = $('#wucYYZZInfo_djzt').text(); 
        
        const list = [];
        let investmentUrls = null;
      // 这里我们要点击进入弹出框，获取其中的内容，但是我们看网页格式才发现，这个并不是一个a标签，所以我们通过控制台找到了请求的url
        const td = $('#UpdatePanel2 > div > table > tbody > tr > td:nth-child(5)');
        for(j=0;j<td.length;j++){
          investmentUrl = `https://www.szcredit.org.cn/GJQYCredit/GSZJGSPTS/Detail/wucTZRInfoDetail.aspx?id=`+
          td[j].attribs['data'] +`&recordid=`+td[j].attribs['info']
          options = {
            url: investmentUrl,
            headers:{
              'User-Agent': userAgent,
                // 这里我们事先保存好的cookie就派上用场了，如果我们没有设置cookie，就会发现，我们只能获取到网站的样式，里面并没有数据
              'Cookie':cookie,
              'Accept':`text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8`,
              'Connection':'keep-alive',
              'Referer': url,
            },
          gzip:true,
          encoding:null,
          'accept-encoding':'gzip, deflate' ,
              // 当然这里也设置了超时时间
            timeout: 3000,
          }
          try{
              // 获取到的url发送请求，以便获取到其中的信息
          request(options, function (error, response, body) {
            if(!error && response.statusCode == 200) {
              let html = iconv.decode(body, 'gbk');
              const $= cheerio.load(html,{decodeEntities: false})
              const userDict = {}
              userDict['name'] = $('#GDMC').text()
              userDict['amount'] = $('#RJE').text()
              list.push(userDict)
              if(list.length==j){
                dict['detail']['introduction'] = {'legalPerson': legalPerson, 
                'approval': approval, 'duration': duration, 'registration': registration,
                'type': type, 'regCapital': regCapital, 'startTime': startTime,
                'regAuthor': regAuthor, 'status': status, 'investment': list
                };
                  // 由于node异步的特点，我们只能在刚刚获取到数据的那一刻进行存储，所以在上面做了一次判断，判断是否遍历完成
                MongoClient.connect(mongoUrl, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("data");
                    dbo.collection("site").insertOne(dict, function(err, res) {
                        if (err) throw err;
                        console.log("文档插入成功");
                        db.close();
                    });
                });

              }
            }
          })
          }catch(err) {
              // 这里是为了防止上面的请求超时，而浪费了之前请求到的数据
                MongoClient.connect(mongoUrl, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("data");
                    dbo.collection("site").insertOne(dict, function(err, res) {
                        if (err) throw err;
                        console.log("文档插入成功");
                        console.timeEnd('共花费')
                        db.close();
                    });
                });
          }      
        }
  }else {
    console.log(response.statusCode)
  }
});

```

这样，企业数据我们就抓取到了

## 2、遇到的坑（BUG）

#### 1、网站自身

第一个无非就是网站真的是很。。。访问几次就不行了，正常访问也是，所以这个比较耗时，要有那个运气刚好能进去而且不需要等待

#### 2、获取股东出资

本以为是个a标签，谁知道是一个js加载的算是个ajax请求吧，这样就很烦，而且发送的链接还是一串乱七八糟的数字、字母，通过比对其他企业的信息，我们才发现url变的只有后面的id什么的，好在我们能在上面的标签中获得。

后来才发现原来页面下面也是有出资情况的，不过跟上面对不上，下面的总少那个几个，所以还是省不掉这个麻烦。

#### 3、node异步

这个问题困扰了很久了，目前只会嵌套，递归，网上什么async、事件监听、事件发布/订阅、Generator、Promise啥的对于我这个刚接触node不久的小白来说可能还比较遥远。

#### 4、MongoDB

关于MongoDB存储方面遇到过一次，也就那回事，json格式的数据直接插入，node控制台打印的是object也无所谓，直接插就好了

