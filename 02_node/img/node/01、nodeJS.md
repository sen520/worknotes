## 1、安装模块

npm install 模块名

```
npm install express  # 本地安装
npm install express -g # 全局安装

# 如果出现错误
npm err! Error: connect ECONNREFUSED 127.0.0.1:8087 
# 解决方法为
npm config set proxy null

# 查看安装信息
npm list -g

# 查看某个模块的版本号
npm list 模块名

# 卸载模块
npm uninstall 模块名

NPM提供了很多命令，例如install和publish，使用npm help可查看所有命令。

使用npm help <command>可查看某条命令的详细帮助，例如npm help install。

在package.json所在目录下使用npm install . -g可先在本地安装当前命令行程序，可用于发布前的本地测试。

使用npm update <package>可以把当前目录下node_modules子目录里边的对应模块更新至最新版本。

使用npm update <package> -g可以把全局安装的对应命令行程序更新至最新版。

使用npm cache clear可以清空NPM本地缓存，用于对付使用相同版本号发布新版本代码的人。

使用npm unpublish <package>@<version>可以撤销发布自己发布过的某个版本代码。

使用淘宝 NPM 镜像
npm install -g cnpm --registry=https://registry.npm.taobao.org
这样就可以使用 cnpm 命令来安装模块了：
cnpm install [name]
```

## 2、NodeJS REPL交互解释器

#### （1）多行表达式

```
$ node
> var x = 0
undefined
> do {
... x++;
... console.log("x: " + x);
... } while ( x < 5 );
x: 1
x: 2
x: 3
x: 4
x: 5
undefined
>
```

#### （2）下划线(_)变量

你可以使用下划线(_)获取上一个表达式的运算结果：

```
$ node
> var x = 10
undefined
> var y = 20
undefined
> x + y
30
> var sum = _
undefined
> console.log(sum)
30
undefined
```

REPL命令

```
ctrl + c - 退出当前终端。

ctrl + c 按下两次 - 退出 Node REPL。

ctrl + d - 退出 Node REPL.

向上/向下 键 - 查看输入的历史命令

tab 键 - 列出当前命令

.help - 列出使用命令

.break - 退出多行表达式

.clear - 退出多行表达式

.save filename - 保存当前的 Node REPL 会话到指定文件

.load filename - 载入当前 Node REPL 会话的文件内容。
```

## 3、回调函数

Node.js 异步编程的直接体现就是回调。 

#### 阻塞代码实现

创建一个文件 input.txt ，内容如下：

```txt
菜鸟教程官网地址：www.runoob.com
```

创建 main.js 文件, 代码如下：

```js
var fs = require('fs');
var data = fs.readFileSync('input.txt');
console.log(data.toString());
console.log('程序执行结束')
```

执行结果：

```
$ node main.js
菜鸟教程官网地址：www.runoob.com

程序执行结束!
```

#### 非阻塞代码实例

创建 main.js 文件, 代码如下：

```js
var fs = require('fs');
fs.readFile('input.txt',function (err,data){
	if (err) return console.error(err);
	console.log(data.toString());

})
console.log('程序执行结束')
```

执行结果：

```
$ node main.js
程序执行结束!
菜鸟教程官网地址：www.runoob.com
```

以上两个实例我们了解了阻塞与非阻塞调用的不同。第一个实例在文件读取完后才执行完程序。 第二个实例我们不需要等待文件读取完，这样就可以在读取文件时同时执行接下来的代码，大大提高了程序的性能。

因此，阻塞是按顺序执行的，而非阻塞是不需要按顺序的，所以如果需要处理回调函数的参数，我们就需要写在回调函数内。

## 4、事件循环

Node.js 是单进程单线程应用程序，但是因为 V8 引擎提供的异步执行回调接口，通过这些接口可以处理大量的并发，所以性能非常高。

Node.js 几乎每一个 API 都是支持回调函数的。

Node.js 基本上所有的事件机制都是用设计模式中观察者模式实现。

Node.js 单线程类似进入一个while(true)的事件循环，直到没有事件观察者退出，每个异步事件都生成一个事件观察者，如果有事件发生就调用该回调函数

#### （1）事件驱动程序

Node.js 使用事件驱动模型，当web server接收到请求，就把它关闭然后进行处理，然后去服务下一个web请求。

当这个请求完成，它被放回处理队列，当到达队列开头，这个结果被返回给用户。

这个模型非常高效可扩展性非常强，因为webserver一直接受请求而不等待任何读写操作。（这也被称之为非阻塞式IO或者事件驱动IO）

在事件驱动模型中，会生成一个主循环来监听事件，当检测到事件时触发回调函数。

执行流程

```js
// 引入events模块
var events = require('events');
// 创建eventsEmitter对象
var eventEmitter = new events.EventEmitter();
// 绑定时间处理程序
eventEmitter.on('eventName',eventHandler);
// 触发事件
eventEmitter.emit('eventName');
```

实例

```js
// 引入events模块
var events = require('events');
// 创建eventEmitter对象
var eventEmitter = new events.EventEmitter();
// 创建时间处理程序
var coobnectHandler = function connected() {
	console.log('连接成功');

	// 触发data_received事件
	eventEmitter.emit('data_received');
}

// 绑定connection 时间处理程序
eventEmitter.on('connection',coobnectHandler)

// 使用匿名函数绑定data_recevied事件
eventEmitter.on('data_received',function () {
	console.log('数据连接成功');
});

// 触发 connection事件
eventEmitter.emit('connection');

console.log('程序执行完毕')
```

执行结果

```
E:\nodeJS\exe>node exe01.js
连接成功
数据连接成功
程序执行完毕
```

#### （2）捕获错误，并输出

```js
var fs = require('fs') // 导包
fs.readFile('input.txt',function (err,data) {
	if (err){
		console.log('error:'+err.stack);
		return;
	}
	console.log(data.toString());
});
console.log('程序执行完毕');
```

如果没有input.txt，就会输出错误，no such file or directory

## 5、Node.js EventEmitter

Node.js 所有的异步 I/O 操作在完成时都会发送一个事件到事件队列。

Node.js 里面的许多对象都会分发事件：一个 net.Server 对象会在每次有新连接时触发一个事件， 一个 fs.readStream 对象会在文件被打开的时候触发一个事件。 所有这些产生事件的对象都是 events.EventEmitter 的实例。

#### （1）EventEmitter 类

EventEmitter 的核心就是事件触发与事件监听器功能的封装。

可以通过require("events");来访问该模块。

```js
// 引入 events 模块
var events = require('events');
// 创建 eventEmitter 对象
var eventEmitter = new events.EventEmitter();
```

EventEmitter 对象如果在实例化时发生错误，会触发 error 事件。当添加新的监听器时，newListener 事件会触发，当监听器被移除时，removeListener 事件被触发。

```js
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();

// 绑定事件处理程序
event.on('some_event',function(){
	console.log('some_event 事件触发');
});
setTimeout(function () {
	event.emit('some_event'); // 调用some_event监听器
},1000); // 设置时间
```

运行这段代码，1 秒后控制台输出了 **'some_event 事件触发'**。其原理是 event 对象注册了事件 some_event 的一个监听器，然后我们通过 setTimeout 在 1000 毫秒以后向 event 对象发送事件 some_event，此时会调用some_event 的监听器。

运行结果

```
$ node event.js 
some_event 事件触发
```

EventEmitter 的每个事件由一个事件名和若干个参数组成，事件名是一个字符串，通常表达一定的语义。对于每个事件，EventEmitter 支持 若干个事件监听器。

当事件触发时，注册到这个事件的事件监听器被依次调用，事件参数作为回调函数参数传递。

```js
var events = require('events');
var emitter = new events.EventEmitter();
emitter.on('someEvent',function(arg1,arg2){
	console.log('listener1',arg1,arg2);
});
emitter.on('someEvent',function(arg1,arg2){
	console.log('listener2',arg1,arg2);
});// 绑定事件

emitter.emit('someEvent','arg1参数','arg2参数');//调用，因为绑定了两次，所以会有两次输出
```

输出结果

```
$ node event.js 
listener1 arg1 参数 arg2 参数
listener2 arg1 参数 arg2 参数
```

emitter 为事件 someEvent 注册了两个事件监听器，然后触发了 someEvent 事件。

运行结果中可以看到两个事件监听器回调函数被先后调用。 这就是EventEmitter最简单的用法。

EventEmitter 提供了多个属性，如 **on** 和 **emit**。**on** 函数用于绑定事件函数，**emit** 属性用于触发一个事件。接下来我们来具体看下 EventEmitter 的属性介绍。

#### （2）监听事件的操作方法

```js
var events = require('events');
var eventEmitter = new events.EventEmitter();

// 监听器 #1
var listener1 = function listener1(){
	console.log('监听器 listener1 执行。')
}

// 监听器 #2
var listener2 = function listener2() {
	console.log('监听器 listener2 执行。')
}

// 绑定connection 事件，处理函数为listener1
eventEmitter.addListener('connection',listener1);

// 绑定connection 事件，处理函数为listener2
eventEmitter.on('connection',listener2);

var eventListeners = eventEmitter.listenerCount('connection')

console.log(eventListeners + '个监听器监听连接事件');

// 处理connection事件
eventEmitter.emit('connection');

// 移除监听绑定的listen1函数
eventEmitter.removeListener('connection',listener1);
console.log('listener1 不再受监听');

// 触发连接事件
eventEmitter.emit('connection');

eventListeners = eventEmitter.listenerCount('connection');
console.log(eventListeners + '个监听器监听连接事件');

console.log('程序执行完毕');

```

输出结果：

```
E:\nodeJS\exe>node event03.js
2个监听器监听连接事件
监听器 listener1 执行。
监听器 listener2 执行。
listener1 不再受监听
监听器 listener2 执行。
1个监听器监听连接事件
程序执行完毕
```

#### （3）error事件

EventEmitter 定义了一个特殊的事件 error，它包含了错误的语义，我们在遇到 异常的时候通常会触发 error 事件。

当 error 被触发时，EventEmitter 规定如果没有响 应的监听器，Node.js 会把它当作异常，退出程序并输出错误信息。

我们一般要为会触发 error 事件的对象设置监听器，避免遇到错误后整个程序崩溃。例如：

```js
var events = require('events'); 
var emitter = new events.EventEmitter(); 
emitter.emit('error'); 
```

#### （4）继承 EventEmitter

大多数时候我们不会直接使用 EventEmitter，而是在对象中继承它。包括 fs、net、 http 在内的，只要是支持事件响应的核心模块都是 EventEmitter 的子类。

为什么要这样做呢？原因有两点：

首先，具有某个实体功能的对象实现事件符合语义， 事件的监听和发生应该是一个对象的方法。

其次 JavaScript 的对象机制是基于原型的，支持 部分多重继承，继承 EventEmitter 不会打乱对象原有的继承关系。

## 6、Buffer缓冲区（受限于版本问题，可能会报错）

JavaScript 语言自身只有字符串数据类型，没有二进制数据类型。

但在处理像TCP流或文件流时，必须使用到二进制数据。因此在 Node.js中，定义了一个 Buffer 类，该类用来创建一个专门存放二进制数据的缓存区。

在 Node.js 中，Buffer 类是随 Node 内核一起发布的核心库。Buffer 库为 Node.js 带来了一种存储原始数据的方法，可以让 Node.js 处理二进制数据，每当需要在 Node.js 中处理I/O操作中移动的数据时，就有可能使用 Buffer 库。原始数据存储在 Buffer 类的实例中。一个 Buffer 类似于一个整数数组，但它对应于 V8 堆内存之外的一块原始内存。

```js
const buf = Buffer.from('runoob','ascii');

// 输出 72756e6f6f62
console.log(buf.toString('hex'));

// 输出 cnVub29i
console.log(buf.toString('base64'));
```

**Node.js 目前支持的字符编码包括：**

- **ascii** - 仅支持 7 位 ASCII 数据。如果设置去掉高位的话，这种编码是非常快的。
- **utf8** - 多字节编码的 Unicode 字符。许多网页和其他文档格式都使用 UTF-8 。
- **utf16le** - 2 或 4 个字节，小字节序编码的 Unicode 字符。支持代理对（U+10000 至 U+10FFFF）。
- **ucs2** - **utf16le** 的别名。
- **base64** - Base64 编码。
- **latin1** - 一种把 **Buffer** 编码成一字节编码的字符串的方式。
- **binary** - **latin1** 的别名。
- **hex** - 将每个字节编码为两个十六进制字符。

#### （1）创建 Buffer 类

Buffer 提供了以下 API 来创建 Buffer 类：

- **Buffer.alloc(size[, fill[, encoding]])：** 返回一个指定大小的 Buffer 实例，如果没有设置 fill，则默认填满 0
- **Buffer.allocUnsafe(size)：** 返回一个指定大小的 Buffer 实例，但是它不会被初始化，所以它可能包含敏感的数据
- **Buffer.allocUnsafeSlow(size)**
- **Buffer.from(array)：** 返回一个被 array 的值初始化的新的 Buffer 实例（传入的 array 的元素只能是数字，不然就会自动被 0 覆盖）
- **Buffer.from(arrayBuffer[, byteOffset[, length]])：** 返回一个新建的与给定的 ArrayBuffer 共享同一内存的 Buffer。
- **Buffer.from(buffer)：** 复制传入的 Buffer 实例的数据，并返回一个新的 Buffer 实例
- **Buffer.from(string[, encoding])：** 返回一个被 string 的值初始化的新的 Buffer 实例

```js
// 创建一个长度为 10、且用 0 填充的 Buffer。
const buf1 = Buffer.alloc(10);

// 创建一个长度为 10、且用 0x1 填充的 Buffer。 
const buf2 = Buffer.alloc(10, 1);

// 创建一个长度为 10、且未初始化的 Buffer。
// 这个方法比调用 Buffer.alloc() 更快，
// 但返回的 Buffer 实例可能包含旧数据，
// 因此需要使用 fill() 或 write() 重写。
const buf3 = Buffer.allocUnsafe(10);

// 创建一个包含 [0x1, 0x2, 0x3] 的 Buffer。
const buf4 = Buffer.from([1, 2, 3]);

// 创建一个包含 UTF-8 字节 [0x74, 0xc3, 0xa9, 0x73, 0x74] 的 Buffer。
const buf5 = Buffer.from('tést');

// 创建一个包含 Latin-1 字节 [0x74, 0xe9, 0x73, 0x74] 的 Buffer。
const buf6 = Buffer.from('tést', 'latin1');
```

#### （2）写入缓存区

```js
buf.write(string[, offset[, length]][, encoding])
```

参数描述如下：

- **string** - 写入缓冲区的字符串。
- **offset** - 缓冲区开始写入的索引值，默认为 0 。
- **length** - 写入的字节数，默认为 buffer.length
- **encoding** - 使用的编码。默认为 'utf8' 。

根据 encoding 的字符编码写入 string 到 buf 中的 offset 位置。 length 参数是写入的字节数。 如果 buf 没有足够的空间保存整个字符串，则只会写入 string 的一部分。 只部分解码的字符不会被写入。

返回值

返回实际写入的大小。如果 buffer 空间不足， 则只会写入部分字符串。

```js
buf = Buffer.alloc(256);
len = buf.write("www.baidu.com");

console.log("写入字节数 : "+  len);


//写入字节数：13
```

#### （3）从缓冲区读取数据

读取 Node 缓冲区数据的语法如下所示：

```
buf.toString([encoding[, start[, end]]])
```

参数

参数描述如下：

- **encoding** - 使用的编码。默认为 'utf8' 。
- **start** - 指定开始读取的索引位置，默认为 0。
- **end** - 结束位置，默认为缓冲区的末尾。

返回值

解码缓冲区数据并使用指定的编码返回字符串。

```js
buf = Buffer.alloc(26);
for (var i = 0 ; i < 26 ; i++) {
  buf[i] = i + 97;
}

console.log( buf.toString('ascii'));       // 输出: abcdefghijklmnopqrstuvwxyz
console.log( buf.toString('ascii',0,5));   // 输出: abcde
console.log( buf.toString('utf8',0,5));    // 输出: abcde
console.log( buf.toString(undefined,0,5)); // 使用 'utf8' 编码, 并输出: abcde
```

#### （4）将Buffer转换为JSON对象

将 Node Buffer 转换为 JSON 对象的函数语法格式如下：

