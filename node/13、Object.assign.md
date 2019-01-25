Object.assign是ES6新添加的接口，主要的用途是用来合并多个JavaScript的对象。

Object.assign()接口可以接收多个参数，第一个参数是目标对象，后面的都是源对象，assign方法将多个原对象的属性和方法都合并到了目标对象上面，如果在这个过程中出现同名的属性（方法），后合并的属性（方法）会覆盖之前的同名属性（方法）。

assign的基本用法如下：

```javascript
var target  = {a : 1}; //目标对象
var source1 = {b : 2}; //源对象1
var source2 = {c : 3}; //源对象2
var source3 = {c : 4}; //源对象3，和source2中的对象有同名属性c
Object.assign(target,source1,source2,source3);
//结果如下：
//{a:1,b:2,c:4}
```

assign的设计目的是用于合并接口的，所以它接收的第一个参数（目标）应该是对象，如果不是对象的话，它会在内部转换成对象，所以如果碰到了null或者undefined这种不能转换成对象的值的话，assign就会报错。但是如果源对象的参数位置，接收到了无法转换为对象的参数的话，会忽略这个源对象参数。
这里要看一个例子：

```javascript
const v1 = 'abc';
const v2 = true;
const v3 = 10;

const obj = Object.assign({}, v1, v2, v3);
console.log(obj); // { "0": "a", "1": "b", "2": "c" }

```

为什么会出现这个结果呢？首先，第一个参数位置接收到的是对象，所以不会报错，其次，由于字符串转换成对象时，会将字符串中每个字符作为一个属性，所以，abc三个字符作为“0”，“1”，“2”三个属性被合并了进去，但是布尔值和数值在转换对象时虽然也成功了，但是属性都是不可枚举的，所以属性没有被成功合并进去。在这里需要记住“assign不会合并不可枚举的属性”

```javascript
Object(true) // {[[PrimitiveValue]]: true}
Object(10)  //  {[[PrimitiveValue]]: 10}
Object('abc') // {0: "a", 1: "b", 2: "c", length: 3, [[PrimitiveValue]]: "abc"}
```

上面就是对于布尔值、数值和字符串转换成对象后得到的结果。
同样，Object.assign拷贝的属性是有限制的，只会拷贝对象本身的属性（不会拷贝继承属性），也不会拷贝不可枚举的属性。但是属性名为Symbol值的属性，是可以被Object.assign拷贝的。
如果assign只接收到了一个对象作为参数的话，就是说没有源对象要合并到目标对象上，那会原样把目标对象返回。


知识要点：

1、Object.assign进行的拷贝是浅拷贝。也就是说，如果拷贝过来的属性的值是对象等复合属性，那么只能拷贝过来一个引用。

```javascript
const obj1 = {a: {b: 1}};
const obj2 = Object.assign({}, obj1);

obj1.a.b = 2;
obj2.a.b // 2

```

由于是浅拷贝，所以属性a的内部有任何变化，都会在目标对象上呈现出来。
2、Object.assign进行合并的时候，一旦碰到同名属性，就会出现覆盖现象。所以使用时务必小心。
3、Object.assign是针对Object开发的API，一旦在源对象的参数未知接收到了其他类型的参数，会尝试类型转换。如果是数组类型的话，类型转换的结果是将每个数组成员的值作为属性键值，将数组成员在数组中的位置作为属性键名。多个数组组成参数一同传入的话还会造成覆盖。具体例子如下：

```javascript
Object.assign([1, 2, 3], [4, 5])
// [4, 5, 3]
```

上面代码中，assign把数组视为属性名为 0、1、2 的对象，因此源数组的 0 号属性4覆盖了目标数组的 0 号属性1。
Object.assign只能将属性值进行复制，如果属性值是一个get（取值函数）的话，那么会先求值，然后再复制。

```javascript
// 源对象
const source = {
   //属性是取值函数
   get foo(){return 1}
};
//目标对象
const target = {};
Object.assign(target,source);
//{foo ; 1}  此时foo的值是get函数的求值结果
```

Object.assign方法的常见用途        

1、为对象添加属性

```javascript
class Point{
   constructor(x,y){
      Object.assign(this,{x,y});
   }
}
```

上面的方法可以为对象Point类的实例对象添加属性x和属性y。
2、为对象添加方法

```javascript
// 方法也是对象
// 将两个方法添加到类的原型对象上
// 类的实例会有这两个方法
Object.assign(SomeClass.prototype,{
    someMethod(arg1,arg2){...},
    anotherMethod(){...}
});
```

将方法添加到类的原型对象上后，类的实例能继承这两个方法。
3、克隆对象

```javascript
//克隆对象的方法
function clone(origin){
    //获取origin的原型对象
    let originProto = Obejct.getPrototypeOf(origin);
    //根据原型对象，创建新的空对象，再assign
    return Object.assign(Object.create(originProto),origin);
}
```

4、为属性指定默认值

```javascript
// 默认值对象
const DEFAULTS = {
   logLevel : 0,
   outputFormat : 'html'
};

// 利用assign同名属性会覆盖的特性，指定默认值，如果options里有新值的话，会覆盖掉默认值
function processContent(options){
   options = Object.assign({},DEFAULTS,options);
   console.log(options);
   //...
}

```

处于assign浅拷贝的顾虑，DEFAULTS对象和options对象此时的值最好都是简单类型的值，否则函数会失效。

```javascript
const DEFAULTS = {
  url: {
    host: 'example.com',
    port: 7070
  },
};

processContent({ url: {port: 8000} })
// {
//   url: {port: 8000}
// }

```

上面的代码，由于url是对象类型，所以默认值的url被覆盖掉了，但是内部缺少了host属性，形成了一个bug。

