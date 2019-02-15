**前后端分离**

​	我们使用php动态渲染页面时，有很多比较麻烦的地方。

- 在前端写好页面以后，需要后台进行修改，意味这后端程序员也需要懂前端的知识，其实渲染的工作应该交给前端来做。
- 前端没有写好页面的话，后端无法开始工作，需要等待前端的页面完成之后才能开始工作，拖延项目的进度。
- 在客户端设备多元化的情况下，后台渲染的页面无法满足所有用户的需求
- 前后端代码混合在一个文件中，项目修改和维护成本高

## 常见数据传输格式

### XML  可拓展的标记语言

> XML是一种标记语言，很类似HTML，其宗旨是用来传输数据，具有自我描述性（固定的格式的数据）。

### 语法规则

1. 必须有一个根元素
2. 不可有空格、不可以数字或.开头、大小写敏感
3. 不可交叉嵌套
4. 属性双引号（浏览器自动修正成双引号了）
5. 特殊符号要使用实体（转义字符）
6. 注释和HTML一样

虽然可以描述和传输复杂数据，但是其解析过于复杂并且体积较大，所以实现开发已经很少使用了。

其解析方式类似于DOM

```xml
<?xml version='1.0'  encoding='utf-8' ?>
<root>
    <person num="1" >
        <name>鹏鹏</name>
        <sex>弯</sex>
        <age>1</age>
        <hobby>飙车</hobby>
        <album>&lt;&lt;老司机的自我修养&gt;&gt;</album>        
    </person>
    <person num='2'>
        <name>春哥</name>
        <sex>男</sex>
        <age>38</age>
        <hobby>修发动机</hobby>
        <album>C语言从入门到放弃</album>        
    </person>
</root>
```



### JSON

>  即 JavaScript Object Notation，另一种轻量级的文本数据交换格式，独立于语言。

####  语法规则

1、数据在名称/值对中
2、数据由逗号分隔(最后一个健/值对不能带逗号)
3、花括号保存对象方括号保存数组
4、使用双引号

#### JSON解析

> JSON数据在不同语言进行传输时，类型为字符串，不同的语言各自也都对应有解析方法，需要解析完成后才能读取

+ Javascript 解析方法

  JSON对象  JSON.parse()、JSON.stringify()；
  ​JSON兼容处理json2.js

+ PHP解析方法


+ json_encode() 、json_decode()
  **总结：** JSON体积小、解析方便且高效，在实际开发成为首选。


​

## AJAX

> 即 Asynchronous Javascript And XML，AJAX 不是一门的新的语言，而是对现有持术的综合利用。

+ 本质:是在HTTP协议的基础上以异步的方式通过js的XMLHttpRequest对象与服务器进行通信。


+ 作用：可以在页面不刷新的情况下，请求服务器，局部更新页面的数据；

### 异步与同步

>  指某段程序执行时不会阻塞其它程序执行，其表现形式为程序的执行顺序不依赖程序本身的书写顺序，相反则为同步。



> 其优势在于不阻塞程序的执行，从而提升整体执行效率。

+ 同步：同一时刻只能做一件事，上一步完成才能开始下一步


+ 异步：同时做多件事，效率更高,做一件事情时，不影响另一件事情的进行。

XMLHttpRequest可以以异步方式的处理程序。

## XMLHttpRequest

> 浏览器内建对象，用于在后台与服务器通信(交换数据) ， 由此我们便可实现对网页的部分更新，而不是刷新整个页面。这个请求是异步，即在往服务器发送请求时，并不会阻碍程序的运行，浏览器会继续渲染后续的结构。



### 发送get请求

XMLHttpRequest以异步的方式发送HTTP请求，因此在发送请求时，一样需要遵循HTTP协议。

```javascript
//使用XMLHttpRequest发送get请求的步骤
//1. 创建一个XMLHttpRequest对象
var xhr = new XMLHttpRequest();
//2. 设置请求行
//第一个参数:请求方式  get/post
//第二个参数:请求的地址 需要在url后面拼上参数列表
xhr.open("get", "08.php?name=hucc");
//3. 设置请求头
xhr.setReqeustHeader('content-type','text/html');
//浏览器会给我们默认添加基本的请求头,get请求时无需设置
//4. 设置请求体
//get请求的请求体为空,因为参数列表拼接到url后面了
xhr.send(null);
```

+ get请求,设置请求行时,需要把参数列表拼接到url后面
+ get请求不用设置请求头
+ get请求的请求体为null