```
buf.toJSON()
```

当字符串化一个 Buffer 实例时，[JSON.stringify()](http://www.runoob.com/js/javascript-json-stringify.html) 会隐式地调用该 toJSON()。

返回 JSON 对象。

```js
const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5]);
const json = JSON.stringify(buf)

// 输出: {"type":"Buffer","data":[1,2,3,4,5]}
console.log(json);

// json.parse() 解析json字符串
const copy = JSON.parse(json,(ksy,value)=>{
  return value && value.type === 'Buffer'?
    Buffer.from(value.data):
    value;
});

// 输出: <Buffer 01 02 03 04 05>
console.log(copy);
```

（5）缓冲区合并

Node 缓冲区合并的语法如下所示：

```
Buffer.concat(list[, totalLength])
```

参数描述如下：

- **list** - 用于合并的 Buffer 对象数组列表。
- **totalLength** - 指定合并后Buffer对象的总长度。

返回一个多个成员合并的新 Buffer 对象。

```js
var buffer1 = Buffer.from(('菜鸟教程'));
var buffer2 = Buffer.from(('www.runoob.com'));
var buffer3 = Buffer.concat([buffer1,buffer2]);

// buffer3 内容: 菜鸟教程 www.runoob.com
console.log('buffer3内容:'+buffer3.toString());
```

#### （5）缓冲区比较

Node Buffer 比较的函数语法如下所示, 该方法在 Node.js v0.12.2 版本引入：

```
buf.compare(otherBuffer);
```

参数描述如下：

- **otherBuffer** - 与 **buf** 对象比较的另外一个 Buffer 对象。

返回一个数字，表示 **buf** 在 **otherBuffer** 之前，之后或相同。

```js
var buffer1 = Buffer.from('ABC');
var buffer2 = Buffer.from('ABCD');
var result = buffer1.compare(buffer2);

// ABC在ABCD之前
if(result < 0){
	console.log(buffer1 + '在' + buffer2 + '之前');
}else if (result == 0){
	console.log(buffer1 + '与' + buffer2 + '相同');
}else{
	console.log(buffer1 + '在' + buffer2 + '之后');
}

```

#### （6）拷贝缓冲区

Node 缓冲区拷贝语法如下所示：

```
buf.copy(targetBuffer[, targetStart[, sourceStart[, sourceEnd]]])
```

参数描述如下：

- **targetBuffer** - 要拷贝的 Buffer 对象。
- **targetStart** - 数字, 可选, 默认: 0
- **sourceStart** - 数字, 可选, 默认: 0
- **sourceEnd** - 数字, 可选, 默认: buffer.length

没有返回值。

#### （7）缓冲区裁剪

Node 缓冲区裁剪语法如下所示：

```
buf.slice([start[, end]])
```

参数描述如下：

- **start** - 数字, 可选, 默认: 0
- **end** - 数字, 可选, 默认: buffer.length

返回一个新的缓冲区，它和旧缓冲区指向同一块内存，但是从索引 start 到 end 的位置剪切。

## 7、Node.js Stream(流)

Stream 是一个抽象接口，Node 中有很多对象实现了这个接口。例如，对http 服务器发起请求的request 对象就是一个 Stream，还有stdout（标准输出）。

Node.js，Stream 有四种流类型：

- **Readable** - 可读操作。
- **Writable** - 可写操作。
- **Duplex** - 可读可写操作.
- **Transform** - 操作被写入数据，然后读出结果。

所有的 Stream 对象都是 EventEmitter 的实例。常用的事件有：

- **data** - 当有数据可读时触发。
- **end** - 没有更多的数据可读时触发。
- **error** - 在接收和写入过程中发生错误时触发。
- **finish** - 所有数据已被写入到底层系统时触发。

#### （1）从流中读取数据

```js
var fs = require('fs');
var data = '';

// 创建可读流
var readerStream = fs.createReadStream('a.txt');

// 设置编码
readerStream.setEncoding('UTF8');

// 处理流事件 ---> data ,end ,and error
readerStream.on('data',function(chunk){
  data += chunk;
});

readerStream.on('end',function(){
  console.log(data);
});

readerStream.on('error',function(err){
	console.log(err.stack);
});

console.log('程序执行完毕');
//程序执行完毕
//adasdsa:hello
```

#### （2）写入流

```js
var fs = require('fs');
var data = '菜鸟教程官网地址：www.runoob.com';

// 创建一个可以写入的流，写入到文件output.txt中
var writeStream = fs.createWriteStream('output.txt');

// 使用utf8 编码写入数据
writeStream.write(data,'UTF8');

// 标记文件末尾
writeStream.end();

// 处理流事件 ---> data,end,and error
writeStream.on('finish',function(){
	console.log('写入完成。');
});

writeStream.on('error',function(err){
	console.log(err.stack);
});

console.log('程序执行完毕');

// $ node main.js 
// 程序执行完毕
// 写入完成。
```

#### （3）管道流

管道提供了一个输出流到输入流的机制。通常我们用于从一个流中获取数据并将数据传递到另外一个流中。 

```js
var fs = require('fs');

// 创建一个可读流
var readerStream = fs.createReadStream('a.txt');

// 创建一个可写流
var writeStream = fs.createWriteStream('a-copy.txt');

// 管道读写操作
// 读取a.txt内容，并将内容写到ss.txt文件中
readerStream.pipe(writeStream);

console.log('程序执行完毕');
```

#### （4）链式流

链式是通过连接输出流到另外一个流并创建多个流操作链的机制。链式流一般用于管道操作。

接下来我们就是用管道和链式来压缩和解压文件。

```js
var fs = require('fs');
var zlib = require('zlib');

// 压缩 a.txt 文件为 a.txt.gz
fs.createReadStream('a.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('a.txt.gz'));

console.log('文件压缩完成');


// ================================================
var fs = require('fs');
var zlib = require('zlib');

// 解压 文件
fs.createReadStream('a.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('as.txt'));

console.log('文件解压完成');
```

## 8、函数

在JavaScript中，一个函数可以作为另一个函数的参数。我们可以先定义一个函数，然后传递，也可以在传递参数的地方直接定义函数。 

```js
// 创建函数
function say(word){
  console.log(word);
};

// 执行，传入函数及其参数
function execute(someFunction,value){
  someFunction(value);
};

execute(say,'Hello');
```

以上代码中，我们把 say 函数作为execute函数的第一个变量进行了传递。这里传递的不是 say 的返回值，而是 say 本身！

这样一来， say 就变成了execute 中的本地变量 someFunction ，execute可以通过调用 someFunction() （带括号的形式）来使用 say 函数。

当然，因为 say 有一个变量， execute 在调用 someFunction 时可以传递这样一个变量。

#### 匿名函数

我们可以把一个函数作为变量传递。但是我们不一定要绕这个"先定义，再传递"的圈子，我们可以直接在另一个函数的括号中定义和传递这个函数： 

```js
function execute(someFunction,value){
	someFunction(value);
}

execute(function(word){console.log(word)},'Hello word');
```

我们在 execute 接受第一个参数的地方直接定义了我们准备传递给 execute 的函数。

用这种方式，我们甚至不用给这个函数起名字，这也是为什么它被叫做匿名函数 。

## 9、Node.js路由

我们要为路由提供请求的 URL 和其他需要的 GET 及 POST 参数，随后路由需要根据这些数据来执行相应的代码。

因此，我们需要查看 HTTP 请求，从中提取出请求的 URL 以及 GET/POST 参数。这一功能应当属于路由还是服务器（甚至作为一个模块自身的功能）确实值得探讨，但这里暂定其为我们的HTTP服务器的功能。

我们需要的所有数据都会包含在 request 对象中，该对象作为 onRequest() 回调函数的第一个参数传递。但是为了解析这些数据，我们需要额外的 Node.JS 模块，它们分别是 url 和 querystring 模块。

server.js

```js
var http = require('http');
var url = require('url');

function start(route){
  function onRequest(request,response){
  	var pathname = url.parse(request.url).pathname;
  	console.log('Request for' + pathname + 'received.');

  	route(pathname); // 调用route.js中的方法

  	response.writeHead(200,{'Content-Type':'text/plain'}); //响应码和响应头类型
  	response.write('Hello World');// 页面显示
  	response.end();
  }
  http.createServer(onRequest).listen(8888); // 绑定端口号
  console.log('Server has started');
}


exports.start = start;
```

router.js

```js
function route(pathname) {
  console.log('About to route a request for ' + pathname)
}

exports.route = route;
```

index.js

```js
var server = require("./server");
var router = require('./router');

server.start(router.route);
```

执行：node index.js

```
Server has started
Request for/received.
About to route a request for /
Request for/favicon.icoreceived.
About to route a request for /favicon.ico
```

## 10、全局对象

JavaScript 中有一个特殊的对象，称为全局对象（Global Object），它及其所有属性都可以在程序的任何地方访问，即全局变量。

在浏览器 JavaScript 中，通常 window 是全局对象， 而 Node.js 中的全局对象是 global，所有全局变量（除了 global 本身以外）都是 global 对象的属性。

在 Node.js 我们可以直接访问到 global 的属性，而不需要在应用中包含它

### 全局对象和全局变量

global 最根本的作用是作为全局变量的宿主。按照 ECMAScript 的定义，满足以下条 件的变量是全局变量：

- 在最外层定义的变量；
- 全局对象的属性；
- 隐式定义的变量（未定义直接赋值的变量）。

当你定义一个全局变量时，这个变量同时也会成为全局对象的属性，反之亦然。需要注 意的是，在 Node.js 中你不可能在最外层定义变量，因为所有用户代码都是属于当前模块的， 而模块本身不是最外层上下文。

**注意：** 永远使用 var 定义变量以避免引入全局变量，因为全局变量会污染 命名空间，提高代码的耦合风险。

#### （1）__filename

**__filename** 表示当前正在执行的脚本的文件名。它将输出文件所在位置的绝对路径，且和命令行参数所指定的文件名不一定相同。 如果在模块中，返回的值是模块文件的路径。

```js
// 输出全局变量__filename的值
console.log(__filename); // D:\node\variable01.js
```

#### （2）__dirname

**__dirname** 表示当前执行脚本所在的目录。

```js
// 输出全局变量__dirname的值
console.log(__dirname); // D:\node
```

#### （3）setTimeout(cb, ms)

**setTimeout(cb, ms)** 全局函数在指定的毫秒(ms)数后执行指定函数(cb)。：setTimeout() 只执行一次指定函数。

返回一个代表定时器的句柄值。

```js
function printHello(){
  console.log('Hello World');
}
//设置两秒之后执行以上函数
setTimeout(printHello,2000);
```

#### （4）clearTimeout(t)

**clearTimeout( t )** 全局函数用于停止一个之前通过 setTimeout() 创建的定时器。 参数 **t** 是通过 setTimeout() 函数创建的定时器。

```js
function printHello(){
  console.log('Hello World');
}
//设置两秒之后执行以上函数
var t = setTimeout(printHello,2000);

// 清除定时器
clearTimeout(t);
```

#### （5）setInterval(cb, ms)

**setInterval(cb, ms)** 全局函数在指定的毫秒(ms)数后执行指定函数(cb)。

返回一个代表定时器的句柄值。可以使用 **clearInterval(t)** 函数来清除定时器。

setInterval() 方法会不停地调用函数，直到 clearInterval() 被调用或窗口被关闭。

```js
function printHello(){
  console.log('Hello,World!');
}
// 两秒后执行以上函数
setInterval(printHello,2000); // 每两秒执行一次上述函数，而且会永久执行下去
```

#### （6）console

console 用于提供控制台标准输出。

以下为 console 对象的方法:

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **console.log([data][, ...])** 向标准输出流打印字符并以换行符结束。该方法接收若干 个参数，如果只有一个参数，则输出这个参数的字符串形式。如果有多个参数，则 以类似于C 语言 printf() 命令的格式输出。 |
| 2    | **console.info([data][, ...])** 该命令的作用是返回信息性消息，这个命令与console.log差别并不大，除了在chrome中只会输出文字外，其余的会显示一个蓝色的惊叹号。 |
| 3    | **console.error([data][, ...])** 输出错误消息的。控制台在出现错误时会显示是红色的叉子。 |
| 4    | **console.warn([data][, ...])** 输出警告消息。控制台出现有黄色的惊叹号。 |
| 5    | **console.dir(obj[, options])** 用来对一个对象进行检查（inspect），并以易于阅读和打印的格式显示。 |
| 6    | **console.time(label)** 输出时间，表示计时开始。             |
| 7    | **console.timeEnd(label)** 结束时间，表示计时结束。          |
| 8    | **console.trace(message[, ...])** 当前执行的代码在堆栈中的调用路径，这个测试函数运行很有帮助，只要给想测试的函数里面加入 console.trace 就行了。 |
| 9    | **console.assert(value[, message][, ...])** 用于判断某个表达式或变量是否为真，接收两个参数，第一个参数是表达式，第二个参数是字符串。只有当第一个参数为false，才会输出第二个参数，否则不会有任何结果。 |

- console.log()：第一个参数是一个字符串，如果没有 参数，只打印一个换行。

```js
console.log('Hello Word');
console.log('byvoid%diovyb');
console.log('byvoid%diovyb',1991);
/*
Hello Word
byvoid%diovyb
byvoid1991iovyb
*/
```

- console.error()：与console.log() 用法相同，只是向标准错误流输出。
- console.trace()：向标准错误流输出当前的调用栈。

```js
console.trace();
/* 
Trace
    at Object.<anonymous> (D:\node\variable01.js:29:9)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
    at startup (node.js:119:16)
    at node.js:902:3
*/
```

实例

```js
console.info('程序开始执行');
var couter = 10;
console.log('计划: %d',couter);
console.time('获取数据');

console.timeEnd('获取数据');
console.info('程序执行完毕');

/*
程序开始执行
计划: 10
获取数据: 0ms
程序执行完毕
*/
```

#### （7）process

process 是一个全局变量，即 global 对象的属性。

它用于描述当前Node.js 进程状态的对象，提供了一个与操作系统的简单接口。通常在你写本地命令行程序的时候，少不了要和它打交道。下面将会介绍 process 对象的一些最常用的成员方法。

| 序号 | 事件 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **exit** <br />当进程准备退出时触发。                        |
| 2    | **beforeExit** <br />当 node 清空事件循环，并且没有其他安排时触发这个事件。通常来说，当没有进程安排时 node 退出，但是 'beforeExit' 的监听器可以异步调用，这样 node 就会继续执行。 |
| 3    | **uncaughtException** <br />当一个异常冒泡回到事件循环，触发这个事件。如果给异常添加了监视器，默认的操作（打印堆栈跟踪信息并退出）就不会发生。 |
| 4    | **Signal 事件** <br />当进程接收到信号时就触发。信号列表详见标准的 POSIX 信号名，如 SIGINT、SIGUSR1 等。 |

实例

```js
// 进程退出的时候触发
process.on('exit',function(code) {
  // 以下代码永远不会执行
  setTimeout(function() {
  	console.log('该代码不会执行');
  },0);

  console.log('退出码：',code);
});
console.log('程序执行结束');
/*
程序执行结束
退出码： 0
 */
```

退出状态码

| 状态码 | 名称 & 描述                                                  |
| ------ | ------------------------------------------------------------ |
| 1      | **Uncaught Fatal Exception** 有未捕获异常，并且没有被域或 uncaughtException 处理函数处理。 |
| 2      | **Unused** 保留                                              |
| 3      | **Internal JavaScript Parse Error** JavaScript的源码启动 Node 进程时引起解析错误。非常罕见，仅会在开发 Node 时才会有。 |
| 4      | **Internal JavaScript Evaluation Failure** JavaScript 的源码启动 Node 进程，评估时返回函数失败。非常罕见，仅会在开发 Node 时才会有。 |
| 5      | **Fatal Error** V8 里致命的不可恢复的错误。通常会打印到 stderr ，内容为： FATAL ERROR |
| 6      | **Non-function Internal Exception Handler** 未捕获异常，内部异常处理函数不知为何设置为on-function，并且不能被调用。 |
| 7      | **Internal Exception Handler Run-Time Failure** 未捕获的异常， 并且异常处理函数处理时自己抛出了异常。例如，如果 process.on('uncaughtException') 或 domain.on('error') 抛出了异常。 |
| 8      | **Unused** 保留                                              |
| 9      | **Invalid Argument** 可能是给了未知的参数，或者给的参数没有值。 |
| 10     | **Internal JavaScript Run-Time Failure** JavaScript的源码启动 Node 进程时抛出错误，非常罕见，仅会在开发 Node 时才会有。 |
| 12     | **Invalid Debug Argument**  设置了参数--debug 和/或 --debug-brk，但是选择了错误端口。 |
| 128    | **Signal Exits** 如果 Node 接收到致命信号，比如SIGKILL 或 SIGHUP，那么退出代码就是128 加信号代码。这是标准的 Unix 做法，退出信号代码放在高位。 |

###### Process 属性

Process 提供了很多有用的属性，便于我们更好的控制系统的交互：

| 序号. | 属性 & 描述                                                  |
| ----- | ------------------------------------------------------------ |
| 1     | **stdout**<br /> 标准输出流。                                |
| 2     | **stderr** <br />标准错误流。                                |
| 3     | **stdin**<br /> 标准输入流。                                 |
| 4     | **argv** <br />argv 属性返回一个数组，由命令行执行脚本时的各个参数组成。它的第一个成员总是node，第二个成员是脚本文件名，其余成员是脚本文件的参数。 |
| 5     | **execPath** <br />返回执行当前脚本的 Node 二进制文件的绝对路径。 |
| 6     | **execArgv**<br /> 返回一个数组，成员是命令行下执行脚本时，在Node可执行文件与脚本文件之间的命令行参数。 |
| 7     | **env** <br />返回一个对象，成员为当前 shell 的环境变量      |
| 8     | **exitCode** <br />进程退出时的代码，如果进程优通过 process.exit() 退出，不需要指定退出码。 |
| 9     | **version** <br />Node 的版本，比如v0.10.18。                |
| 10    | **versions** <br />一个属性，包含了 node 的版本和依赖.       |
| 11    | **config** <br />一个包含用来编译当前 node 执行文件的 javascript 配置选项的对象。它与运行 ./configure 脚本生成的 "config.gypi" 文件相同。 |
| 12    | **pid** <br />当前进程的进程号。                             |
| 13    | **title** <br />进程名，默认值为"node"，可以自定义该值。     |
| 14    | **arch** <br />当前 CPU 的架构：'arm'、'ia32' 或者 'x64'。   |
| 15    | **platform** <br />运行程序所在的平台系统 'darwin', 'freebsd', 'linux', 'sunos' 或 'win32' |
| 16    | **mainModule**<br /> require.main 的备选方法。不同点，如果主模块在运行时改变，require.main可能会继续返回老的模块。可以认为，这两者引用了同一个模块。 |

实例

```js
// 输出到终端
process.stdout.write('Hello World ' + '\n');

// 通过参数读取
process.argv.forEach(function(val,index,array) {
  console.log(index + ': ' + val);
});

// 获取执行路径
console.log(process.execPath);

// 平台信息
console.log(process.platform);
/*
Hello World
0: node
1: D:\node\variable01.js
D:\node\node.exe
win32
 */
```

###### 方法参考手册

Process 提供了很多有用的方法，便于我们更好的控制系统的交互：

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **abort()** 这将导致 node 触发 abort 事件。会让 node 退出并生成一个核心文件。 |
| 2    | **chdir(directory)** 改变当前工作进程的目录，如果操作失败抛出异常。 |
| 3    | **cwd()** 返回当前进程的工作目录                             |
| 4    | **exit([code])** 使用指定的 code 结束进程。如果忽略，将会使用 code 0。 |
| 5    | **getgid()** 获取进程的群组标识（参见 getgid(2)）。获取到得时群组的数字 id，而不是名字。 注意：这个函数仅在 POSIX 平台上可用(例如，非Windows 和 Android)。 |
| 6    | **setgid(id)** 设置进程的群组标识（参见 setgid(2)）。可以接收数字 ID 或者群组名。如果指定了群组名，会阻塞等待解析为数字 ID 。 注意：这个函数仅在 POSIX 平台上可用(例如，非Windows 和 Android)。 |
| 7    | **getuid()** 获取进程的用户标识(参见 getuid(2))。这是数字的用户 id，不是用户名。 注意：这个函数仅在 POSIX 平台上可用(例如，非Windows 和 Android)。 |
| 8    | **setuid(id)** 设置进程的用户标识（参见setuid(2)）。接收数字 ID或字符串名字。果指定了群组名，会阻塞等待解析为数字 ID 。 注意：这个函数仅在 POSIX 平台上可用(例如，非Windows 和 Android)。 |
| 9    | **getgroups()** 返回进程的群组 iD 数组。POSIX 系统没有保证一定有，但是 node.js 保证有。 注意：这个函数仅在 POSIX 平台上可用(例如，非Windows 和 Android)。 |
| 10   | **setgroups(groups)** 设置进程的群组 ID。这是授权操作，所以你需要有 root 权限，或者有 CAP_SETGID 能力。 注意：这个函数仅在 POSIX 平台上可用(例如，非Windows 和 Android)。 |
| 11   | **initgroups(user, extra_group)** 读取 /etc/group ，并初始化群组访问列表，使用成员所在的所有群组。这是授权操作，所以你需要有 root 权限，或者有 CAP_SETGID 能力。 注意：这个函数仅在 POSIX 平台上可用(例如，非Windows 和 Android)。 |
| 12   | **kill(pid[, signal])** 发送信号给进程. pid 是进程id，并且 signal 是发送的信号的字符串描述。信号名是字符串，比如 'SIGINT' 或 'SIGHUP'。如果忽略，信号会是 'SIGTERM'。 |
| 13   | **memoryUsage()** 返回一个对象，描述了 Node 进程所用的内存状况，单位为字节。 |
| 14   | **nextTick(callback)** 一旦当前事件循环结束，调用回调函数。  |
| 15   | **umask([mask])** 设置或读取进程文件的掩码。子进程从父进程继承掩码。如果mask 参数有效，返回旧的掩码。否则，返回当前掩码。 |
| 16   | **uptime()** 返回 Node 已经运行的秒数。                      |
| 17   | **hrtime()** 返回当前进程的高分辨时间，形式为 [seconds, nanoseconds]数组。它是相对于过去的任意事件。该值与日期无关，因此不受时钟漂移的影响。主要用途是可以通过精确的时间间隔，来衡量程序的性能。 你可以将之前的结果传递给当前的 process.hrtime() ，会返回两者间的时间差，用来基准和测量时间间隔。 |

实例

```js
// 输出当前目录
console.log('当前目录： ' + process.cwd());

// 输出当前版本
console.log('当前版本：' + process.version);

// 输出内存使用情况
console.log(process.memoryUsage());
/*
当前目录： D:\node
当前版本：v0.10.26
{ rss: 13099008, heapTotal: 4083456, heapUsed: 2183176 }
*/
```

## 11、常用工具

util 是一个Node.js 核心模块，提供常用函数的集合，用于弥补核心JavaScript 的功能 过于精简的不足。 

#### （1）util.inherits

util.inherits(constructor, superConstructor)是一个实现对象间原型继承 的函数。

JavaScript 的面向对象特性是基于原型的，与常见的基于类的不同。JavaScript 没有 提供对象继承的语言级别特性，而是通过原型复制来实现的。

```js
var util = require('util');
function Base(){
  this.name = 'base';
  this.base = 1991;
  this.sayHello = function() {
  	console.log('Hello ' + this.name);
  };
}
Base.prototype.showName = function() {
  console.log(this.name);
}
function Sub() {
  this.name = 'sub';
}
util.inherits(Sub, Base);
var objBase = new Base();
objBase.showName();
objBase.sayHello();
console.log(objBase);
var objSub = new Sub();
objSub.showName();
// objSub.sayHello();
console.log(objSub);
/*
base
Hello base
{ name: 'base', base: 1991, sayHello: [Function] }
sub
{ name: 'sub' }
 */
```

我们定义了一个基础对象Base 和一个继承自Base的Sub，Base有三个在构造函数内定义的属性和一个原型中定义的函数，通过util.inherits 实现继承。

**注意：**Sub 仅仅继承了Base 在原型中定义的函数，而构造函数内部创造的 base 属 性和 sayHello 函数都没有被 Sub 继承。

同时，在原型中定义的属性不会被console.log 作 为对象的属性输出。如果我们去掉 objSub.sayHello(); 这行的注释，将会看到：

```js
base
Hello base
{ name: 'base', base: 1991, sayHello: [Function] }
sub

D:\node\util.js:22
objSub.sayHello();
       ^
TypeError: Object #<Sub> has no method 'sayHello'
    at Object.<anonymous> (D:\node\util.js:22:8)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
    at startup (node.js:119:16)
    at node.js:902:3
```

#### （2）util.inspect

util.inspect(object,[showHidden],[depth],[colors])是一个将任意对象转换为字符串的方法，通常用于调试和错误输出。它至少接受一个参数 object，即要转换的对象。

showHidden 是一个可选参数，如果值为 true，将会输出更多隐藏信息。

depth 表示最大递归的层数，如果对象很复杂，你可以指定层数以控制输出信息的多 少。如果不指定depth，默认会递归2层，指定为 null 表示将不限递归层数完整遍历对象。 如果color 值为 true，输出格式将会以ANSI 颜色编码，通常用于在终端显示更漂亮 的效果。

特别要指出的是，util.inspect 并不会简单地直接把对象转换为字符串，即使该对 象定义了toString 方法也不会调用。

```js
var util = require('util');
function Person() {
  this.name = 'zs';
  this.toString = function() {
  return this.name;
	};
}
var obj = new Person();
console.log(util.inspect(obj));
console.log(util.inspect(obj, true));
/*
{ name: 'zs', toString: [Function] }
{ name: 'zs',
  toString:
   { [Function]
     [length]: 0,
     [name]: '',
     [arguments]: null,
     [caller]: null,
     [prototype]: { [constructor]: [Circular] } } }
 */
```

#### （3）util.isArray(object)

如果给定的参数 "object" 是一个数组返回true，否则返回false。

```js
var util = require('util');

util.isArray([])
// true
util.isArray(new Array)
// true
util.isArray({})
// false
```

#### （4）util.isRegExp(object)

如果给定的参数 "object" 是一个正则表达式返回true，否则返回false。 

```js
var util = require('util');
console.log(util.isRegExp(/some regexp/));
//true
console.log(util.isRegExp(new RegExp('another regexp')));
//true
console.log(util.isRegExp({}));
//false
```

#### （5）util.isDate(object)

如果给定的参数 "object" 是一个日期返回true，否则返回false。 

```js
var util = require('util');
console.log(util.isDate(new Date()));
//true
console.log(util.isDate(Date()));
//false 前面没有new方法的话，返回的是字符串
console.log(util.isDate({}));
//false
```

#### （6）util.isError(object)

如果给定的参数“object”是一个错误对象返回true，否则返回false

```js
var util = require('util');
console.log(util.isError(new Error()));
// true
console.log(util.isError(new TypeError()));
// true
console.log(util.isError({name:'Error',message:'an error occurred'}))
// false
```

## 12、文件系统

Node.js 提供一组类似 UNIX（POSIX）标准的文件操作API。 语法如下

```js
var fs = require('fs);
```

#### （1）异步和同步

Node.js 文件系统（fs 模块）模块中的方法均有异步和同步版本，例如读取文件内容的函数有异步的 fs.readFile() 和同步的 fs.readFileSync()。

异步的方法函数最后一个参数为回调函数，回调函数的第一个参数包含了错误信息(error)。

建议大家使用异步方法，比起同步，**异步方法性能更高，速度更快，而且没有阻塞。**

```js
var fs = require('fs');

// 异步读取
fs.readFile('input.txt',function(err,data) {
  if(err) {
  	return console.error(err);
  }
  console.log('异步读取：'+ data.toString());
});

// 同步读取
var data = fs.readFileSync('input.txt');
console.log('同步读取：' + data.toString());
console.log('程序执行完毕');
/*
同步读取：菜鸟教程官网地址：www.runoob.com
文件读取实例
程序执行完毕
异步读取：菜鸟教程官网地址：www.runoob.com
文件读取实例
 */
// 异步，同样还有同步版本
function getAllAlbums(callback){
  fs.readdir('./uploads',function(err,files){
  	// err: 在有错误发生时等于异常对象，
  	// files:始终用于放回API方法的执行结果.
  	var allAlbums = [];

  	callback(allAlbums);
  });
};

var albums = function(req,res,next){
  getAllAlbums(function(err,allAlbums){
    res.render('index',{
    'albums':allAlbums
    });
  });
};
```

#### （2）打开文件

###### 语法

以下为在异步模式下打开文件的语法格式：

```
fs.open(path, flags[, mode], callback)
```

###### 参数

参数使用说明如下：

- **path** - 文件的路径。
- **flags** - 文件打开的行为。具体值详见下文。
- **mode** - 设置文件模式(权限)，文件创建默认权限为 0666(可读，可写)。
- **callback** - 回调函数，带有两个参数如：callback(err, fd)。

flags 参数可以是以下值：

| Flag | 描述                                                   |
| ---- | ------------------------------------------------------ |
| r    | 以读取模式打开文件。如果文件不存在抛出异常。           |
| r+   | 以读写模式打开文件。如果文件不存在抛出异常。           |
| rs   | 以同步的方式读取文件。                                 |
| rs+  | 以同步的方式读取和写入文件。                           |
| w    | 以写入模式打开文件，如果文件不存在则创建。             |
| wx   | 类似 'w'，但是如果文件路径存在，则文件写入失败。       |
| w+   | 以读写模式打开文件，如果文件不存在则创建。             |
| wx+  | 类似 'w+'， 但是如果文件路径存在，则文件读写失败。     |
| a    | 以追加模式打开文件，如果文件不存在则创建。             |
| ax   | 类似 'a'， 但是如果文件路径存在，则文件追加失败。      |
| a+   | 以读取追加模式打开文件，如果文件不存在则创建。         |
| ax+  | 类似 'a+'， 但是如果文件路径存在，则文件读取追加失败。 |

###### 实例

```js
var fs = require('fs');

// 异步打开文件
console.log('准备打开文件');
fs.open('input.txt','r+',function(err,fd) {
  if (err) {
  	return console.error(err);
  }
  console.log('文件打开成功');
});
/*
准备打开文件
文件打开成功
 */
```

#### （3）获取文件信息

###### 语法

以下为通过异步模式获取文件信息的语法格式：

```
fs.stat(path, callback)
```

###### 参数

参数使用说明如下：

- **path** - 文件路径。
- **callback** - 回调函数，带有两个参数如：(err, stats), **stats** 是 fs.Stats 对象。

fs.stat(path)执行后，会将stats类的实例返回给其回调函数。可以通过stats类中的提供方法判断文件的相关属性。例如判断是否为文件：

```js
var fs = require('fs');

fs.stat('./file.js',function (err,stats){
	console.log(stats.isFile()); // true
})
```

stats类中的方法有：

| 方法                      | 描述                                                         |
| ------------------------- | ------------------------------------------------------------ |
| stats.isFile()            | 如果是文件返回 true，否则返回 false。                        |
| stats.isDirectory()       | 如果是目录返回 true，否则返回 false。                        |
| stats.isBlockDevice()     | 如果是块设备返回 true，否则返回 false。                      |
| stats.isCharacterDevice() | 如果是字符设备返回 true，否则返回 false。                    |
| stats.isSymbolicLink()    | 如果是软链接返回 true，否则返回 false。                      |
| stats.isFIFO()            | 如果是FIFO，返回true，否则返回 false。FIFO是UNIX中的一种特殊类型的命令管道。 |
| stats.isSocket()          | 如果是 Socket 返回 true，否则返回 false。                    |

###### 实例

```js
var fs = require('fs');
console.log('准备打开文件');
fs.stat('input.txt',function (err,stats){
  if(err){
    return console.error(err);
  }
  console.log(stats);
  console.log('读取文件信息成功');

  // 检测文件类型
  console.log('是否是文件（isFile）?' + stats.isFile());
  console.log('是否为目录（isDirectory）?' + stats.isDirectory());

});
/*
准备打开文件
{ dev: 0,
  mode: 33206,
  nlink: 1,
  uid: 0,
  gid: 0,
  rdev: 0,
  ino: 0,
  size: 64,
  atime: Tue Sep 11 2018 15:15:05 GMT+0800 (中国标准时间),
  mtime: Tue Sep 11 2018 15:19:29 GMT+0800 (中国标准时间),
  ctime: Tue Sep 11 2018 15:15:05 GMT+0800 (中国标准时间) }
读取文件信息成功
是否是文件（isFile）?true
是否为目录（isDirectory）?false
 */
```

#### （4）写入文件

###### 语法

以下为异步模式下写入文件的语法格式：

```
fs.writeFile(file, data[, options], callback)
```

writeFile 直接打开文件默认是 w 模式，所以如果文件存在，该方法写入的内容会覆盖旧的文件内容。

###### 参数

参数使用说明如下：

- **file** - 文件名或文件描述符。
- **data** - 要写入文件的数据，可以是 String(字符串) 或 Buffer(缓冲) 对象。
- **options** - 该参数是一个对象，包含 {encoding, mode, flag}。默认编码为 utf8, 模式为 0666 ， flag 为 'w'
- **callback** - 回调函数，回调函数只包含错误信息参数(err)，在写入失败时返回。

###### 实例

接下来我们创建 file.js 文件，代码如下所示：

```js
var fs = require('fs');
console.log('准备写入文件');
fs.writeFile('input.txt','我是通过fs.writeFile写入的文件内容',function(err){
  if (err) {
    return console.error(err);
  }
  console.log('数据写入成功！');
  console.log('--------------------分割线--------------------');
  console.log('读取写入的数据！');
  fs.readFile('input.txt',function(err,data){
  	if(err){
  		return console.error(err);
  	}
  	console.log('异步读取文件数据：' + data.toString())
  });
});
/*
准备写入文件
数据写入成功！
--------------------分割线--------------------
读取写入的数据！
异步读取文件数据：我是通过fs.writeFile写入的文件内容
*/
```

#### （5）读取文件

###### 语法

以下为异步模式下读取文件的语法格式：

```
fs.read(fd, buffer, offset, length, position, callback)
```

该方法使用了文件描述符来读取文件。

###### 参数

参数使用说明如下：

- **fd** - 通过 fs.open() 方法返回的文件描述符。
- **buffer** - 数据写入的缓冲区。
- **offset** - 缓冲区写入的写入偏移量。
- **length** - 要从文件中读取的字节数。
- **position** - 文件读取的起始位置，如果 position 的值为 null，则会从当前文件指针的位置读取。
- **callback** - 回调函数，有三个参数err, bytesRead, buffer，err 为错误信息， bytesRead 表示读取的字节数，buffer 为缓冲区对象。

###### 实例

```js
var fs = require("fs");
var buf = new Buffer.alloc(1024);

console.log("准备打开已存在的文件！");
fs.open('input.txt', 'r+', function(err, fd) {
   if (err) {
       return console.error(err);
   }
   console.log("文件打开成功！");
   console.log("准备读取文件：");
   fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
      if (err){
         console.log(err);
      }
      console.log(bytes + "  字节被读取");
      
      // 仅输出读取的字节
      if(bytes > 0){
         console.log(buf.slice(0, bytes).toString());
      }
   });
});
/*
准备打开已存在的文件！
文件打开成功！
准备读取文件：
42  字节被读取
菜鸟教程官网地址：www.runoob.com
*/
```

#### （6）关闭文件

###### 语法

以下为异步模式下关闭文件的语法格式：

```js
fs.close(fd, callback)
```

该方法使用了文件描述符来读取文件。

###### 参数

参数使用说明如下：

- **fd** - 通过 fs.open() 方法返回的文件描述符。
- **callback** - 回调函数，没有参数。

###### 实例

input.txt 文件内容为：

```
菜鸟教程官网地址：www.runoob.com
```

接下来我们创建 file.js 文件，代码如下所示：

```js
var fs = require("fs");
var buf = new Buffer.alloc(1024);

console.log("准备打开文件！");
fs.open('input.txt', 'r+', function(err, fd) {
   if (err) {
       return console.error(err);
   }
   console.log("文件打开成功！");
   console.log("准备读取文件！");
   fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
      if (err){
         console.log(err);
      }

      // 仅输出读取的字节
      if(bytes > 0){
         console.log(buf.slice(0, bytes).toString());
      }

      // 关闭文件
      fs.close(fd, function(err){
         if (err){
            console.log(err);
         } 
         console.log("文件关闭成功");
      });
   });
});
/*
准备打开文件！
文件打开成功！
准备读取文件！
菜鸟教程官网地址：www.runoob.com
文件关闭成功
*/
```

#### （7）截取文件

###### 语法

以下为异步模式下截取文件的语法格式：

```js
fs.ftruncate(fd, len, callback)
```

该方法使用了文件描述符来读取文件。

###### 参数

参数使用说明如下：

- **fd** - 通过 fs.open() 方法返回的文件描述符。
- **len** - 文件内容截取的长度。
- **callback** - 回调函数，没有参数。

###### 实例

input.txt 文件内容为：

```
site:www.runoob.com
```

接下来我们创建 file.js 文件，代码如下所示：

```js
var fs = require("fs");
var buf = new Buffer.alloc(1024);

console.log("准备打开文件！");
fs.open('input.txt', 'r+', function(err, fd) {
   if (err) {
       return console.error(err);
   }
   console.log("文件打开成功！");
   console.log("截取了10字节后的文件内容。");
   
   // 截取文件
   fs.ftruncate(fd, 10, function(err){
      if (err){
         console.log(err);
      } 
      console.log("文件截取成功。");
      console.log("读取相同的文件"); 
      fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
         if (err){
            console.log(err);
         }

         // 仅输出读取的字节
         if(bytes > 0){
            console.log(buf.slice(0, bytes).toString());
         }

         // 关闭文件
         fs.close(fd, function(err){
            if (err){
               console.log(err);
            } 
            console.log("文件关闭成功！");
         });
      });
   });
});
```

#### （8）删除文件

###### 语法

以下为删除文件的语法格式：

```
fs.unlink(path, callback)
```

###### 参数

参数使用说明如下：

- **path** - 文件路径。
- **callback** - 回调函数，没有参数。

###### 实例

input.txt 文件内容为：

```
site:www.runoob.com
```

接下来我们创建 file.js 文件，代码如下所示：

```js
var fs = require('fs');
console.log('准备删除文件！');
fs.unlink('input.txt',function(err) {
  if (err) {
    return console.error(err);
  }
  console.log('文件删除成功');
})
/*
准备删除文件！
文件删除成功
*/
```

#### （9）路径 path

将传入的路径转换为标准路径，具体讲的话，除了解析路径中的`.`与`..`外，还能去掉多余的斜杠。如果有程序需要使用路径作为某些数据的索引，但又允许用户随意输入路径时，就需要使用该方法保证路径的唯一性。

```js
const path = require('path'); 
var cache = {};

function store(key,value){
  cache[path.normalize(key)] = value;
}

store('foo/bar',1);
store('foo//baz//../bar',2);
console.log(cache);
// { 'foo\\bar': 2 }

```

##### 创建目录

###### 语法

以下为创建目录的语法格式：

```
fs.mkdir(path[, mode], callback)

```

###### 参数

参数使用说明如下：

- **path** - 文件路径。
- **mode** - 设置目录权限，默认为 0777。
- **callback** - 回调函数，没有参数。

###### 实例

接下来我们创建 file.js 文件，代码如下所示：

```js
var fs = require("fs");

console.log("创建目录 /tmp/test/");
fs.mkdir("/tmp/test/",function(err){
   if (err) {
       return console.error(err);
   }
   console.log("目录创建成功。");
});
```

以上代码执行结果如下：

```
$ node file.js 
创建目录 /tmp/test/
目录创建成功。

```

##### 读取目录

###### 语法

以下为读取目录的语法格式：

```
fs.readdir(path, callback)

```

###### 参数

参数使用说明如下：

- **path** - 文件路径。
- **callback** - 回调函数，回调函数带有两个参数err, files，err 为错误信息，files 为 目录下的文件数组列表。

###### 实例

接下来我们创建 file.js 文件，代码如下所示：

```
var fs = require("fs");

console.log("查看 /tmp 目录");
fs.readdir("/tmp/",function(err, files){
   if (err) {
       return console.error(err);
   }
   files.forEach( function (file){
       console.log( file );
   });
});

```

以上代码执行结果如下：

```
$ node file.js 
查看 /tmp 目录
input.out
output.out
test
test.txt

```

##### 删除目录

###### 语法

以下为删除目录的语法格式：

```
fs.rmdir(path, callback)

```

###### 参数

参数使用说明如下：

- **path** - 文件路径。
- **callback** - 回调函数，没有参数。

###### 实例

接下来我们创建 file.js 文件，代码如下所示：

```js
var fs = require("fs");
// 执行前创建一个空的 /tmp/test 目录
console.log("准备删除目录 /tmp/test");
fs.rmdir("/tmp/test",function(err){
   if (err) {
       return console.error(err);
   }
   console.log("读取 /tmp 目录");
   fs.readdir("/tmp/",function(err, files){
      if (err) {
          return console.error(err);
      }
      files.forEach( function (file){
          console.log( file );
      });
   });
});
```

以上代码执行结果如下：

```
$ node file.js 
准备删除目录 /tmp/test
读取 /tmp 目录
……

```

##### 遍历目录

###### 递归算法

```js
function factorial(n){
  if (n === 1){
    return 1;
  }else{
  	return n * factorial(n-1)
  }
}
a = factorial(10);
console.log(a);
```

使用递归算法编写的代码虽然简洁，但由于每递归一次就产生一次函数调用，在需要优先考虑性能时，需要把递归算法转换为循环算法，以减少函数调用次数。 

###### 遍历算法

目录是一个树状结构，在遍历时一般使用深度优先+先序遍历算法。深度优先，意味着到达一个节点后，首先接着遍历子节点而不是邻居节点。先序遍历，意味着首次到达了某节点就算遍历完成，而不是最后一次返回某节点才算数。因此使用这种遍历方式时，下边这棵树的遍历顺序是`A > B > D > E > C > F`。

```
          A
         / \
        B   C
       / \   \
      D   E   F
```

###### 同步遍历

了解了必要的算法后，我们可以简单地实现以下目录遍历函数。

```js
function travel(dir, callback) {
    fs.readdirSync(dir).forEach(function (file) {
        var pathname = path.join(dir, file);

        if (fs.statSync(pathname).isDirectory()) {
            travel(pathname, callback);
        } else {
            callback(pathname);
        }
    });
}
```

可以看到，该函数以某个目录作为遍历的起点。遇到一个子目录时，就先接着遍历子目录。遇到一个文件时，就把文件的绝对路径传给回调函数。回调函数拿到文件路径后，就可以做各种判断和处理。因此假设有以下目录：

```
- /home/user/
    - foo/
        x.js
    - bar/
        y.js
    z.css

```

使用以下代码遍历该目录时，得到的输入如下。

```
travel('/home/user', function (pathname) {
    console.log(pathname);
});

------------------------
/home/user/foo/x.js
/home/user/bar/y.js
/home/user/z.css
```

###### 异步遍历

```js
function travel(dir,callback,finish){
  fs.readdir(dir,function(err,files){
  	(function next(i) {
  	  if (i<files.length){
  	  	var pathname = path.join(dir,files[i]);
  	  	  fs.stat(pathname,function(err,stats){
  	  	  	if(stats.isDirectory()){
  	  	  	  travel(pathname,callback,function(){
  	  	  	  	next(i+1)''
  	  	  	  });
  	  	  	}else{
  	  	  	  callback(pathname);
  	  	  	};
  	  	  });
 	  };
  	});
  });
};

```

这里不详细介绍异步遍历函数的编写技巧，在后续章节中会详细介绍这个。总之我们可以看到异步编程还是蛮复杂的。

#### （10）文件模块方法参考手册

以下为 Node.js 文件模块相同的方法列表：

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **fs.rename(oldPath, newPath, callback)** 异步 rename().回调函数没有参数，但可能抛出异常。 |
| 2    | **fs.ftruncate(fd, len, callback)** 异步 ftruncate().回调函数没有参数，但可能抛出异常。 |
| 3    | **fs.ftruncateSync(fd, len)** 同步 ftruncate()               |
| 4    | **fs.truncate(path, len, callback)** 异步 truncate().回调函数没有参数，但可能抛出异常。 |
| 5    | **fs.truncateSync(path, len)** 同步 truncate()               |
| 6    | **fs.chown(path, uid, gid, callback)** 异步 chown().回调函数没有参数，但可能抛出异常。 |
| 7    | **fs.chownSync(path, uid, gid)** 同步 chown()                |
| 8    | **fs.fchown(fd, uid, gid, callback)** 异步 fchown().回调函数没有参数，但可能抛出异常。 |
| 9    | **fs.fchownSync(fd, uid, gid)** 同步 fchown()                |
| 10   | **fs.lchown(path, uid, gid, callback)** 异步 lchown().回调函数没有参数，但可能抛出异常。 |
| 11   | **fs.lchownSync(path, uid, gid)** 同步 lchown()              |
| 12   | **fs.chmod(path, mode, callback)** 异步 chmod().回调函数没有参数，但可能抛出异常。 |
| 13   | **fs.chmodSync(path, mode)** 同步 chmod().                   |
| 14   | **fs.fchmod(fd, mode, callback)** 异步 fchmod().回调函数没有参数，但可能抛出异常。 |
| 15   | **fs.fchmodSync(fd, mode)** 同步 fchmod().                   |
| 16   | **fs.lchmod(path, mode, callback)** 异步 lchmod().回调函数没有参数，但可能抛出异常。Only available on Mac OS X. |
| 17   | **fs.lchmodSync(path, mode)** 同步 lchmod().                 |
| 18   | **fs.stat(path, callback)** 异步 stat(). 回调函数有两个参数 err, stats，stats 是 fs.Stats 对象。 |
| 19   | **fs.lstat(path, callback)** 异步 lstat(). 回调函数有两个参数 err, stats，stats 是 fs.Stats 对象。 |
| 20   | **fs.fstat(fd, callback)** 异步 fstat(). 回调函数有两个参数 err, stats，stats 是 fs.Stats 对象。 |
| 21   | **fs.statSync(path)** 同步 stat(). 返回 fs.Stats 的实例。    |
| 22   | **fs.lstatSync(path)** 同步 lstat(). 返回 fs.Stats 的实例。  |
| 23   | **fs.fstatSync(fd)** 同步 fstat(). 返回 fs.Stats 的实例。    |
| 24   | **fs.link(srcpath, dstpath, callback)** 异步 link().回调函数没有参数，但可能抛出异常。 |
| 25   | **fs.linkSync(srcpath, dstpath)** 同步 link().               |
| 26   | **fs.symlink(srcpath, dstpath[, type], callback)** 异步 symlink().回调函数没有参数，但可能抛出异常。 type 参数可以设置为 'dir', 'file', 或 'junction' (默认为 'file') 。 |
| 27   | **fs.symlinkSync(srcpath, dstpath[, type])** 同步 symlink(). |
| 28   | **fs.readlink(path, callback)** 异步 readlink(). 回调函数有两个参数 err, linkString。 |
| 29   | **fs.realpath(path[, cache], callback)** 异步 realpath(). 回调函数有两个参数 err, resolvedPath。 |
| 30   | **fs.realpathSync(path[, cache])** 同步 realpath()。返回绝对路径。 |
| 31   | **fs.unlink(path, callback)** 异步 unlink().回调函数没有参数，但可能抛出异常。 |
| 32   | **fs.unlinkSync(path)** 同步 unlink().                       |
| 33   | **fs.rmdir(path, callback)** 异步 rmdir().回调函数没有参数，但可能抛出异常。 |
| 34   | **fs.rmdirSync(path)** 同步 rmdir().                         |
| 35   | **fs.mkdir(path[, mode], callback)** S异步 mkdir(2).回调函数没有参数，但可能抛出异常。 mode defaults to 0777. |
| 36   | **fs.mkdirSync(path[, mode])** 同步 mkdir().                 |
| 37   | **fs.readdir(path, callback)** 异步 readdir(3). 读取目录的内容。 |
| 38   | **fs.readdirSync(path)** 同步 readdir().返回文件数组列表。   |
| 39   | **fs.close(fd, callback)** 异步 close().回调函数没有参数，但可能抛出异常。 |
| 40   | **fs.closeSync(fd)** 同步 close().                           |
| 41   | **fs.open(path, flags[, mode], callback)** 异步打开文件。    |
| 42   | **fs.openSync(path, flags[, mode])** 同步 version of fs.open(). |
| 43   | **fs.utimes(path, atime, mtime, callback)**                  |
| 44   | **fs.utimesSync(path, atime, mtime)** 修改文件时间戳，文件通过指定的文件路径。 |
| 45   | **fs.futimes(fd, atime, mtime, callback)**                   |
| 46   | **fs.futimesSync(fd, atime, mtime)** 修改文件时间戳，通过文件描述符指定。 |
| 47   | **fs.fsync(fd, callback)** 异步 fsync.回调函数没有参数，但可能抛出异常。 |
| 48   | **fs.fsyncSync(fd)** 同步 fsync.                             |
| 49   | **fs.write(fd, buffer, offset, length[, position], callback)** 将缓冲区内容写入到通过文件描述符指定的文件。 |
| 50   | **fs.write(fd, data[, position[, encoding]], callback)** 通过文件描述符 fd 写入文件内容。 |
| 51   | **fs.writeSync(fd, buffer, offset, length[, position])** 同步版的 fs.write()。 |
| 52   | **fs.writeSync(fd, data[, position[, encoding]])** 同步版的 fs.write(). |
| 53   | **fs.read(fd, buffer, offset, length, position, callback)** 通过文件描述符 fd 读取文件内容。 |
| 54   | **fs.readSync(fd, buffer, offset, length, position)** 同步版的 fs.read. |
| 55   | **fs.readFile(filename[, options], callback)** 异步读取文件内容。 |
| 56   | **fs.readFileSync(filename[, options])**                     |
| 57   | **fs.writeFile(filename, data[, options], callback)** 异步写入文件内容。 |
| 58   | **fs.writeFileSync(filename, data[, options])** 同步版的 fs.writeFile。 |
| 59   | **fs.appendFile(filename, data[, options], callback)** 异步追加文件内容。 |
| 60   | **fs.appendFileSync(filename, data[, options])** The 同步 version of fs.appendFile. |
| 61   | **fs.watchFile(filename[, options], listener)** 查看文件的修改。 |
| 62   | **fs.unwatchFile(filename[, listener])** 停止查看 filename 的修改。 |
| 63   | **fs.watch(filename[, options][, listener])** 查看 filename 的修改，filename 可以是文件或目录。返回 fs.FSWatcher 对象。 |
| 64   | **fs.exists(path, callback)** 检测给定的路径是否存在。       |
| 65   | **fs.existsSync(path)** 同步版的 fs.exists.                  |
| 66   | **fs.access(path[, mode], callback)** 测试指定路径用户权限。 |
| 67   | **fs.accessSync(path[, mode])** 同步版的 fs.access。         |
| 68   | **fs.createReadStream(path[, options])** 返回ReadStream 对象。 |
| 69   | **fs.createWriteStream(path[, options])** 返回 WriteStream 对象。 |
| 70   | **fs.symlink(srcpath, dstpath[, type], callback)** 异步 symlink().回调函数没有参数，但可能抛出异常。 |

## 13、GET/POST请求

#### （1）获取GET请求内容

由于GET请求直接被嵌入在路径中，URL是完整的请求路径，包括了?后面的部分，因此你可以手动解析后面的内容作为GET请求的参数。

node.js 中 url 模块中的 parse 函数提供了这个功能。

###### 实例

```js
var http = require('http');
var url = require('url');
var util = require('util');

http.createServer(function(req,res){
  res.writeHead(200,{'Content-Type':'text/plain;charset=utf-8'}); // 配置请求头
  res.end(util.inspect(url.parse(req.url,true)));
}).listen(3000) // 配置监听端口号
```

在浏览器中访问 **http://localhost:3000/user?name=菜鸟教程&url=www.runoob.com** 然后查看返回结果:

```
{ protocol: null,
  slashes: null,
  auth: null,
  host: null,
  port: null,
  hostname: null,
  hash: null,
  search: '?name=%E8%8F%9C%E9%B8%9F%E6%95%99%E7%A8%8B&url=www.runoob.com',
  query: { name: '菜鸟教程', url: 'www.runoob.com' },
  pathname: '/user',
  path: '/user?name=%E8%8F%9C%E9%B8%9F%E6%95%99%E7%A8%8B&url=www.runoob.com',
  href: '/user?name=%E8%8F%9C%E9%B8%9F%E6%95%99%E7%A8%8B&url=www.runoob.com' }
```

###### 获取URL的参数

我们可以使用 url.parse 方法来解析 URL 中的参数，代码如下： 

```js
var http = require('http');
var url = require('url');
var util = require('util');

http.createServer(function(req,res){
  res.writeHead(200,{'Content-Type':'text/plain;charset=utf-8'}); // 配置请求头
  
  //解析url参数
  var params = url.parse(req.url,true).query;
  res.write('网站名：' + params.name);
  res.write('\n');
  res.write('网站URL：' + params.url);
  res.end()
}).listen(3000) // 配置监听端口号
```

在浏览器中访问 **http://localhost:3000/user?name=菜鸟教程&url=www.runoob.com** 然后查看返回结果:

```
网站名：菜鸟教程
网站URL：www.runoob.com
```

#### （2）获取POST请求内容

POST 请求的内容全部的都在请求体中，http.ServerRequest 并没有一个属性内容为请求体，原因是等待请求体传输可能是一件耗时的工作。

比如上传文件，而很多时候我们可能并不需要理会请求体的内容，恶意的POST请求会大大消耗服务器的资源，所以 node.js 默认是不会解析请求体的，当你需要的时候，需要手动来做。

基本语法说明：

```js
var http = require('http');
var querystring = require('querystring');
 
http.createServer(function(req, res){
    // 定义了一个post变量，用于暂存请求体的信息
    var post = '';     
 
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    req.on('data', function(chunk){    
        post += chunk;
    });
 
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){    
        post = querystring.parse(post);
        res.end(util.inspect(post));
    });
}).listen(3000);
```

以下实例表单通过 POST 提交并输出数据： 

```js
var http = require('http');
var querystring = require('querystring');

var postHTML =   
  '<html><head><meta charset="utf-8"><title>菜鸟教程 Node.js 实例</title></head>' +
  '<body>' +
  '<form method="post">' +
  '网站名： <input name="name"><br>' +
  '网站 URL： <input name="url"><br>' +
  '<input type="submit">' +
  '</form>' +
  '</body></html>';

http.createServer(function (req,res) {
  var body = '';
  req.on('data',function (chunk) {
    body += chunk;
  });
  req.on('end',function (){
   	// 解析参数
    body = querystring.parse(body);
    res.writeHead(200,{'Content-Type':'text/html;charset=utf8'});
    if (body.name && body.url){ // 输出提交的数据
      res.write('网站名:' + body.name);
      res.write('<br>');
      res.write('网站URL：' + body.url);
    } else { // 输出表单
      res.write(postHTML);
    }
    res.end();
  });
}).listen(3000);
```

输出结果（127.0.0.1:3000）：

输入：

​	网站名：菜鸟教程

​	网站URL：www.runoob.com

```
网站名:菜鸟教程
网站URL：www.runoob.com
```

## 14、工具模块

在 Node.js 模块库中有很多好用的模块。接下来我们为大家介绍几种常用模块的使用：

| 序号 | 模块名 & 描述                                                |
| ---- | ------------------------------------------------------------ |
| 1    | [**OS 模块**](http://www.runoob.com/nodejs/nodejs-os-module.html) 提供基本的系统操作函数。 |
| 2    | [**Path 模块**](http://www.runoob.com/nodejs/nodejs-path-module.html) 提供了处理和转换文件路径的工具。 |
| 3    | [**Net 模块**](http://www.runoob.com/nodejs/nodejs-net-module.html) 用于底层的网络通信。提供了服务端和客户端的的操作。 |
| 4    | [**DNS 模块**](http://www.runoob.com/nodejs/nodejs-dns-module.html) 用于解析域名。 |
| 5    | [**Domain 模块**](http://www.runoob.com/nodejs/nodejs-domain-module.html) 简化异步代码的异常处理，可以捕捉处理try catch无法捕捉的。 |

#### （1）OS模块

Node.js os 模块提供了一些基本的系统操作函数。我们可以通过以下方式引入该模块：

```js
var os = require("os")
```

###### 方法

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **os.tmpdir()** <br />返回操作系统的默认临时文件夹。         |
| 2    | **os.endianness()** <br />返回 CPU 的字节序，可能的是 "BE" 或 "LE"。 |
| 3    | **os.hostname()** <br />返回操作系统的主机名。               |
| 4    | **os.type()** <br />返回操作系统名                           |
| 5    | **os.platform()** <br />返回操作系统名                       |
| 6    | **os.arch()** <br />返回操作系统 CPU 架构，可能的值有 "x64"、"arm" 和 "ia32"。 |
| 7    | **os.release()** <br />返回操作系统的发行版本。              |
| 8    | **os.uptime()** <br />返回操作系统运行的时间，以秒为单位。   |
| 9    | **os.loadavg()** <br />返回一个包含 1、5、15 分钟平均负载的数组。 |
| 10   | **os.totalmem()** <br />返回系统内存总量，单位为字节。       |
| 11   | **os.freemem()** <br />返回操作系统空闲内存量，单位是字节。  |
| 12   | **os.cpus()** <br />返回一个对象数组，包含所安装的每个 CPU/内核的信息：型号、速度（单位 MHz）、时间（一个包含 user、nice、sys、idle 和 irq 所使用 CPU/内核毫秒数的对象）。 |
| 13   | **os.networkInterfaces()** <br />获得网络接口列表。          |

###### 属性

| 序号 | 属性 & 描述                               |
| ---- | ----------------------------------------- |
| 1    | **os.EOL** 定义了操作系统的行尾符的常量。 |

###### 实例

创建 main.js 文件，代码如下所示：

```js
var os = require('os');

// CPU的字节库
console.log('endianness : ' + os.endianness());

// 操作系统名
console.log('platform：' + os.platform());

// 系统内存总量
console.log('total memory：' + os.totalmem() + 'bytes.');

//操作系统空闲内存量
console.log('free memory：' + os.freemem() + 'bytes.');
/*
endianness : LE
platform：win32
total memory：8580616192bytes.
free memory：4759666688bytes.
 */
```

#### （2）Path模块

Node.js path 模块提供了一些用于处理文件路径的小工具，我们可以通过以下方式引入该模块：

```js
var path = require("path")
```

###### 方法

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **path.normalize(p)**<br /> 规范化路径，注意'..' 和 '.'。    |
| 2    | **path.join(\[path1]\[, path2][, ...])** <br />用于连接路径。该方法的主要用途在于，会正确使用当前系统的路径分隔符，Unix系统是"/"，Windows系统是"\"。 |
| 3    | **path.resolve([from ...], to)** <br />将 **to** 参数解析为绝对路径。 |
| 4    | **path.isAbsolute(path)**<br /> 判断参数 **path** 是否是绝对路径。 |
| 5    | **path.relative(from, to)** <br />用于将相对路径转为绝对路径。 |
| 6    | **path.dirname(p)** <br />返回路径中代表文件夹的部分，同 Unix 的dirname 命令类似。 |
| 7    | **path.basename(p[, ext])** <br />返回路径中的最后一部分。同 Unix 命令 bashname 类似。 |
| 8    | **path.extname(p)**<br /> 返回路径中文件的后缀名，即路径中最后一个'.'之后的部分。如果一个路径中并不包含'.'或该路径只包含一个'.' 且这个'.'为路径的第一个字符，则此命令返回空字符串。 |
| 9    | **path.parse(pathString)** <br />返回路径字符串的对象。      |
| 10   | **path.format(pathObject)** <br />从对象中返回路径字符串，和 path.parse 相反。 |

###### 属性

| 序号 | 属性 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **path.sep** <br />平台的文件路径分隔符，'\\' 或 '/'。       |
| 2    | **path.delimiter** <br />平台的分隔符, ; or ':'.             |
| 3    | **path.posix** <br />提供上述 path 的方法，不过总是以 posix 兼容的方式交互。 |
| 4    | **path.win32** <br />提供上述 path 的方法，不过总是以 win32 兼容的方式交互。 |

###### 实例

创建 main.js 文件，代码如下所示：

```js
var path = require('path');

// 格式化路径
console.log('normalization：' + path.normalize('/test/test1//2slashes/1slash/tab/...'));

// 连接路径
console.log('joint path：' + path.join('/test','test','2slashes/islash','tab','...'));

// 转化为绝对路径
console.log('resolve：' + path.resolve('module.js'));

// 路径中文件的后缀名
console.log('ext name：' + path.extname('main.js'));

/*
normalization：\test\test1\2slashes\1slash\tab\...
joint path：\test\test\2slashes\islash\tab\...
resolve：D:\exe\node\exe\module.js
ext name：.js
*/
```

#### （3）Net模块

Node.js Net 模块提供了一些用于底层的网络通信的小工具，包含了创建服务器/客户端的方法，我们可以通过以下方式引入该模块：

```js
var net = require("net")
```

###### 方法

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **net.createServer([options]\[, connectionListener])** <br />创建一个 TCP 服务器。参数 connectionListener 自动给 'connection' 事件创建监听器。 |
| 2    | **net.connect(options[, connectionListener])** <br />返回一个新的 'net.Socket'，并连接到指定的地址和端口。 当 socket 建立的时候，将会触发 'connect' 事件。 |
| 3    | **net.createConnection(options[, connectionListener])** <br />创建一个到端口 port 和 主机 host的 TCP 连接。 host 默认为 'localhost'。 |
| 4    | **net.connect(port[, host]\[, connectListener])** <br />创建一个端口为 port 和主机为 host的 TCP 连接 。host 默认为 'localhost'。参数 connectListener 将会作为监听器添加到 'connect' 事件。返回 'net.Socket'。 |
| 5    | **net.createConnection(port[, host]\[, connectListener])** <br />创建一个端口为 port 和主机为 host的 TCP 连接 。host 默认为 'localhost'。参数 connectListener 将会作为监听器添加到 'connect' 事件。返回 'net.Socket'。 |
| 6    | **net.connect(path[, connectListener])**<br /> 创建连接到 path 的 unix socket 。参数 connectListener 将会作为监听器添加到 'connect' 事件上。返回 'net.Socket'。 |
| 7    | **net.createConnection(path[, connectListener])** <br />创建连接到 path 的 unix socket 。参数 connectListener 将会作为监听器添加到 'connect' 事件。返回 'net.Socket'。 |
| 8    | **net.isIP(input)** <br />检测输入的是否为 IP 地址。 IPV4 返回 4， IPV6 返回 6，其他情况返回 0。 |
| 9    | **net.isIPv4(input)** <br />如果输入的地址为 IPV4， 返回 true，否则返回 false。 |
| 10   | **net.isIPv6(input)** <br />如果输入的地址为 IPV6， 返回 true，否则返回 false。 |

------

##### net.Server

net.Server通常用于创建一个 TCP 或本地服务器。

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **server.listen(port[, host]\[, backlog][, callback])** <br />监听指定端口 port 和 主机 host ac连接。 默认情况下 host 接受任何 IPv4 地址(INADDR_ANY)的直接连接。端口 port 为 0 时，则会分配一个随机端口。 |
| 2    | **server.listen(path[, callback])** <br />通过指定 path 的连接，启动一个本地 socket 服务器。 |
| 3    | **server.listen(handle[, callback])** <br />通过指定句柄连接。 |
| 4    | **server.listen(options[, callback])** <br />options 的属性：端口 port, 主机 host, 和 backlog, 以及可选参数 callback 函数, 他们在一起调用server.listen(port, [host], [backlog], [callback])。还有，参数 path 可以用来指定 UNIX socket。 |
| 5    | **server.close([callback])** <br />服务器停止接收新的连接，保持现有连接。这是异步函数，当所有连接结束的时候服务器会关闭，并会触发 'close' 事件。 |
| 6    | **server.address()** <br />操作系统返回绑定的地址，协议族名和服务器端口。 |
| 7    | **server.unref()** <br />如果这是事件系统中唯一一个活动的服务器，调用 unref 将允许程序退出。 |
| 8    | **server.ref()** <br />与 unref 相反，如果这是唯一的服务器，在之前被 unref 了的服务器上调用 ref 将不会让程序退出（默认行为）。如果服务器已经被 ref，则再次调用 ref 并不会产生影响。 |
| 9    | **server.getConnections(callback)** <br />异步获取服务器当前活跃连接的数量。当 socket 发送给子进程后才有效；回调函数有 2 个参数 err 和 count。 |

###### 事件

| 序号 | 事件 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **listening** <br />当服务器调用 server.listen 绑定后会触发。 |
| 2    | **connection** <br />当新连接创建后会被触发。socket 是 net.Socket实例。 |
| 3    | **close** <br />服务器关闭时会触发。注意，如果存在连接，这个事件不会被触发直到所有的连接关闭。 |
| 4    | **error** <br />发生错误时触发。'close' 事件将被下列事件直接调用。 |

------

##### net.Socket

net.Socket 对象是 TCP 或 UNIX Socket 的抽象。net.Socket 实例实现了一个双工流接口。 他们可以在用户创建客户端(使用 connect())时使用, 或者由 Node 创建它们，并通过 connection 服务器事件传递给用户。

###### 事件

net.Socket 事件有：

| 序号 | 事件 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **lookup** <br />在解析域名后，但在连接前，触发这个事件。对 UNIX sokcet 不适用。 |
| 2    | **connect** <br />成功建立 socket 连接时触发。               |
| 3    | **data<br />** 当接收到数据时触发。                          |
| 4    | **end** <br />当 socket 另一端发送 FIN 包时，触发该事件。    |
| 5    | **timeout** <br />当 socket 空闲超时时触发，仅是表明 socket 已经空闲。用户必须手动关闭连接。 |
| 6    | **drain** <br />当写缓存为空得时候触发。可用来控制上传。     |
| 7    | **error** <br />错误发生时触发。                             |
| 8    | **close** <br />当 socket 完全关闭时触发。参数 had_error 是布尔值，它表示是否因为传输错误导致 socket 关闭。 |

###### 属性

net.Socket 提供了很多有用的属性，便于控制 socket 交互：

| 序号 | 属性 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **socket.bufferSize**<br /> 该属性显示了要写入缓冲区的字节数。 |
| 2    | **socket.remoteAddress** <br />远程的 IP 地址字符串，例如：'74.125.127.100' or '2001:4860:a005::68'。 |
| 3    | **socket.remoteFamily** <br />远程IP协议族字符串，比如 'IPv4' or 'IPv6'。 |
| 4    | **socket.remotePort** <br />远程端口，数字表示，例如：80 or 21。 |
| 5    | **socket.localAddress**<br /> 网络连接绑定的本地接口 远程客户端正在连接的本地 IP 地址，字符串表示。例如，如果你在监听'0.0.0.0'而客户端连接在'192.168.1.1'，这个值就会是 '192.168.1.1'。 |
| 6    | **socket.localPort** <br />本地端口地址，数字表示。例如：80 or 21。 |
| 7    | **socket.bytesRead** <br />接收到得字节数。                  |
| 8    | **socket.bytesWritten** <br />发送的字节数。                 |

###### 方法

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **new net.Socket([options])<br />** 构造一个新的 socket 对象。 |
| 2    | **socket.connect(port[, host]\[, connectListener])** <br />指定端口 port 和 主机 host，创建 socket 连接 。参数 host 默认为 localhost。通常情况不需要使用 net.createConnection 打开 socket。只有你实现了自己的 socket 时才会用到。 |
| 3    | **socket.connect(path[, connectListener])** <br />打开指定路径的 unix socket。通常情况不需要使用 net.createConnection 打开 socket。只有你实现了自己的 socket 时才会用到。 |
| 4    | **socket.setEncoding([encoding])** 设置编码                  |
| 5    | **socket.write(data[, encoding]\[, callback])** <br />在 socket 上发送数据。第二个参数指定了字符串的编码，默认是 UTF8 编码。 |
| 6    | **socket.end([data]\[, encoding])** <br />半关闭 socket。例如，它发送一个 FIN 包。可能服务器仍在发送数据。 |
| 7    | **socket.destroy()** <br />确保没有 I/O 活动在这个套接字上。只有在错误发生情况下才需要。（处理错误等等）。 |
| 8    | **socket.pause()**<br /> 暂停读取数据。就是说，不会再触发 data 事件。对于控制上传非常有用。 |
| 9    | **socket.resume()** <br />调用 pause() 后想恢复读取数据。    |
| 10   | **socket.setTimeout(timeout[, callback])** <br />socket 闲置时间超过 timeout 毫秒后 ，将 socket 设置为超时。 |
| 11   | **socket.setNoDelay([noDelay])** <br />禁用纳格（Nagle）算法。默认情况下 TCP 连接使用纳格算法，在发送前他们会缓冲数据。将 noDelay 设置为 true 将会在调用 socket.write() 时立即发送数据。noDelay 默认值为 true。 |
| 12   | **socket.setKeepAlive([enable]\[, initialDelay])** <br />禁用/启用长连接功能，并在发送第一个在闲置 socket 上的长连接 probe 之前，可选地设定初始延时。默认为 false。 设定 initialDelay （毫秒），来设定收到的最后一个数据包和第一个长连接probe之间的延时。将 initialDelay 设为0，将会保留默认（或者之前）的值。默认值为0. |
| 13   | **socket.address()** <br />操作系统返回绑定的地址，协议族名和服务器端口。返回的对象有 3 个属性，比如{ port: 12346, family: 'IPv4', address: '127.0.0.1' }。 |
| 14   | **socket.unref()** <br />如果这是事件系统中唯一一个活动的服务器，调用 unref 将允许程序退出。如果服务器已被 unref，则再次调用 unref 并不会产生影响。 |
| 15   | **socket.ref()** <br />与 unref 相反，如果这是唯一的服务器，在之前被 unref 了的服务器上调用 ref 将不会让程序退出（默认行为）。如果服务器已经被 ref，则再次调用 ref 并不会产生影响。 |

###### 实例

创建 server.js 文件，代码如下所示：

```js
var net = require('net');
var server = net.createServer(function(connection) {
  console.log('client connected');
  connection.on('end',function() {
    console.log('客户端关闭连接');
  });
  connection.write('Hello World! \r\n');
  connection.pipe(connection);
});

server.listen(8080,function() {
  console.log('server is listening');
});
```

执行以上服务端代码：

```
$ node server.js
server is listening   # 服务已创建并监听 8080 端口
```

新开一个窗口，创建 client.js 文件，代码如下所示：

```js
var net = require('net');
var client = net.connect({port:8080},function() {
  console.log('连接到服务器！');
});
client.on('data',function(data) {
  console.log(data.toString());
  client.end();
});
client.on('end',function(){
  console.log('断开与服务器的连接');
});
```

执行以上客户端的代码：

```
连接到服务器！
Hello World!

断开与服务器的连接
```

#### （4）DNS模块

Node.js **DNS** 模块用于解析域名。引入 DNS 模块语法格式如下：

```js
var dns = require("dns")
```

------

###### 方法

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **dns.lookup(hostname[, options], callback)** <br />将域名（比如 'runoob.com'）解析为第一条找到的记录 A （IPV4）或 AAAA(IPV6)。参数 options可以是一个对象或整数。如果没有提供 options，IP v4 和 v6 地址都可以。如果 options 是整数，则必须是 4 或 6。 |
| 2    | **dns.lookupService(address, port, callback)** <br />使用 getnameinfo 解析传入的地址和端口为域名和服务。 |
| 3    | **dns.resolve(hostname[, rrtype], callback)**<br /> 将一个域名（如 'runoob.com'）解析为一个 rrtype 指定记录类型的数组。 |
| 4    | **dns.resolve4(hostname, callback)** <br />和 dns.resolve() 类似, 仅能查询 IPv4 (A 记录）。 addresses IPv4 地址数组 (比如，['74.125.79.104', '74.125.79.105', '74.125.79.106']）。 |
| 5    | **dns.resolve6(hostname, callback)** <br />和 dns.resolve4() 类似， 仅能查询 IPv6( AAAA 查询） |
| 6    | **dns.resolveMx(hostname, callback)** <br />和 dns.resolve() 类似, 仅能查询邮件交换(MX 记录)。 |
| 7    | **dns.resolveTxt(hostname, callback)**<br /> 和 dns.resolve() 类似, 仅能进行文本查询 (TXT 记录）。 addresses 是 2-d 文本记录数组。(比如，[ ['v=spf1 ip4:0.0.0.0 ', '~all' ] ]）。 每个子数组包含一条记录的 TXT 块。根据使用情况可以连接在一起，也可单独使用。 |
| 8    | **dns.resolveSrv(hostname, callback)** <br />和 dns.resolve() 类似, 仅能进行服务记录查询 (SRV 记录）。 addresses 是 hostname可用的 SRV 记录数组。 SRV 记录属性有优先级（priority），权重（weight）, 端口（port）, 和名字（name） (比如，[{'priority': 10, 'weight': 5, 'port': 21223, 'name': 'service.example.com'}, ...]）。 |
| 9    | **dns.resolveSoa(hostname, callback)** <br />和 dns.resolve() 类似, 仅能查询权威记录(SOA 记录）。 |
| 10   | **dns.resolveNs(hostname, callback)**<br /> 和 dns.resolve() 类似, 仅能进行域名服务器记录查询(NS 记录）。 addresses 是域名服务器记录数组（hostname 可以使用） (比如, ['ns1.example.com', 'ns2.example.com']）。 |
| 11   | **dns.resolveCname(hostname, callback)** <br />和 dns.resolve() 类似, 仅能进行别名记录查询 (CNAME记录)。addresses 是对 hostname 可用的别名记录数组 (比如，, ['bar.example.com']）。 |
| 12   | **dns.reverse(ip, callback)** <br />反向解析 IP 地址，指向该 IP 地址的域名数组。 |
| 13   | **dns.getServers()** <br />返回一个用于当前解析的 IP 地址数组的字符串。 |
| 14   | **dns.setServers(servers)** <br />指定一组 IP 地址作为解析服务器。 |

###### rrtypes

以下列出了 dns.resolve() 方法中有效的 rrtypes值:

- `'A'` IPV4 地址, 默认
- `'AAAA'` IPV6 地址
- `'MX'` 邮件交换记录
- `'TXT'` text 记录
- `'SRV'` SRV 记录
- `'PTR'` 用来反向 IP 查找
- `'NS'` 域名服务器记录
- `'CNAME'` 别名记录
- `'SOA'` 授权记录的初始值

------

###### 错误码

每次 DNS 查询都可能返回以下错误码：

- `dns.NODATA`: 无数据响应。
- `dns.FORMERR`: 查询格式错误。
- `dns.SERVFAIL`: 常规失败。
- `dns.NOTFOUND`: 没有找到域名。
- `dns.NOTIMP`: 未实现请求的操作。
- `dns.REFUSED`: 拒绝查询。
- `dns.BADQUERY`: 查询格式错误。
- `dns.BADNAME`: 域名格式错误。
- `dns.BADFAMILY`: 地址协议不支持。
- `dns.BADRESP`: 回复格式错误。
- `dns.CONNREFUSED`: 无法连接到 DNS 服务器。
- `dns.TIMEOUT`: 连接 DNS 服务器超时。
- `dns.EOF`: 文件末端。
- `dns.FILE`: 读文件错误。
- `dns.NOMEM`: 内存溢出。
- `dns.DESTRUCTION`: 通道被摧毁。
- `dns.BADSTR`: 字符串格式错误。
- `dns.BADFLAGS`: 非法标识符。
- `dns.NONAME`: 所给主机不是数字。
- `dns.BADHINTS`: 非法HINTS标识符。
- `dns.NOTINITIALIZED`: c c-ares 库尚未初始化。
- `dns.LOADIPHLPAPI`: 加载 iphlpapi.dll 出错。
- `dns.ADDRGETNETWORKPARAMS`: 无法找到 GetNetworkParams 函数。
- `dns.CANCELLED`: 取消 DNS 查询。

###### 实例

创建 main.js 文件，代码如下所示：

```js
var dns = require('dns');
dns.lookup('www.github.com',function onLookup(err, address, family) {
  console.log('ip地址：',address);
  dns.reverse(address, function(err,hostnames) {
    if (err) {
      console.log(err.stack);
    }
    console.log('反向解析 ' + address + ": " + JSON.stringify(hostnames));
  });
});
/*
ip 地址: 192.30.253.113
反向解析 192.30.253.113: ["lb-192-30-253-113-iad.github.com"]
 */
```

#### （5）Domain模块

Node.js **Domain(域)** 简化异步代码的异常处理，可以捕捉处理try catch无法捕捉的异常。引入 Domain 模块 语法格式如下：

```js
var domain = require("domain")
```

domain模块，把处理多个不同的IO的操作作为一个组。注册事件和回调到domain，**当发生一个错误事件或抛出一个错误时，domain对象会被通知，不会丢失上下文环境，也不导致程序错误立即退出**，与process.on('uncaughtException')不同。

Domain 模块可分为隐式绑定和显式绑定：

- 隐式绑定: 把在domain上下文中定义的变量，自动绑定到domain对象
- 显式绑定: 把不是在domain上下文中定义的变量，以代码的方式绑定到domain对象

------

###### 方法

| 序号 | 方法 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **domain.run(function)** <br />在域的上下文运行提供的函数，隐式的绑定了所有的事件分发器，计时器和底层请求。 |
| 2    | **domain.add(emitter)** <br />显式的增加事件                 |
| 3    | **domain.remove(emitter)** <br />删除事件。                  |
| 4    | **domain.bind(callback)** <br />返回的函数是一个对于所提供的回调函数的包装函数。当调用这个返回的函数时，所有被抛出的错误都会被导向到这个域的 error 事件。 |
| 5    | **domain.intercept(callback)** <br />和 domain.bind(callback) 类似。除了捕捉被抛出的错误外，它还会拦截 Error 对象作为参数传递到这个函数。 |
| 6    | **domain.enter()** <br />进入一个异步调用的上下文，绑定到domain。 |
| 7    | **domain.exit()** <br />退出当前的domain，切换到不同的链的异步调用的上下文中。对应domain.enter()。 |
| 8    | **domain.dispose()** <br />释放一个domain对象，让node进程回收这部分资源。 |
| 9    | **domain.create()** <br />返回一个domain对象。               |

------

###### 属性

| 序号 | 属性 & 描述                                                  |
| ---- | ------------------------------------------------------------ |
| 1    | **domain.members** <br />已加入domain对象的域定时器和事件发射器的数组。 |

###### 实例

创建 main.js 文件，代码如下所示：

```js
var EventEmitter = require("events").EventEmitter;
var domain = require("domain");

var emitter1 = new EventEmitter();

// 创建域
var domain1 = domain.create();

domain1.on('error', function(err){
   console.log("domain1 处理这个错误 ("+err.message+")");
});

// 显式绑定
domain1.add(emitter1);

emitter1.on('error',function(err){
   console.log("监听器处理此错误 ("+err.message+")");
});

emitter1.emit('error',new Error('通过监听器来处理'));

emitter1.removeAllListeners('error');

emitter1.emit('error',new Error('通过 domain1 处理'));

var domain2 = domain.create();

domain2.on('error', function(err){
   console.log("domain2 处理这个错误 ("+err.message+")");
});

// 隐式绑定
domain2.run(function(){
   var emitter2 = new EventEmitter();
   emitter2.emit('error',new Error('通过 domain2 处理'));   
});


domain1.remove(emitter1);
emitter1.emit('error', new Error('转换为异常，系统将崩溃!'));
```

执行以上代码，结果如下所示:

```
监听器处理此错误 (通过监听器来处理)
domain1 处理这个错误 (通过 domain1 处理)
domain2 处理这个错误 (通过 domain2 处理)

events.js:72
        throw er; // Unhandled 'error' event
              ^
Error: 转换为异常，系统将崩溃!
    at Object.<anonymous> (/www/node/main.js:40:24)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
    at startup (node.js:119:16)
    at node.js:929:3
```

## 15、Node.js Web 模块

#### （1）什么是 Web 服务器？

Web服务器一般指网站服务器，是指驻留于因特网上某种类型计算机的程序，Web服务器的基本功能就是提供Web信息浏览服务。它只需支持HTTP协议、HTML文档格式及URL，与客户端的网络浏览器配合。

大多数 web 服务器都支持服务端的脚本语言（php、python、ruby）等，并通过脚本语言从数据库获取数据，将结果返回给客户端浏览器。

目前最主流的三个Web服务器是Apache、Nginx、IIS。

------

#### （2）Web 应用架构

![Web应用框架](.\img\Web应用框架.png)

- **Client** - 客户端，一般指浏览器，浏览器可以通过 HTTP 协议向服务器请求数据。
- **Server** - 服务端，一般指 Web 服务器，可以接收客户端请求，并向客户端发送响应数据。
- **Business** - 业务层， 通过 Web 服务器处理应用程序，如与数据库交互，逻辑运算，调用外部程序等。
- **Data** - 数据层，一般由数据库组成。

------

#### （3）使用 Node 创建 Web 服务器

Node.js 提供了 http 模块，http 模块主要用于搭建 HTTP 服务端和客户端，使用 HTTP 服务器或客户端功能必须调用 http 模块，代码如下：

```js
var http = require('http');
```

以下是演示一个最基本的 HTTP 服务器架构(使用 8080 端口)

###### 实例

创建 server.js 文件，代码如下所示：

```js
var http = require('http');
var fs = require('fs');
var url = require('url');

// 创建服务器
http.createServer( function (request, response) {
  // 解析请求，包括文件名
  var pathname = url.parse(request.url).pathname;

  // 输出请求的文件名
  console.log('Request for ' + pathname + " received.");

  // 从文件系统中读取请求的文件内容
  fs.readFile(pathname.substr(1),function (err,data){
  	if (err){
  	  console.log(err);
  	  // HTTP 状态码：404：NOT FOUND
  	  // Content Type: text/plain
  	  response.writeHead(404,{'Content-Type':'text/html'});
  	}else{
      // HTTP 状态码：200：OK
      // Content Type: text/plain
      response.writeHead(200,{'Content-Type':'text/html'});

      // 响应文件内容
      response.write(data.toString());
  	}
  	// 发送响应数据
  	response.end();
  });
}).listen(8080);

// 控制台会输出以下信息
console.log('Server running at http:127.0.0.1:8080/');
```

接下来我们在该目录下创建一个 index.html 文件，代码如下：

index.html 文件

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>菜鸟教程(runoob.com)</title>
</head>
<body>
    <h1>我的第一个标题</h1>
    <p>我的第一个段落。</p>
</body>
</html>
```

执行 server.js 文件：

```
$ node server.js
Server running at http://127.0.0.1:8080/
```

接着我们在浏览器中打开地址：**http://127.0.0.1:8080/index.html**，显示如下图所示:

执行 server.js 的控制台输出信息如下：

```
Server running at http://127.0.0.1:8080/
Request for /index.html received.     #  客户端请求信息
```

------

#### （4）使用 Node 创建 Web 客户端

Node 创建 Web 客户端需要引入 http 模块

###### 实例

创建 client.js 文件，代码如下所示：

```js
var http = require('http');

// 用于请求的选项
var options = {
  host: 'localhost',
  port: '8080',
  path: '/index.html'
};

// 处理响应的回调函数
var callback = function(response){
  // 不断更新数据
  var body = '';
  response.on('data',function(data){
  	body += data;
  });
  response.on('end',function(){
  	// 数据接收完成
  	console.log(body);
  });
}
// 向服务端发送请求
var req = http.request(options, callback);
req.end();
```

新开一个终端，执行 client.js 文件，输出结果如下：(注意：此时服务器端server.js也要运行)

```
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>菜鸟教程(runoob.com)</title>
</head>
<body>
    <h1>我的第一个标题</h1>
    <p>我的第一个段落。</p>
</body>
</html>
```

执行 server.js 的控制台输出信息如下：

```
Server running at http://127.0.0.1:8080/
Request for /index.html received.   # 客户端请求信息
```

'http'模块提供两种使用方式：

- 作为服务端使用时，创建一个HTTP服务器，监听HTTP客户端请求并返回响应。

- 作为客户端使用时，发起一个HTTP客户端请求，获取服务端响应。

  

首先我们来看看服务端模式下如何工作。

```js
// 网络操作
var http = require('http');
http.createServer(function(request,response){
  response.writeHead(200,{'Content-Type':'text-plain'});
  response.end('Hello World');
}).listen(8142);

```

首先需要使用`.createServer`方法创建一个服务器，然后调用`.listen`方法监听端口。之后，每当来了一个客户端请求，创建服务器时传入的回调函数就被调用一次。可以看出，这是一种事件机制。

HTTP请求本质上是一个数据流，由请求头（headers）和请求体（body）组成。例如以下是一个完整的HTTP请求数据内容。

```
POST / HTTP/1.1
User-Agent: curl/7.26.0
Host: localhost
Accept: */*
Content-Length: 11
Content-Type: application/x-www-form-urlencoded

Hello World
```

可以看到，空行之上是请求头，之下是请求体。HTTP请求在发送给服务器时，可以认为是按照从头到尾的顺序一个字节一个字节地以数据流方式发送的。而`http`模块创建的HTTP服务器在接收到完整的请求头后，就会调用回调函数。在回调函数中，除了可以使用`request`对象访问请求头数据外，还能把`request`对象当作一个只读数据流来访问请求体数据。

```js
const buffer = require('buffer');
const http = require('http');
http.createServer(function(request,response){
  var body = [];
  console.log(request.method);
  console.log(request.headers);

  request.on('data',function(chunk){
  	body.push(chunk);
  });
  request.on('end',function(chunk){
  	body = buffer.concat(body);
  	console.log(body.toString());
  });
}).listen(80);
```

HTTP响应本质上也是一个数据流，同样由响应头（headers）和响应体（body）组成。例如以下是一个完整的HTTP请求数据内容。 

```
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 11
Date: Tue, 05 Nov 2013 05:31:38 GMT
Connection: keep-alive

Hello World
```

在回调函数中，除了可以使用`response`对象来写入响应头数据外，还能把`response`对象当作一个只写数据流来写入响应体数据。例如在以下例子中，服务端原样将客户端请求的请求体数据返回给客户端。 

```js
http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });

    request.on('data', function (chunk) {
        response.write(chunk);
    });

    request.on('end', function () {
        response.end();
    });
}).listen(80);
```

接下来我们看看客户端模式下如何工作。为了发起一个客户端HTTP请求，我们需要指定目标服务器的位置并发送请求头和请求体，以下示例演示了具体做法。

```js
var options = {
        hostname: 'www.example.com',
        port: 80,
        path: '/upload',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

var request = http.request(options, function (response) {});

request.write('Hello World');
request.end();
```

可以看到，`.request`方法创建了一个客户端，并指定请求目标和请求头数据。之后，就可以把`request`对象当作一个只写数据流来写入请求体数据和结束请求。另外，由于HTTP请求中`GET`请求是最常见的一种，并且不需要请求体，因此`http`模块也提供了以下便捷API。

```
http.get('http://www.example.com/', function (response) {});
```

当客户端发送请求并接收到完整的服务端响应头时，就会调用回调函数。在回调函数中，除了可以使用`response`对象访问响应头数据外，还能把`response`对象当作一个只读数据流来访问响应体数据。以下是一个例子。

```
http.get('http://www.example.com/', function (response) {
    var body = [];

    console.log(response.statusCode);
    console.log(response.headers);

    response.on('data', function (chunk) {
        body.push(chunk);
    });

    response.on('end', function () {
        body = Buffer.concat(body);
        console.log(body.toString());
    });
});

------------------------------------
200
{ 'content-type': 'text/html',
  server: 'Apache',
  'content-length': '801',
  date: 'Tue, 05 Nov 2013 06:08:41 GMT',
  connection: 'keep-alive' }
<!DOCTYPE html>
...
```

## 16、异步编程

#### 回调

在代码中，异步编程的直接体现就是回调。异步编程依托于回调来实现，但不能说使用了回调后程序就异步化了。我们首先可以看看以下代码。

```
function heavyCompute(n, callback) {
    var count = 0,
        i, j;

    for (i = n; i > 0; --i) {
        for (j = n; j > 0; --j) {
            count += 1;
        }
    }

    callback(count);
}

heavyCompute(10000, function (count) {
    console.log(count);
});

console.log('hello');

-- Console ------------------------------
100000000
hello
```

可以看到，以上代码中的回调函数仍然先于后续代码执行。JS本身是单线程运行的，不可能在一段代码还未结束运行时去运行别的代码，因此也就不存在异步执行的概念。

但是，如果某个函数做的事情是创建一个别的线程或进程，并与JS主线程并行地做一些事情，并在事情做完后通知JS主线程，那情况又不一样了。我们接着看看以下代码。

```
setTimeout(function () {
    console.log('world');
}, 1000);

console.log('hello');

-- Console ------------------------------
hello
world
```

这次可以看到，回调函数后于后续代码执行了。如同上边所说，JS本身是单线程的，无法异步执行，因此我们可以认为`setTimeout`这类JS规范之外的由运行环境提供的特殊函数做的事情是创建一个平行线程后立即返回，让JS主进程可以接着执行后续代码，并在收到平行进程的通知后再执行回调函数。除了`setTimeout`、`setInterval`这些常见的，这类函数还包括NodeJS提供的诸如`fs.readFile`之类的异步API。

另外，我们仍然回到JS是单线程运行的这个事实上，这决定了JS在执行完一段代码之前无法执行包括回调函数在内的别的代码。也就是说，即使平行线程完成工作了，通知JS主线程执行回调函数了，回调函数也要等到JS主线程空闲时才能开始执行。以下就是这么一个例子。

```
function heavyCompute(n) {
    var count = 0,
        i, j;

    for (i = n; i > 0; --i) {
        for (j = n; j > 0; --j) {
            count += 1;
        }
    }
}

var t = new Date();

setTimeout(function () {
    console.log(new Date() - t);
}, 1000);

heavyCompute(50000);

-- Console ------------------------------
8520
```

可以看到，本来应该在1秒后被调用的回调函数因为JS主线程忙于运行其它代码，实际执行时间被大幅延迟。

#### 代码设计模式

异步编程有很多特有的代码设计模式，为了实现同样的功能，使用同步方式和异步方式编写的代码会有很大差异。以下分别介绍一些常见的模式。

##### 函数返回值

使用一个函数的输出作为另一个函数的输入是很常见的需求，在同步方式下一般按以下方式编写代码：

```
var output = fn1(fn2('input'));
// Do something.
```

而在异步方式下，由于函数执行结果不是通过返回值，而是通过回调函数传递，因此一般按以下方式编写代码：

```
fn2('input', function (output2) {
    fn1(output2, function (output1) {
        // Do something.
    });
});
```

可以看到，这种方式就是一个回调函数套一个回调函多，套得太多了很容易写出`>`形状的代码。

##### 遍历数组

在遍历数组时，使用某个函数依次对数据成员做一些处理也是常见的需求。如果函数是同步执行的，一般就会写出以下代码：

```
var len = arr.length,
    i = 0;

for (; i < len; ++i) {
    arr[i] = sync(arr[i]);
}

// All array items have processed.
```

如果函数是异步执行的，以上代码就无法保证循环结束后所有数组成员都处理完毕了。如果数组成员必须一个接一个串行处理，则一般按照以下方式编写异步代码：

```
(function next(i, len, callback) {
    if (i < len) {
        async(arr[i], function (value) {
            arr[i] = value;
            next(i + 1, len, callback);
        });
    } else {
        callback();
    }
}(0, arr.length, function () {
    // All array items have processed.
}));
```

可以看到，以上代码在异步函数执行一次并返回执行结果后才传入下一个数组成员并开始下一轮执行，直到所有数组成员处理完毕后，通过回调的方式触发后续代码的执行。

如果数组成员可以并行处理，但后续代码仍然需要所有数组成员处理完毕后才能执行的话，则异步代码会调整成以下形式：

```
(function (i, len, count, callback) {
    for (; i < len; ++i) {
        (function (i) {
            async(arr[i], function (value) {
                arr[i] = value;
                if (++count === len) {
                    callback();
                }
            });
        }(i));
    }
}(0, arr.length, 0, function () {
    // All array items have processed.
}));
```

可以看到，与异步串行遍历的版本相比，以上代码并行处理所有数组成员，并通过计数器变量来判断什么时候所有数组成员都处理完毕了。

##### 异常处理

JS自身提供的异常捕获和处理机制——`try..catch..`，只能用于同步执行的代码。以下是一个例子。

```
function sync(fn) {
    return fn();
}

try {
    sync(null);
    // Do something.
} catch (err) {
    console.log('Error: %s', err.message);
}

-- Console ------------------------------
Error: object is not a function
```

可以看到，异常会沿着代码执行路径一直冒泡，直到遇到第一个`try`语句时被捕获住。但由于异步函数会打断代码执行路径，异步函数执行过程中以及执行之后产生的异常冒泡到执行路径被打断的位置时，如果一直没有遇到`try`语句，就作为一个全局异常抛出。以下是一个例子。

```
function async(fn, callback) {
    // Code execution path breaks here.
    setTimeout(function ()　{
        callback(fn());
    }, 0);
}

try {
    async(null, function (data) {
        // Do something.
    });
} catch (err) {
    console.log('Error: %s', err.message);
}

-- Console ------------------------------
/home/user/test.js:4
        callback(fn());
                 ^
TypeError: object is not a function
    at null._onTimeout (/home/user/test.js:4:13)
    at Timer.listOnTimeout [as ontimeout] (timers.js:110:15)
```

因为代码执行路径被打断了，我们就需要在异常冒泡到断点之前用`try`语句把异常捕获住，并通过回调函数传递被捕获的异常。于是我们可以像下边这样改造上边的例子。

```
function async(fn, callback) {
    // Code execution path breaks here.
    setTimeout(function ()　{
        try {
            callback(null, fn());
        } catch (err) {
            callback(err);
        }
    }, 0);
}

async(null, function (err, data) {
    if (err) {
        console.log('Error: %s', err.message);
    } else {
        // Do something.
    }
});

-- Console ------------------------------
Error: object is not a function
```

可以看到，异常再次被捕获住了。在NodeJS中，几乎所有异步API都按照以上方式设计，回调函数中第一个参数都是`err`。因此我们在编写自己的异步函数时，也可以按照这种方式来处理异常，与NodeJS的设计风格保持一致。

有了异常处理方式后，我们接着可以想一想一般我们是怎么写代码的。基本上，我们的代码都是做一些事情，然后调用一个函数，然后再做一些事情，然后再调用一个函数，如此循环。如果我们写的是同步代码，只需要在代码入口点写一个`try`语句就能捕获所有冒泡上来的异常，示例如下。

```
function main() {
    // Do something.
    syncA();
    // Do something.
    syncB();
    // Do something.
    syncC();
}

try {
    main();
} catch (err) {
    // Deal with exception.
}
```

但是，如果我们写的是异步代码，就只有呵呵了。由于每次异步函数调用都会打断代码执行路径，只能通过回调函数来传递异常，于是我们就需要在每个回调函数里判断是否有异常发生，于是只用三次异步函数调用，就会产生下边这种代码。

```
function main(callback) {
    // Do something.
    asyncA(function (err, data) {
        if (err) {
            callback(err);
        } else {
            // Do something
            asyncB(function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    // Do something
                    asyncC(function (err, data) {
                        if (err) {
                            callback(err);
                        } else {
                            // Do something
                            callback(null);
                        }
                    });
                }
            });
        }
    });
}

main(function (err) {
    if (err) {
        // Deal with exception.
    }
});
```

可以看到，回调函数已经让代码变得复杂了，而异步方式下对异常的处理更加剧了代码的复杂度。如果NodeJS的最大卖点最后变成这个样子，那就没人愿意用NodeJS了，因此接下来会介绍NodeJS提供的一些解决方案。

#### 域（Domain）

> **官方文档：** <http://nodejs.org/api/domain.html>
>
> 推荐网站：https://nqdeng.github.io/7-days-nodejs/#1

NodeJS提供了`domain`模块，可以简化异步代码的异常处理。在介绍该模块之前，我们需要首先理解“域”的概念。简单的讲，一个域就是一个JS运行环境，在一个运行环境中，如果一个异常没有被捕获，将作为一个全局异常被抛出。NodeJS通过`process`对象提供了捕获全局异常的方法，示例代码如下

```
process.on('uncaughtException', function (err) {
    console.log('Error: %s', err.message);
});

setTimeout(function (fn) {
    fn();
});

-- Console ------------------------------
Error: undefined is not a function
```

虽然全局异常有个地方可以捕获了，但是对于大多数异常，我们希望尽早捕获，并根据结果决定代码的执行路径。我们用以下HTTP服务器代码作为例子：

```
function async(request, callback) {
    // Do something.
    asyncA(request, function (err, data) {
        if (err) {
            callback(err);
        } else {
            // Do something
            asyncB(request, function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    // Do something
                    asyncC(request, function (err, data) {
                        if (err) {
                            callback(err);
                        } else {
                            // Do something
                            callback(null, data);
                        }
                    });
                }
            });
        }
    });
}

http.createServer(function (request, response) {
    async(request, function (err, data) {
        if (err) {
            response.writeHead(500);
            response.end();
        } else {
            response.writeHead(200);
            response.end(data);
        }
    });
});
```

以上代码将请求对象交给异步函数处理后，再根据处理结果返回响应。这里采用了使用回调函数传递异常的方案，因此`async`函数内部如果再多几个异步函数调用的话，代码就变成上边这副鬼样子了。为了让代码好看点，我们可以在每处理一个请求时，使用`domain`模块创建一个子域（JS子运行环境）。在子域内运行的代码可以随意抛出异常，而这些异常可以通过子域对象的`error`事件统一捕获。于是以上代码可以做如下改造：

```
function async(request, callback) {
    // Do something.
    asyncA(request, function (data) {
        // Do something
        asyncB(request, function (data) {
            // Do something
            asyncC(request, function (data) {
                // Do something
                callback(data);
            });
        });
    });
}

http.createServer(function (request, response) {
    var d = domain.create();

    d.on('error', function () {
        response.writeHead(500);
        response.end();
    });

    d.run(function () {
        async(request, function (data) {
            response.writeHead(200);
            response.end(data);
        });
    });
});
```

可以看到，我们使用`.create`方法创建了一个子域对象，并通过`.run`方法进入需要在子域中运行的代码的入口点。而位于子域中的异步函数回调函数由于不再需要捕获异常，代码一下子瘦身很多。

##### 陷阱

无论是通过`process`对象的`uncaughtException`事件捕获到全局异常，还是通过子域对象的`error`事件捕获到了子域异常，在NodeJS官方文档里都强烈建议处理完异常后立即重启程序，而不是让程序继续运行。按照官方文档的说法，发生异常后的程序处于一个不确定的运行状态，如果不立即退出的话，程序可能会发生严重内存泄漏，也可能表现得很奇怪。

但这里需要澄清一些事实。JS本身的`throw..try..catch`异常处理机制并不会导致内存泄漏，也不会让程序的执行结果出乎意料，但NodeJS并不是存粹的JS。NodeJS里大量的API内部是用C/C++实现的，因此NodeJS程序的运行过程中，代码执行路径穿梭于JS引擎内部和外部，而JS的异常抛出机制可能会打断正常的代码执行流程，导致C/C++部分的代码表现异常，进而导致内存泄漏等问题。

因此，使用`uncaughtException`或`domain`捕获异常，代码执行路径里涉及到了C/C++部分的代码时，如果不能确定是否会导致内存泄漏等问题，最好在处理完异常后重启程序比较妥当。而使用`try`语句捕获异常时一般捕获到的都是JS本身的异常，不用担心上诉问题。

#### 小结

本章介绍了JS异步编程相关的知识，总结起来有以下几点：

- 不掌握异步编程就不算学会NodeJS。
- 异步编程依托于回调来实现，而使用回调不一定就是异步编程。
- 异步编程下的函数间数据传递、数组遍历和异常处理与同步编程有很大差别。
- 使用`domain`模块简化异步代码的异常处理，并小心陷阱。

## 17、大示例

学习讲究的是学以致用和融会贯通。至此我们已经分别介绍了NodeJS的很多知识点，本章作为最后一章，将完整地介绍一个使用NodeJS开发Web服务器的示例。

### 需求

我们要开发的是一个简单的静态文件合并服务器，该服务器需要支持类似以下格式的JS或CSS文件合并请求。

```
http://assets.example.com/foo/??bar.js,baz.js
```

在以上URL中，`??`是一个分隔符，之前是需要合并的多个文件的URL的公共部分，之后是使用`,`分隔的差异部分。因此服务器处理这个URL时，返回的是以下两个文件按顺序合并后的内容。

```
/foo/bar.js
/foo/baz.js
```

另外，服务器也需要能支持类似以下格式的普通的JS或CSS文件请求。

```
http://assets.example.com/foo/bar.js
```

以上就是整个需求。

### 第一次迭代

快速迭代是一种不错的开发方式，因此我们在第一次迭代时先实现服务器的基本功能。

#### 设计

简单分析了需求之后，我们大致会得到以下的设计方案。

```
           +---------+   +-----------+   +----------+
request -->|  parse  |-->|  combine  |-->|  output  |--> response
           +---------+   +-----------+   +----------+
```

也就是说，服务器会首先分析URL，得到请求的文件的路径和类型（MIME）。然后，服务器会读取请求的文件，并按顺序合并文件内容。最后，服务器返回响应，完成对一次请求的处理。

另外，服务器在读取文件时需要有个根目录，并且服务器监听的HTTP端口最好也不要写死在代码里，因此服务器需要是可配置的。

#### 实现

根据以上设计，我们写出了第一版代码如下。

```
var fs = require('fs'),
    path = require('path'),
    http = require('http');

var MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript'
};

function combineFiles(pathnames, callback) {
    var output = [];

    (function next(i, len) {
        if (i < len) {
            fs.readFile(pathnames[i], function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    output.push(data);
                    next(i + 1, len);
                }
            });
        } else {
            callback(null, Buffer.concat(output));
        }
    }(0, pathnames.length));
}

function main(argv) {
    var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
        root = config.root || '.',
        port = config.port || 80;

    http.createServer(function (request, response) {
        var urlInfo = parseURL(root, request.url);

        combineFiles(urlInfo.pathnames, function (err, data) {
            if (err) {
                response.writeHead(404);
                response.end(err.message);
            } else {
                response.writeHead(200, {
                    'Content-Type': urlInfo.mime
                });
                response.end(data);
            }
        });
    }).listen(port);
}

function parseURL(root, url) {
    var base, pathnames, parts;

    if (url.indexOf('??') === -1) {
        url = url.replace('/', '/??');
    }

    parts = url.split('??');
    base = parts[0];
    pathnames = parts[1].split(',').map(function (value) {
        return path.join(root, base, value);
    });

    return {
        mime: MIME[path.extname(pathnames[0])] || 'text/plain',
        pathnames: pathnames
    };
}

main(process.argv.slice(2));
```

以上代码完整实现了服务器所需的功能，并且有以下几点值得注意：

1. 使用命令行参数传递JSON配置文件路径，入口函数负责读取配置并创建服务器。
2. 入口函数完整描述了程序的运行逻辑，其中解析URL和合并文件的具体实现封装在其它两个函数里。
3. 解析URL时先将普通URL转换为了文件合并URL，使得两种URL的处理方式可以一致。
4. 合并文件时使用异步API读取文件，避免服务器因等待磁盘IO而发生阻塞。

我们可以把以上代码保存为`server.js`，之后就可以通过`node server.js config.json`命令启动程序，于是我们的第一版静态文件合并服务器就顺利完工了。

另外，以上代码存在一个不那么明显的逻辑缺陷。例如，使用以下URL请求服务器时会有惊喜。

```
    http://assets.example.com/foo/bar.js,foo/baz.js
```

经过分析之后我们会发现问题出在`/`被自动替换`/??`这个行为上，而这个问题我们可以到第二次迭代时再解决。

### 第二次迭代

在第一次迭代之后，我们已经有了一个可工作的版本，满足了功能需求。接下来我们需要从性能的角度出发，看看代码还有哪些改进余地。

#### 设计

把`map`方法换成`for`循环或许会更快一些，但第一版代码最大的性能问题存在于从读取文件到输出响应的过程当中。我们以处理`/??a.js,b.js,c.js`这个请求为例，看看整个处理过程中耗时在哪儿。

```
 发送请求       等待服务端响应         接收响应
---------+----------------------+------------->
         --                                        解析请求
           ------                                  读取a.js
                 ------                            读取b.js
                       ------                      读取c.js
                             --                    合并数据
                               --                  输出响应
```

可以看到，第一版代码依次把请求的文件读取到内存中之后，再合并数据和输出响应。这会导致以下两个问题：

1. 当请求的文件比较多比较大时，串行读取文件会比较耗时，从而拉长了服务端响应等待时间。
2. 由于每次响应输出的数据都需要先完整地缓存在内存里，当服务器请求并发数较大时，会有较大的内存开销。

对于第一个问题，很容易想到把读取文件的方式从串行改为并行。但是别这样做，因为对于机械磁盘而言，因为只有一个磁头，尝试并行读取文件只会造成磁头频繁抖动，反而降低IO效率。而对于固态硬盘，虽然的确存在多个并行IO通道，但是对于服务器并行处理的多个请求而言，硬盘已经在做并行IO了，对单个请求采用并行IO无异于拆东墙补西墙。因此，正确的做法不是改用并行IO，而是一边读取文件一边输出响应，把响应输出时机提前至读取第一个文件的时刻。这样调整后，整个请求处理过程变成下边这样。

```
发送请求 等待服务端响应 接收响应
---------+----+------------------------------->
         --                                        解析请求
           --                                      检查文件是否存在
             --                                    输出响应头
               ------                              读取和输出a.js
                     ------                        读取和输出b.js
                           ------                  读取和输出c.js
```

按上述方式解决第一个问题后，因为服务器不需要完整地缓存每个请求的输出数据了，第二个问题也迎刃而解。

#### 实现

根据以上设计，第二版代码按以下方式调整了部分函数。

```
function main(argv) {
    var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
        root = config.root || '.',
        port = config.port || 80;

    http.createServer(function (request, response) {
        var urlInfo = parseURL(root, request.url);

        validateFiles(urlInfo.pathnames, function (err, pathnames) {
            if (err) {
                response.writeHead(404);
                response.end(err.message);
            } else {
                response.writeHead(200, {
                    'Content-Type': urlInfo.mime
                });
                outputFiles(pathnames, response);
            }
        });
    }).listen(port);
}

function outputFiles(pathnames, writer) {
    (function next(i, len) {
        if (i < len) {
            var reader = fs.createReadStream(pathnames[i]);

            reader.pipe(writer, { end: false });
            reader.on('end', function() {
                next(i + 1, len);
            });
        } else {
            writer.end();
        }
    }(0, pathnames.length));
}

function validateFiles(pathnames, callback) {
    (function next(i, len) {
        if (i < len) {
            fs.stat(pathnames[i], function (err, stats) {
                if (err) {
                    callback(err);
                } else if (!stats.isFile()) {
                    callback(new Error());
                } else {
                    next(i + 1, len);
                }
            });
        } else {
            callback(null, pathnames);
        }
    }(0, pathnames.length));
}
```

可以看到，第二版代码在检查了请求的所有文件是否有效之后，立即就输出了响应头，并接着一边按顺序读取文件一边输出响应内容。并且，在读取文件时，第二版代码直接使用了只读数据流来简化代码。

### 第三次迭代

第二次迭代之后，服务器本身的功能和性能已经得到了初步满足。接下来我们需要从稳定性的角度重新审视一下代码，看看还需要做些什么。

#### 设计

从工程角度上讲，没有绝对可靠的系统。即使第二次迭代的代码经过反复检查后能确保没有bug，也很难说是否会因为NodeJS本身，或者是操作系统本身，甚至是硬件本身导致我们的服务器程序在某一天挂掉。因此一般生产环境下的服务器程序都配有一个守护进程，在服务挂掉的时候立即重启服务。一般守护进程的代码会远比服务进程的代码简单，从概率上可以保证守护进程更难挂掉。如果再做得严谨一些，甚至守护进程自身可以在自己挂掉时重启自己，从而实现双保险。

因此在本次迭代时，我们先利用NodeJS的进程管理机制，将守护进程作为父进程，将服务器程序作为子进程，并让父进程监控子进程的运行状态，在其异常退出时重启子进程。

#### 实现

根据以上设计，我们编写了守护进程需要的代码。

```
var cp = require('child_process');

var worker;

function spawn(server, config) {
    worker = cp.spawn('node', [ server, config ]);
    worker.on('exit', function (code) {
        if (code !== 0) {
            spawn(server, config);
        }
    });
}

function main(argv) {
    spawn('server.js', argv[0]);
    process.on('SIGTERM', function () {
        worker.kill();
        process.exit(0);
    });
}

main(process.argv.slice(2));
```

此外，服务器代码本身的入口函数也要做以下调整。

```
function main(argv) {
    var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
        root = config.root || '.',
        port = config.port || 80,
        server;

    server = http.createServer(function (request, response) {
        ...
    }).listen(port);

    process.on('SIGTERM', function () {
        server.close(function () {
            process.exit(0);
        });
    });
}
```

我们可以把守护进程的代码保存为`daemon.js`，之后我们可以通过`node daemon.js config.json`启动服务，而守护进程会进一步启动和监控服务器进程。此外，为了能够正常终止服务，我们让守护进程在接收到`SIGTERM`信号时终止服务器进程。而在服务器进程这一端，同样在收到`SIGTERM`信号时先停掉HTTP服务再正常退出。至此，我们的服务器程序就靠谱很多了。

### 第四次迭代

在我们解决了服务器本身的功能、性能和可靠性的问题后，接着我们需要考虑一下代码部署的问题，以及服务器控制的问题。

#### 设计

一般而言，程序在服务器上有一个固定的部署目录，每次程序有更新后，都重新发布到部署目录里。而一旦完成部署后，一般也可以通过固定的服务控制脚本启动和停止服务。因此我们的服务器程序部署目录可以做如下设计。

```
- deploy/
    - bin/
        startws.sh
        killws.sh
    + conf/
        config.json
    + lib/
        daemon.js
        server.js
```

在以上目录结构中，我们分类存放了服务控制脚本、配置文件和服务器代码。

#### 实现

按以上目录结构分别存放对应的文件之后，接下来我们看看控制脚本怎么写。首先是`start.sh`。

```
#!/bin/sh
if [ ! -f "pid" ]
then
    node ../lib/daemon.js ../conf/config.json &
    echo $! > pid
fi
```

然后是`killws.sh`。

```
#!/bin/sh
if [ -f "pid" ]
then
    kill $(tr -d '\r\n' < pid)
    rm pid
fi
```

于是这样我们就有了一个简单的代码部署目录和服务控制脚本，我们的服务器程序就可以上线工作了。

### 后续迭代

我们的服务器程序正式上线工作后，我们接下来或许会发现还有很多可以改进的点。比如服务器程序在合并JS文件时可以自动在JS文件之间插入一个`;`来避免一些语法问题，比如服务器程序需要提供日志来统计访问量，比如服务器程序需要能充分利用多核CPU，等等。而此时的你，在学习了这么久NodeJS之后，应该已经知道该怎么做了。

### 小结

本章将之前零散介绍的知识点串了起来，完整地演示了一个使用NodeJS开发程序的例子，至此我们的课程就全部结束了。以下是对新诞生的NodeJSer的一些建议。

- 要熟悉官方API文档。并不是说要熟悉到能记住每个API的名称和用法，而是要熟悉NodeJS提供了哪些功能，一旦需要时知道查询API文档的哪块地方。
- 要先设计再实现。在开发一个程序前首先要有一个全局的设计，不一定要很周全，但要足够能写出一些代码。
- 要实现后再设计。在写了一些代码，有了一些具体的东西后，一定会发现一些之前忽略掉的细节。这时再反过来改进之前的设计，为第二轮迭代做准备。
- 要充分利用三方包。NodeJS有一个庞大的生态圈，在写代码之前先看看有没有现成的三方包能节省不少时间。
- 不要迷信三方包。任何事情做过头了就不好了，三方包也是一样。三方包是一个黑盒，每多使用一个三方包，就为程序增加了一份潜在风险。并且三方包很难恰好只提供程序需要的功能，每多使用一个三方包，就让程序更加臃肿一些。因此在决定使用某个三方包之前，最好三思而后行。