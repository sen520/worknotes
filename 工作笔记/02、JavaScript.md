#### 1、javascript:void(0)

javascript:void(0)表示不做任何动作 

**Javascript中void是一个操作符，该操作符指定要计算一个表达式但是不返回值。** 

```html
<a href="javascript:void(0);" onclick="alert('ok');"></a>  
// 这里表示这个链接不做跳转动作，执行onClick事件。
```

##### （1）void 操作符用法格式如下

1. javascript:void (expression) 
2. javascript:void expression 

expression 是一个要计算的 Javascript 标准的表达式。 



下面的代码创建了一个超级链接，用户单时会提交表单。

```html
<a HREF="javascript:void(document.form.submit())">单此处提交表单</a>
```

##### （2）a href=#与 a href=javascript:void(0) 的区别链接的几种办法

\#包含了一个位置信息

默认的锚点是#top 也就是网页的上端

而javascript:void(0)   仅仅表示一个死链接

这就是为什么有的时候页面很长浏览链接明明是#是

跳动到了页首

而javascript:void(0) 则不是如此

所以调用脚本的时候最好用void(0)或者\<input onclick>、\<div onclick>等

#### 2、函数

##### (1) arguments.length

arguments.length 属性返回函数接收到参数的个数

```html
<script>
function myFunction(a, b) {
    return arguments.length;
}
document.getElementById("demo").innerHTML = myFunction(4, 3);
</script>
```

##### (2) toString()

toString() 方法将函数作为一个字符串返回

```html
<script>
function myFunction(a, b) {
    return a * b;
}
document.getElementById("demo").innerHTML = myFunction.toString();
</script>
```

##### (3) 函数表达式的自调用

函数表达式可以 "自调用"。

自调用表达式会自动调用。

如果表达式后面紧跟 () ，则会自动调用。

不能自调用声明的函数。

通过添加括号，来说明它是一个函数表达式：

```html
<script>
(function () {
    document.getElementById("demo").innerHTML = "Hello! 我是自己调用的";
})();
</script>
```

#### 4、对象

##### (1) arguments

这个函数体内的arguments非常特殊，实际上是所在函数的一个内置类数组对象，可以用数组的[i]和.length。 



js语法不支持重载！但可用arguments对象模拟重载效果。

arguments对象：函数对象内，自动创建的专门接收所有参数值的类数组对象。
arguments[i]: 获得传入的下标为i的参数值
arguments.length: 获得传入的参数个数！

重载：

　　程序中可定义多个相同函数名，不同参数列表的函数，
　　调用者不必区分每个函数的参数，
　　执行时，程序根据传入的参数个数，自动判断选择哪个函数执行。

```js
//1、如果用户传入一个参数，求平方
    function sum(a){
        console.log(a*a);
    }

    //如果用户传入两个参数，就求和
    function sum(a,b){
        console.log(a+b);
    }
    sum(4); //？
    sum(4,5); //？
```

上述例子中本意是想让同名函数sum()根据参数不同输出不同结果，但是sum是函数名字，本质也是个变量，第二个会覆盖第一个，所以上述的正确输出答案是：NaN,9.所以这样显然不可以。

如果用arguments,就简单多了。

```js
//2、
    function calc(){
        //如果用户传入一个参数，求平方
        if(arguments.length==1){
            console.log(arguments[0]*arguments[0]);
        }else if(arguments.length==2){
        //如果用户传入两个参数，就求和
            console.log(arguments[0]+arguments[1]);
        }
    }
    calc(4); //16
    calc(4,5); //9
    
/*3、无论用户传入几个数字，都可以求和*/
    function add(){
        //arguments:[]
        //遍历arguments中每个元素，并累加
        for(var i=0,sum=0;i<arguments.length;sum+=arguments[i++]);
        return sum;//返回和
    }

    console.log(add(1,2,3)); //6
    console.log(add(1,2,3,4,5,6)); //21
```

