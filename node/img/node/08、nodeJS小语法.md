#### 1、map

这里的`map`不是“地图”的意思，而是指“映射”。`[].map();` 基本用法跟`forEach`方法类似：

```js
array.map(callback,[ thisObject]);
```

`callback`的参数也类似：

```js
[].map(function(value, index, array) {
    // ...
});
```

`map`方法的作用不难理解，“映射”嘛，也就是原数组被“映射”成对应新数组。下面这个例子是数值项求平方：

```js
var data = [1, 2, 3, 4];

var arrayOfSquares = data.map(function (item) {
  return item * item;
});

alert(arrayOfSquares); // 1, 4, 9, 16
```

`callback`需要有`return`值，如果没有，就像下面这样：

```js
var data = [1, 2, 3, 4];
var arrayOfSquares = data.map(function() {});

arrayOfSquares.forEach(console.log);
```

结果如下图，可以看到，数组所有项都被映射成了`undefined`：
![全部项都成了undefined ](http://image.zhangxinxu.com/image/blog/201304/2013-04-25_105958.png)

在实际使用的时候，我们可以利用`map`方法方便获得对象数组中的特定属性值们。例如下面这个例子（之后的兼容demo也是该例子）：

```js
var users = [
  {name: "张含韵", "email": "zhang@email.com"},
  {name: "江一燕",   "email": "jiang@email.com"},
  {name: "李小璐",  "email": "li@email.com"}
];

var emails = users.map(function (user) { return user.email; });

console.log(emails.join(", ")); // zhang@email.com, jiang@email.com, li@email.com
```

`Array.prototype`扩展可以让IE6-IE8浏览器也支持`map`方法：

```js
if (typeof Array.prototype.map != "function") {
  Array.prototype.map = function (fn, context) {
    var arr = [];
    if (typeof fn === "function") {
      for (var k = 0, length = this.length; k < length; k++) {      
         arr.push(fn.call(context, this[k], k, this));
      }
    }
    return arr;
  };
}
```

#### 2、nodejs `${}` 取值用法

a.js如下

```
module.exports = {
    publicPath:'abc'
}
```

b.js如下：

```
var a = require('./a');

function buildConfig() {
    var b = {
        publicPath: `${a.publicPath}`
    }

    console.log(b);

}


module.exports = buildConfig();
```

当执行node b.js的时候发现是可以打印输出a.js里面定义的publicPath的值的。

#### 3、Array对象

Array 对象用于在单个的变量中存储多个值。

###### 创建 Array 对象的语法：

```
new Array();
new Array(size);
new Array(element0, element1, ..., elementn);
```

###### 参数

参数 *size* 是期望的数组元素个数。返回的数组，length 字段将被设为 *size* 的值。

参数 *element* ..., *elementn* 是参数列表。当使用这些参数来调用构造函数 Array() 时，新创建的数组的元素就会被初始化为这些值。它的 length 字段也会被设置为参数的个数。

###### 返回值

返回新创建并被初始化了的数组。

如果调用构造函数 Array() 时没有使用参数，那么返回的数组为空，length 字段为 0。

当调用构造函数时只传递给它一个数字参数，该构造函数将返回具有指定个数、元素为 undefined 的数组。

当其他参数调用 Array() 时，该构造函数将用参数指定的值初始化数组。

当把构造函数作为函数调用，不使用 new 运算符时，它的行为与使用 new 运算符调用它时的行为完全一样。

###### Array 对象属性

| 属性                                                         | 描述                               |
| ------------------------------------------------------------ | ---------------------------------- |
| [constructor](http://www.w3school.com.cn/jsref/jsref_constructor_array.asp) | 返回对创建此对象的数组函数的引用。 |
| [length](http://www.w3school.com.cn/jsref/jsref_length_array.asp) | 设置或返回数组中元素的数目。       |
| [prototype](http://www.w3school.com.cn/jsref/jsref_prototype_array.asp) | 使您有能力向对象添加属性和方法。   |

###### Array 对象方法

| 方法                                                         | 描述                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [concat()](http://www.w3school.com.cn/jsref/jsref_concat_array.asp) | 连接两个或更多的数组，并返回结果。                           |
| [join()](http://www.w3school.com.cn/jsref/jsref_join.asp)    | 把数组的所有元素放入一个字符串。元素通过指定的分隔符进行分隔。 |
| [pop()](http://www.w3school.com.cn/jsref/jsref_pop.asp)      | 删除并返回数组的最后一个元素                                 |
| [push()](http://www.w3school.com.cn/jsref/jsref_push.asp)    | 向数组的末尾添加一个或更多元素，并返回新的长度。             |
| [reverse()](http://www.w3school.com.cn/jsref/jsref_reverse.asp) | 颠倒数组中元素的顺序。                                       |
| [shift()](http://www.w3school.com.cn/jsref/jsref_shift.asp)  | 删除并返回数组的第一个元素                                   |
| [slice()](http://www.w3school.com.cn/jsref/jsref_slice_array.asp) | 从某个已有的数组返回选定的元素                               |
| [sort()](http://www.w3school.com.cn/jsref/jsref_sort.asp)    | 对数组的元素进行排序                                         |
| [splice()](http://www.w3school.com.cn/jsref/jsref_splice.asp) | 删除元素，并向数组添加新元素。                               |
| [toSource()](http://www.w3school.com.cn/jsref/jsref_tosource_array.asp) | 返回该对象的源代码。                                         |
| [toString()](http://www.w3school.com.cn/jsref/jsref_toString_array.asp) | 把数组转换为字符串，并返回结果。                             |
| [toLocaleString()](http://www.w3school.com.cn/jsref/jsref_toLocaleString_array.asp) | 把数组转换为本地数组，并返回结果。                           |
| [unshift()](http://www.w3school.com.cn/jsref/jsref_unshift.asp) | 向数组的开头添加一个或更多元素，并返回新的长度。             |
| [valueOf()](http://www.w3school.com.cn/jsref/jsref_valueof_array.asp) | 返回数组对象的原始值                                         |

#### 4、async,await

记得先npm install 一下

async一般**修饰一个函数**，说明这个函数是异步的。

await一般是用来**执行异步操作**的，很多情况下它的后面会跟着Promise对象 

async和await提出的意义在于：用同步的方式处理异步！ 

###### Async的内容主要分为三部分

1. 流程控制： 简化九种常见的流程的处理
2. 集合处理：如何使用异步操作处理集中的数据
3. 工具类：几个常用的工具类

------

###### 1.series(task, [callback])

(多个函数依次执行，之间没有数据交换)

有多个异步函数需要依次调用，一个完成之后才能执行下一个。各函数之间没有数据交换，仅仅需要保证其顺序执行。这时可以使用series。

纯js代码

```
step1(function (err, v1) {
    step2(function(err, v2){
        step3(function(err,v3){
            //code with the value [v1|v2|v3] or err
        });
    });
});
```

从上面的代码中可以看到，这些嵌套还是比较深的，如果操作更加复杂，那么会让代码的可读性降低。此外，在代码中忽略了对每一层err的处理，否则还要加上if(err) return callback(err);
那就更麻烦了。

对于这种情况，我们可以使用async来处理

```
var async = require('async');
async.series([
    function(callback){
        step1(function(err, v1){
            //code with v1
            callback(err, v1);
        });
    },
    function(callback){step2(……)},
    function(callback){step3(……)}
],function(err, values){
    //code with the value [v1|v2|v3] or the err
});
```

上述async的详细解释为

1. 依次执行一个函数数组中的每个函数，每一个函数执行完成之后才能执行下一个函数。
2. 如果任何一个函数向它的回调函数中传了一个error，则后面的函数都不会被执行，并且将会立刻将该error以及已经执行了的函数的结果，传给series中最后的那个callback。
3. 将所有的函数执行完后(没有出错),则会把每个函数传给其回调函数的结果合并为一个数组，传给series最后的那个callback。
4. 还可以以json的形式提供tasks。每一个属性都会被当作函数来执行，并且结果也会以json形式传给series中最后的那个callback。这种方式可读性更高

注： 多个series调用之间是不分先后的，因为series本身也是异步调用。

###### 2.parallel

(tasks,[callback])(多个函数并行执行)

并行执行多个函数，每个函数都是立刻执行，不需要等待其他函数先执行。传给最终callback的数组中的数据按照tasks声明的顺序，而不是执行完成的顺序。

如果某个函数出错，则立刻将err和已经执行完的函数的结果值传给parallel最终的callback。其它为执行完的函数的值不会传到最终数据，但要占个位置。

同时支持json形式的tasks，其最终callback的结果也为json形式。

正常执行的代码如下：

```
async.parallel([
    function(callback){t.fire('f400', callback, 400)},
    function(callback){t.fire('f200', callback, 200)},
    function(callback){t.fire('f300', callback, 300)}
],function(err, results){
    log(err); //->undefined
    log(results); //->['f400', 'f200', 'f300']
});
```

中途出错的代码如下：

```
async.parallel([
    function(callback){t.fire('f400', callback, 400)},
    function(callback){t.fire('f200', callback, 200)},
    function(callback){t.err('e300', callback, 300)}
], function(err, results){
    log(err); //->e300
    log(results); //->[, 'f200', undefined]
});
```

###### 3.waterfall

(tasks, [callback])(多个函数依次执行，且前一个的输出为后一个的输入)

与series相似，按顺序依次执行多个函数。不同之处，每一个函数产生的值，都将传给下一个函数，如果中途出错，后面的函数将不会执行，错误信息以及之前产生的结果，都传给waterfall最终的callback。

这个函数的名字为waterfall(瀑布）,可以想象瀑布从上到下，承上启下，有点类似于linux中的pipes。 注意该函数不支持json格式的tasks。

```
async.waterfall([
    function(callback){log('start'), callback(null, 3)},
    function(n, callback){log(n), t.inc(n, cb);/*inc为类似于i++的函数*/},
    function(n, callback){log(n), t.fire(n*n, cb);}
], function(err, results){
    log(err);
    log(results);
});

/**
    output

    start
    3
    4
    err: null
    results: 16
 */
```

###### 4.auto

(tasks, [callback])(多个函数有依赖关系， 有的并行执行，有的一次执行)

auto可以弥补parallel和series中的不足

例如我要完成下面的事情

1. 从某处取得数据
2. 在硬盘上建立一个新的目录
3. 将数据写入到目录下某文件
4. 发送邮件

```
async.auto({
    getData: function(callback){
        setTimeout(function(){
            console.log('got data');
            callback(null, 'mydata');
        }, 300);
    },
    makeFolder: function(callback){
        setTimeout(function() {
            console.log('made folder');
            callback(null, 'myfolder');
        }, 200);
    },
    writeFile:['getData', 'makeFolder', function(callback){
        setTimeout(function(){
            console.log('write file');
            callback(null, 'myfile');
        }, 300);
    }],
    emailFiles: ['writeFile', function(callback, results){
        log('send email');
        callback(null, results.writeFile);
    }]
},function(err, results){
    log(err); //->null
    log(results);
    //made folder
    //got data
    //write file
    //send email

    /*
    results{
        makeFolder: 'myfolder',
        getData: 'mydata',
        writeFile: 'myfile',
        emailFiles: 'myfile'
    }
    */
});
```

###### 5.whilst(test, fn, callback)

(该函数的功能比较简单，条件变量通常定义在外面，可供每个函数访问。在循环中，异步调用时产生的值实际上被丢弃了，因为最后的callback只能传入错误信息，另外，第二个函数fn需要接受一个函数的cb, 这个cb最终必需被执行，用于表示出错或正常结束)

```
var count = 0;
async.whilst(
    //test
    function(){return count < 3;},
    function(cb){
        log(count);
        count++;
        setTimeout(cb, 1000);
    },
    function(err){
        //3s have passed
        log(err);
    }
);
/*
    0
    1
    2
    null
*/
```

###### 6.until

(test, fn, callback)(与whilst相似，但判断条件相反)

```
var count_until = 0;
async.until(
    //test
    function(){ return count_until > 3;},
    function(cb){
        log(count_until);
        count_until++;
        setTimeout(cb, 1000);
    },
    function(err){
        //4s have passed
        log(err);
    }
);
/*
    0
    1
    2
    3
    null
*/
```

###### 7.queue

(可设定worker数量的队列)

queue相当于一个加强版的parallel， 主要限制了worker数量，不再一次性全部执行。当worker数量不够用时，新加入的任务将会排队等候，直到有新的worker可用。

该函数有多个点可供回调，如worker用完时、无等候任务时、全部执行完时等。

```
//定义一个queue， 设worker数量为2
var q = async.queue(function(task, callback){
    log('worker is processing task: ' + task.name);
    task.run(callback);
}, 2);
//监听：如果某次push操作后， 任务数将达到或超过worker数量时， 将调用该函数
q.saturated = function(){
    log('all workers to be used');
}
//监听：当最后一个任务交给worker时，将调用该函数
q.empty = function(){
    log('no more tasks waiting');
}
//监听：当所有任务都执行完以后，将调用该函数
q.drain = function(){
    log('all tasks have been processed');
}

//独立加入两个任务
q.push({name : 't1', run: function(cb){
    log('t1 is running, waiting tasks:' + q.length());
    t.fire('t2', cb, 400); //400ms后执行
}}, function(err){
    log('t1 executed');
});

log('pushed t1, waiting tasks:' + q.length());

q.push({name: 't2', run: function(cb){
    log('t2 is running, waiting tasks:' + q.length());
    t.fire('t2', cb, 200); //200ms后执行
}}, function(err){
    log('t2 executed');
});

log('pushed t2, waiting tasks:' + q.length());

/**
    pushed t1, waiting tasks:1
    all workers to be used
    pushed t2, waiting tasks:2
    worker is processing task : t1
    t1 is running, waiting tasks: 1
    no more tasks waiting
    worker is processing task : t2
    t2 is running, waiting tasks: 0
    t2 executed
    t1 executed
    all tasks have been processed
 */
```

###### 8.iterator(tasks)

(将几个函数包装为iterator)

将一组函数包装成为一个iterator， 可通过next()得到以下一个函数为起点的新的iterator。该函数通常由async在内部使用，但如果需要时，也可在我们的代码中使用它。

```
var iter = async.iterator([
    function(){console.log('111');},
    function(){console.log('222');},
    function(){console.log('333');}
]);

var it1 = iter();
it1();
```

其中还包括了next()方法。

###### 9.nextTick(callback)

(在nodejs与浏览器两边行为一致)

nextTick的作用和nodejs的nextTick一样，都是把某个函数调用放在队列的尾部，但在浏览器端，只能使用setTimeout(callback, 0)，但这个方法有时候会让其它高优先级的任务插到前面去。

所以提供了这个nextTick,让同样的代码在服务器端和浏览器端表现一致。

```
var calls = [];
async.nextTick(function(){
    calls.push('two');
});
calls.push('one');
async.nextTick(function(){
    console.log(calls); //-> ['one', 'two']
})
```

上述内容为学习笔记，大部分内容摘抄自alsotang的github中的async_demo,[网址](https://github.com/alsotang/async_demo)

##### node异步用await和不用await的区别

###### 不加await

```js
async test(ctx,next){
    this.doThing().then(console.log('done Thing'))
    this.doAnotherThing();
    console.log('this way');
  }

  async doThing() {
    this.doA();
    this.doB();
  }

  doAnotherThing() {
    console.log('do another thing')
  }

  async doA() {
    return new Promise(resove => {
      setTimeout(() => {
        console.log('done A')
        resove()
      }, 1000)
    })
  }

  async doB() {
    return new Promise(resove => {
      setTimeout(() => {
        console.log('done B')
        resove()
      }, 100)
    })
  }
```

运行test函数以后，命令行迅速依次打印了如下结果 
![async_await](..\img\async_await01.png)

我们看到，没有加await，异步函数A,B顺序执行，由于A运行时间较长，所以B先执行完成，整个过程没有阻塞。

###### 加await

```js
async test(ctx,next){
    this.doThing().then(console.log('done Thing'))
    this.doAnotherThing();
    console.log('this way');
  }

  async doThing() {
    await this.doA()
    await this.doB()
  }

  doAnotherThing() {
    console.log('do another thing')
  }

  async doA() {
    return new Promise(resove => {
      setTimeout(() => {
        console.log('done A')
        resove()
      }, 1000)
    })
  }

  async doB() {
    return new Promise(resove => {
      setTimeout(() => {
        console.log('done B')
        resove()
      }, 100)
    })
  }
```

运行结果如下 ： 
![async_await02](..\img\async_await02.png)
由于加了await，所以要等待异步事件A先完成，然后才会进行事件B。也就是await不会阻塞同步事件的运行，但是异步却是一个一个执行的，其中一个阻塞，下一个异步事件就无法继续。

##### 总结

可见，await也并不是每次都要使用。如果不需要返回值的话，在执行的时候，不加await能够加快函数的运行。 

#### 5、call方法

js是一个伪面向对象的语言，他也有继承的办法。 
下面看在js当中如何实现继承 可以采用call 和 apply的方法当然在nodejs当中专门有了继承的办法，在这里直说call和apply

```
var pet = {
    words:'...',
    speak:function(somebody){
        console.log(somebody+"speak"+this.words);
    }
}
var dog = {
    words:"wang"
}
pet.speak.call(dog,'dog');12345678910
```

**结果为：** 
![call01](..\img\call01.png)
这样封装还不好，因为是在使用的时候才添加最好向下面一样去封装。

```
function Pet(words){
    this.words = words;
    this.speak = function(){
        console.log(this.words);
    }
}
function Dog(){
    Pet.call(this,wang);
}

var dog = new Dog();
dog.speak();123456789101112
```

**结果为：** 
![call02](..\img\call02.png)

dog本身是没有speak方法的这样就可以让dog去继承了pet的speak的方法

#### 6、箭头函数

https://www.cnblogs.com/fundebug/p/6904753.html

https://www.cnblogs.com/moqiutao/p/7886277.html