### 发送post请求

```javascript
var xhr = new XMLHttpRequest;
//1. 设置请求行 post请求的参数列表在请求体中
xhr.open("post", "09.php");
//2. 设置请求头, post请求必须设置content-type,不然后端无法获取到数据
xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
//3. 设置请求体
xhr.send("name=hucc&age=18");
```

+ post请求,设置请求行时,参数列表不能拼接到url后面

+ post必须设置请求头中的content-type为application/x-www-form-urlencoded

+ post请求需要将参数列表设置到请求体中.



### 获取响应

HTTP响应分为3个部分，状态行、响应头、响应体。

```javascript
//给xhr注册一个onreadystatechange事件，当xhr的状态发生状态发生改变时，会触发这个事件。
xhr.onreadystatechange = function () {
  if(xhr.readyState == 4){
    //1. 获取状态行
    console.log("状态行:"+xhr.status);
    //2. 获取响应头
    console.log("所有的相应头:"+xhr.getAllResponseHeaders());
    console.log("指定相应头:"+xhr.getResponseHeader("content-type"));
    //3. 获取响应体
    console.log(xhr.responseText);
  }
}
```

**readyState** 

> readyState:记录了XMLHttpRequest对象的当前状态

```javascript
//0：请求未初始化（还没有调用 open()）。
//1：请求已经建立，但是还没有发送（还没有调用 send()）。
//2：请求已发送，正在处理中
//3：请求在处理中；通常响应中已有部分数据可用了，但是服务器还没有完成响应的生成。
//4：响应已完成；您可以获取并使用服务器的响应了。(我们只需要关注状态4即可)
```



### 案例

【判断用户名是否存在】

【成绩查询案例】

【聊天机器人案例】



## 兼容性处理

```javascript
var xhr = null;
if(XMLHttpRequest){
  //现代浏览器
  xhr = new  XMLHttpRequest();
}else{
  //IE5.5支持
  xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
}
```


## 封装ajax工具函数

> 每次发送ajax请求，其实步骤都是一样的，重复了大量代码，我们完全可以封装成一个工具函数。

```javascript
//1. 创建xhr对象
//2. 设置请求行
//3. 设置请求头
//3. 设置请求体
//4. 监听响应状态
//5. 获取响应内容
```

### 参数提取


| 参数名      | 参数类型     | 描述      | 传值           | 默认值                                    |
| -------- | :------- | ------- | ------------ | -------------------------------------- |
| type     | string   | 请求方式    | get/post     | 只要不传post，就是get                         |
| url      | string   | 请求地址    | 接口地址         | 如果不传地址，不发送请求                           |
| data     | object   | 请求数据    | `{key:valu}` | 需要把这个对象拼接成参数的格式 uname=hucc&upass=12345 |
| callback | function | 渲染数据的函数 | 函数           | 空                                      |

### 完整代码

```js
var $={
  
    ajax:function(obj){
        //获取用户的参数
        var type=obj.type||'get'; //默认请求方式是get
        var url=obj.url||location.href; //默认请求当前页面
        var callback=obj.callback;
        //1-js中使用对最方便接受的参数是对象，但是传递给服务器的格式 name=zs&age=18
        var data=this.setParam(obj.data); //name=zs&age=18

        // console.log(data);
        //封装ajax公共代码部分
        //1-创建XMLHttpRequest对象
        var xhr=new XMLHttpRequest();

        //模拟http协议
        //如果是get请求在url后面拼接参数
        if(type=='get'){
            url=url+'?'+data;
            data=null;
        }
        //1-请求行
        xhr.open(type,url);
        //2-请求头 post 必须设置请求头
        if(type=='post'){
            xhr.setRequestHeader('content-type','application/x-www-form-urlencoded');
        }
        //3-请求主体
        xhr.send(data);

        //监听服务器的响应
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4 &&xhr.status==200){
                var r=xhr.responseText;//获取响应主体
                //r中就是服务器返回核心数据 需要渲染
                callback&&callback(r);
            }
        }
    },
  
    //将对象转成 name=zs&age=18
    setParam:function(obj){
        
        if(typeof obj =='object'){ 
            var str='';                  
            for(var k in obj){
                str+=k+'='+obj[k]+'&';
            }
            str=str.substr(0,str.length-1); //参数一：开始索引 参数二：截取长度
        }

        return str;//返回转换后的字符串
    }
};        
```