###### python 中为什么不需要重载

函数重载主要是为了解决两个问题。

（1）可变参数类型。

（2） 可变参数个数。

另外，一个基本的设计原则是，仅仅当两个函数除了参数类型和参数个数不同以外，其功能是完全相同的，此时才使用函数重载，如果两个函数的功能其实不同，那么不应当使用重载，而应当使用一个名字不同的函数。

 好吧，那么对于情况 （1），函数功能相同，但是参数类型不同，python 如何处理？答案是根本不需要处理，因为 python 可以接受任何类型的参数，如果函数的功能相同，那么不同的参数类型在 python 中很可能是相同的代码，没有必要做成两个不同函数。

 那么对于情况 （2），函数功能相同，但参数个数不同，python 如何处理？答案就是缺省参数。对那些缺少的参数设定为缺省参数即可解决问题。因为你假设函数功能相同，那么那些缺少的参数终归是需要用的。

 好了，鉴于情况 （1） 跟 情况 （2） 都有了解决方案，python 自然就不需要函数重载了。

这里顺便说一下python中参数传递时候的*arg和**args，看几个小栗子就一清二楚了：

第一个小栗子：

```
1 def test1(farg,*args):
2     print ("farg:",farg)
3     for value in args:
4         print ("args:",value)
5 
6 test1(1,"two",3,"4")
```

#### 5、闭包

```js
var add = (function () {
    var counter = 0;
    return function () {return counter += 1;}
})();
function myFunction(){
    document.getElementById("demo").innerHTML = add();
}
    
    
add();
add();
add();

// 计数器为 3
```

变量 **add** 指定了函数自我调用的返回字值。

自我调用函数只执行一次。设置计数器为 0。并返回函数表达式。

add变量可以作为一个函数使用。非常棒的部分是它**可以访问函数上一层作用域的计数器**。

这个叫作 JavaScript **闭包。**它使得函数拥有私有变量变成可能。

计数器受匿名函数的作用域保护，只能通过 add 方法修改。

#### 6、js查找HTML元素的方式、方法



一、HTMLCollection（document.getElement....）



二、NodeList（querySelectorAll (......)）



三、二者的区别和共同点

HTMLCollection是 HTML 元素的集合。

NodeList 是一个文档节点的集合。

NodeList 与 HTMLCollection 有很多类似的地方。

NodeList 与 HTMLCollection 都与数组对象有点类似，可以使用索引 (0, 1, 2, 3, 4, ...) 来获取元素。

NodeList 与 HTMLCollection 都有 length 属性。

HTMLCollection 元素可以通过 name，id 或索引来获取。

NodeList 只能通过索引来获取。

只有 NodeList 对象有包含属性节点和文本节点。



**注意：节点列表不是一个数组！**

节点列表看起来可能是一个数组，但其实不是。

你可以像数组一样，使用索引来获取元素。

节点列表无法使用数组的方法： valueOf(), pop(), push(), 或 join() 。



##### （1）通过id

通过id可以直接操作标签（原因是id唯一）

``` html
<p id="p1">Hello World!</p>
<script>
document.getElementById("p1").innerHTML="新文本!";
</script>
```



以下两种不行，每个类名、标签都可能不唯一，在操作的时候需要注明是第几个标签

##### （2）通过classname

``` html
<p class="p1">Hello World!</p>
<script>
document.getElementsByClassName("p1")[0].innerHTML="新文本!";
// 注意：在此操作的时候必须指明（只有一个也必须标明），虽然不会报错，但是看不到执行效果
</script>
```

##### （3）通过tag标签（与classname类似）

``` html
<p id="p1">Hello World!</p>
<script>
document.getElementsByTagName("p")[0].innerHTML="新文本!";
</script>
<p>以上段落通过脚本修改文本。</p>
```

#### 7、标签操作

##### （1）添加节点

在之前添加