## jQuery中的ajax方法

> jQuery为我们提供了更强大的Ajax封装

### $.ajax

参数列表

| 参数名称       | 描述       | 取值                  | 示例                                |
| ---------- | -------- | ------------------- | --------------------------------- |
| url        | 接口地址     |                     | url:"02.php"                      |
| type       | 请求方式     | get/post            | type:"get"                        |
| timeout    | 超时时间     | 单位毫秒                | timeout:5000                      |
| dataType   | 服务器返回的格式 | json/xml/text(默认)   | dataType:"json"                   |
| data       | 发送的请求数据  | 对象                  | data:{name:"zs", age:18}          |
| beforeSend | 调用前的回调函数 | function(){}        | beforeSend:function(){ alert(1) } |
| success    | 成功的回调函数  | function (data) {}  | success:function (data) {}        |
| error      | 失败的回调函数  | function (error) {} | error:function(data) {}           |
| complete   | 完成后的回调函数 | function () {}      | complete:function () {}           |



使用示例：

```javascript
$.ajax({
  type:"get",//请求类型
  url:"02.php",//请求地址
  data:{name:"zs", age:18},//请求数据
  dataType:"json",//希望接受的数据类型
  timeout:5000,//设置超时时间
  beforeSend:function () {
    //alert("发送前调用");
  },
  success:function (data) {
    //alert("成功时调用");
    console.log(data);
  },
  error:function (error) {
    //alert("失败时调用");
    console.log(error);
  },
  complete:function () {
    //alert("请求完成时调用");
  }
});
```
【案例：登录案例.html】

### 其他api(了解)

```javascript
//$.post(url, callback, [dataType]);只发送post请求
//$.get(url, callback, [dataType]);
//$.getJSON(url, callback);
//$.getScript(url,callback);//载入服务器端的js文件
//$("div").load(url);//载入一个服务器端的html页面。
```





### 接口化开发

请求地址即所谓的接口，通常我们所说的接口化开发，其实是指一个接口对应一个功能， 并且严格约束了**请求参数** 和**响应结果** 的格式，这样前后端在开发过程中，可以减少不必要的讨论， 从而并行开发，可以极大的提升开发效率，另外一个好处，当网站进行改版后，服务端接口进行调整时，并不影响到前端的功能。



#### 获取短信验证码接口

**需求文档(产品)** 

```javascript
//总需求：点击发送按钮，向服务端发送请求
//需求1：格式校验
  //1. 手机号码不能为空   如果为空提示"手机号不能为空"
  //2. 手机号码格式必须正确,     提示"请输入正确的手机号码"
//需求2：点击发送时，按钮显示为"发送中",并且不能重复提交请求
//需求3：根据不同的响应结果，进行响应。
  //1. 如果接口调用成功
      //如果响应代码为100，倒计时
      //如果响应代码为101，提示手机号重复
  //2. 如果接口调用失败，告诉用户"服务器繁忙，请稍候再试"
```

**接口文档**

```javascript
//接口说明：获取短信验证码
//接口地址：getCode.php
//请求方式：get
//接口传参：mobile 手机号
//返回类型  json
//接口返回：{"code":"101","msg":"手机号码存在", "mobile":"18511249258"}
        //code 当前业务逻辑的处理成功失败的标识  100:成功   101:手机号码存在
        //msg  当前系统返回给前端提示
        //mobile  当前的手机号码
```



#### 注册接口

**表单序列化**

jquery提供了一个`serialize()`方法序列化表单，说白就是将表单中带有name属性的所有参数拼成一个格式为`name=value&name1=value1`这样的字符串。方便我们获取表单的数据。

```javascript
//serialize将表单参数序列化成一个字符串。必须指定name属性
//name=hucc&pass=123456&repass=123456&mobile=18511249258&code=1234
$('form').serialize();

//serializeArray将表单序列化成一个数组，必须指定name属性
//[{name:"name", value:"hucc"},{name:"pass", value:"123456"},{name:"repass", value:"123456"},{name:"mobile", value:"18511241111"}, {name:"code", value:"1234"}]
$('form').serializeArray();
```

**jquery的ajax方法，data参数能够直接识别表单序列化的数据`data:$('form').serializeArray()`**

```javascript
$.post({
  url:"register.php",
  data:$('form').serializeArray(),
  dataType:'json',
  success:function (info) {
    console.log(info);
  }
});
```



**需求文档**

```javascript
//注册功能
//总需求：点击注册按钮，向服务端发送请求
//需求1:表单校验
  //1.1 用户名不能为空，否则提示"请输入用户名"
  //1.2 密码不能为空，否则提示"请输入密码"
  //1.3 确认密码必须与密码一直，否则提示"确认密码与密码不一致"
  //1.4 手机号码不能为空，否则提示"请输入手机号码";
  //1.5 手机号码格式必须正确，否则提示"手机号格式错误"
  //1.6 短信验证码必须是4位的数字，否则提示"验证码格式错误"
//需求2：点击注册按钮时，按钮显示为"注册中...",并且不能重复提交请求
//需求3：根据不同响应结果，处理响应
  //3.1 接口调用成功
    //100 提示用户注册成功，3s后跳转到首页
    //101 提示用户"用户名hucc已经存在"
    //102 提示用户"验证码错误"
  //3.1 接口调用失败，提示"服务器繁忙，请稍后再试",恢复按钮的值
```

**接口文档**

```javascript
//接口说明：注册
//接口地址：register.php
//请求方式：post
//接口传参：name:用户名 pass:密码 code:验证码  mobile:手机号
//返回类型  json
//接口返回：{"code":"100","msg":"注册成功","name":"huccc"}
        //code 当前业务逻辑的处理成功失败的标识  100:成功  101:用户存在 102:验证码错误
        //msg  当前系统返回给前端提示
        //name: 注册的用户名
```


# 模板引擎

> 是为了使用户界面与业务数据（内容）分离而产生的，它可以生成特定格式的文档，用于网站的模板引擎就会生成一个标准的HTML文档。

## 为什么要使用模板引擎

我们通过ajax获取到数据后，需要把数据渲染到页面，在学习模板引擎前，我们的做法是大量的拼接字符串，对于结构简单的页面，这么做还行，但是如果页面结构很复杂，使用拼串的话**代码可阅读性非常的差，而且非常容易出错，后期代码维护也是相当的麻烦。** 

【演示：使用拼串进行渲染的缺点.html】



## 常见的模板引擎

BaiduTemplate：http://tangram.baidu.com/BaiduTemplate/
velocity.js：https://github.com/shepherdwind/velocity.js/
ArtTemplate：https://github.com/aui/artTemplate

artTemplate是使用最广泛，效率最高的模板引擎，需要大家掌握。



## artTemplate的使用

[github地址](https://github.com/aui/art-template)

[中文api地址](https://aui.github.io/art-template/docs/)

### artTemplate入门

**1.引入模板引擎的js文件** 

```javascript
<script src="template-web.js"></script>
```

**2.准备模板** 

```html
<!--
  指定了type为text/html后，这一段script标签并不会解析，也不会显示。
-->
<script type="text/html" id="myTmp">
  <p>姓名：隔壁老王</p>
  <p>年龄：18</p>
  <p>技能：查水表</p>
  <p>描述：年轻力气壮</p>
</script>
```

**3.准备数据**

```javascript
//3. 准备数据,数据是后台获取的，可以随时变化
var json = {
  userName:"隔壁老王",
  age:18,
  skill:"查水表",
  desc:"年轻气壮"
}
```

**4.将模板与数据进行绑定**

```javascript
//第一个参数：模板的id
//第二个参数：数据
//返回值：根据模板生成的字符串。
var html = template("myTmp", json);
console.log(html);
```

**5.修改模板**

```html
<script type="text/html" id="myTmp">
  <p>姓名：{{userName}}</p>
  <p>年龄：{{age}}</p>
  <p>技能：{{skill}}</p>
  <p>描述：{{desc}}</p>
</script>
```



**6.将数据显示到页面**

```javascript
var div = document.querySelector("div");
div.innerHTML = html;
```



### artTemplate语法

**if语法**

```html
{{if gender='男'}}
  <div class="man">
{{else}}
  <div class="woman">
{{/if}}
```

**each语法**

```html
<!--
  1. {{each data}}  可以通过$value 和 $index获取值和下标
  2. {{each data v i}}  自己指定值为v，下标为i
-->
{{each data v i}}
<li>
  <a href="{{v.url}}">
    <img src="{{v.src}}" alt="">
    <p>{{v.content}}</p>
   </a>
 </li>
{{/each}}
```

```javascript
//如果返回的数据是个数组，必须使用对象进行包裹，因为在{{}}中只写书写对象的属性。
var html = template("navTmp", {data:info});
```