```js
var para = document.createElement("p");
var node = document.createTextNode("这是一个新的段落。");
para.appendChild(node);
 
var element = document.getElementById("div1");
var child = document.getElementById("p1");
element.insertBefore(para, child);
```

在之后添加（默认）

```js
var para = document.createElement("p");
var node = document.createTextNode("这是一个新的段落。");
para.appendChild(node);
 
var element = document.getElementById("div1");
element.appendChild(para);
```

##### （2）删除节点

必须通过父节点进行删除当前节点，两种方式

###### ① 直接找到父节点

```js
var parent = document.getElementById("div1");
var child = document.getElementById("p1");
parent.removeChild(child);
```

###### ② 通过子节点的父级来删除

```js
var child = document.getElementById("p1");
child.parentNode.removeChild(child);
```

##### （3）替换

```js
var para = document.createElement("p");
var node = document.createTextNode("这是一个新的段落。");
para.appendChild(node);
 
var parent = document.getElementById("div1");
var child = document.getElementById("p1");
parent.replaceChild(para, child);
//para 替换child
```

#### 8、数字

无限

```js
myNumber=2;
while (myNumber!=Infinity){
	myNumber=myNumber*myNumber;
	document.write(myNumber +'<BR>');
}


var x = 2/0;
var y = -2/0;
document.write(x + "<br>");
document.write(y + "<br>");
```

NaN

其中无穷大是数字

```html
<p>一个数字除以一个字符串结果不是一个数字</p>
<p>一个数字除以一个字符串数字结果是一个数字</p>
<p id="demo"></p>
<script>
var x = 1000 / "Apple";
var y = 1000 / "1000";
document.getElementById("demo").innerHTML = isNaN(x) + "<br>" + isNaN(y);
</script>
```

数字可以是数字，也可以是数字对象

#### 9、字符串

string.length   字符串长度

替换：后面的替换前面的

```html
<p>替换 "Microsoft" 为 "Runoob" :</p>
<button onclick="myFunction()">点我</button>
<p id="demo">请访问 Microsoft!</p>
<script>
function myFunction() {
    var str = document.getElementById("demo").innerHTML; 
    var txt = str.replace("Microsoft","Runoob");
    document.getElementById("demo").innerHTML = txt;
}
</script>
```

内容匹配：

​	match()函数用来查找字符串中特定的字符，并且如果找到的话，则返回这个字符。 

​	str.split(",") 按，分割

#### 10、日期对象

```js 
//获取当前日期
var d=new Date();
d.getFullYear();//获取年份
d.getTime();//返回的是1970/01/01至今的毫秒数
d.setFullYear(2020,10,3);//设置具体的日期时间
d.getDay()//显示今天周几，返回的是一个数字
d.getDate();//显示今天是一个月中的哪一天，返回的是一个数字

```

在网页上显示一个钟表

```html
<script>
function startTime(){
	var today=new Date();
	var h=today.getHours();
	var m=today.getMinutes();
	var s=today.getSeconds();// 在小于10的数字前加一个‘0’
	m=checkTime(m);
	s=checkTime(s);
	document.getElementById('txt').innerHTML=h+":"+m+":"+s;
	t=setTimeout(function(){startTime()},500);
}
function checkTime(i){
	if (i<10){
		i="0" + i;
	}
	return i;
}
</script>
</head>
<body onload="startTime()">
	
<div id="txt"></div>
```

创建时间实例

```js
new Date() // 当前日期和时间
new Date(milliseconds) //返回从 1970 年 1 月 1 日至今的毫秒数
new Date(dateString)
new Date(year, month, day, hours, minutes, seconds, milliseconds)


var today = new Date()
var d1 = new Date("October 13, 1975 11:13:00")
var d2 = new Date(79,5,24)
var d3 = new Date(79,5,24,11,33,0)

// 设置一个特定的日期 (2010 年 1 月 14 日)：
var myDate=new Date();
myDate.setFullYear(2010,0,14);

// 设置5天后的日期
var myDate=new Date();
myDate.setDate(myDate.getDate()+5);

// 两个日期进行比较
var x=new Date();
x.setFullYear(2100,0,14);
var today = new Date();

if (x>today)
{
    alert("今天是2100年1月14日之前");
}
else
{
    alert("今天是2100年1月14日之后");
}
```

#### 11、数组对象

数组对象是使用单独的变量名来存储一系列的值。 

数组的操作

```js
// 合并
var hege = ["Cecilie", "Lone"];
var stale = ["Emil", "Tobias", "Linus"];
var children = hege.concat(stale);

// 连接字符串
function myFunction(){
	var fruits = ["Banana", "Orange", "Apple", "Mango"];
	var x=document.getElementById("demo");
	x.innerHTML=fruits.join();
}

// 删除最后一个
var fruits = ["Banana", "Orange", "Apple", "Mango"];
function myFunction(){
	fruits.pop();
	var x=document.getElementById("demo");
	x.innerHTML=fruits;
}

// 追加
var fruits = ["Banana", "Orange", "Apple", "Mango"];
function myFunction(){
	fruits.push("Kiwi")
	var x=document.getElementById("demo");
	x.innerHTML=fruits;
}

//反转
fruits.reverse();

//删除第一个
fruits.shift();

// 截取1到3，左闭右开
fruits.slice(1,3);

// 数组排序，默认升序
fruits.sort();

//=====================================================================================
//数字排序
function myFunction(){
	var points = [40,100,1,5,25,10];
	points.sort(function(a,b){return a-b});
	var x=document.getElementById("demo");
	x.innerHTML=points;
}

//数字降序
function myFunction(){
	var points = [40,100,1,5,25,10];
	points.sort(function(a,b){return b-a});
	var x=document.getElementById("demo");
	x.innerHTML=points;
}

// 在第二个位置添加
function myFunction(){
	var fruits = ["Banana", "Orange", "Apple", "Mango"];
	fruits.splice(2,0,"Lemon","Kiwi");
	var x=document.getElementById("demo");
	x.innerHTML=fruits;
}
//=====================================================================================
// 转换成字符串
fruits.toString();

// 开头添加
fruits.unshift("Lemon","Pineapple");
```

#### 12、布尔对象

```
如果布尔对象无初始值或者其值为:
0
-0
null
""
false
undefined
NaN
那么对象的值为 false。否则，其值为 true（即使当变量值为字符串 "false" 时）！
```

#### 13、windows窗口检测

可以打开，关闭一个窗口，并且获取这个窗口的状态

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>菜鸟教程(runoob.com)</title>
<script>
var myWindow;
function openWin(){
	myWindow=window.open("","","width=400,height=200");
}
function closeWin(){
	if (myWindow){
		myWindow.close();
	}
}
function checkWin(){
	if (!myWindow){
		document.getElementById("msg").innerHTML="我的窗口没有被打开!";
	}
	else{
		if (myWindow.closed){
			document.getElementById("msg").innerHTML="我的窗口被关闭!";
		}
		else{
			document.getElementById("msg").innerHTML="我的窗口没有被关闭!";
		}
	}	
}
</script>
</head>
<body>

<input type="button" value="打开我的窗口" onclick="openWin()" />
<input type="button" value="关闭我的窗口" onclick="closeWin()" />
<br><br>
<input type="button" value="我的窗口被关闭了吗?" onclick="checkWin()" />
<br><br>
<div id="msg"></div>
	
</body>
</html>
```

#### 14、定义变量（var,const,let）

1.let，var能定义局部变量，const能定义局部常量无法重新赋值；

2.var没有块级作用域，let、const定义的量有块级作用域，

3.var定义的变量只能够被var重新定义，let、const定义的量在同个作用域中不能被重定义，在不

同作用域中可以被重定义