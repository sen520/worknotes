### 1. 介绍
>之前 BeautifulSoup 的用法，这个已经是非常强大的库了，不过还有一些比较流行的解析库，例如 lxml，使用的是 Xpath 语法，同样是效率比较高的解析方法。如果大家对 BeautifulSoup 使用不太习惯的话，可以尝试下 Xpath

[官网](http://lxml.de/index.html) http://lxml.de/index.html

[w3c](http://www.w3school.com.cn/xpath/index.asp) http://www.w3school.com.cn/xpath/index.asp

### 2. 安装
```
pip install lxml
```

### 3. XPath语法
> XPath 是一门在 XML 文档中查找信息的语言。XPath 可用来在 XML 文档中对元素和属性进行遍历。XPath 是 W3C XSLT 标准的主要元素，并且 XQuery 和 XPointer 都构建于 XPath 表达之上
#### 3.1 节点的关系
- 父（Parent）
- 子（Children）
- 同胞（Sibling）
- 先辈（Ancestor）
- 后代（Descendant）

#### 3.2 选取节点

##### 3.2.1 常用的路径表达式

表达式 | 描述
--|--
nodename | 选取此节点的所有子节点
/ 	| 从根节点选取
// 	| 从匹配选择的当前节点选择文档中的节点，而不考虑它们的位置
. 	| 选取当前节点
.. 	| 选取当前节点的父节点
@ 	| 选取属性

##### 3.2.2 通配符

XPath 通配符可用来选取未知的 XML 元素。
通配符 | 描述 | 举例 | 结果
--|-- |-- | -- 
* 	| 匹配任何元素节点|xpath('div/*') | 获取div下的所有子节点
@* 	| 匹配任何属性节点|xpath('div[@*]') |选取所有带属性的div节点
node() | 匹配任何类型的节点


##### 3.2.3 选取若干路径

通过在路径表达式中使用“|”运算符，您可以选取若干个路径
表达式 | 结果
--|--
xpath('//div`|`//table')|获取所有的div与table节点

##### 3.2.4 谓语

谓语被嵌在方括号内，用来查找某个特定的节点或包含某个制定的值的节点

表达式 | 结果
--|--
xpath('/body/div[1]')|选取body下的第一个div节点
xpath('/body/div[last()]')|选取body下最后一个div节点
xpath('/body/div[last()-1]')|选取body下倒数第二个节点
xpath('/body/div[positon()<3]')|选取body下前丙个div节点
xpath('/body/div[@class]')|选取body下带有class属性的div节点
xpath('/body/div[@class="main"]')|选取body下class属性为main的div节点
xpath('/body/div[price>35.00]')|选取body下price元素大于35的div节点

##### 3.2.5 XPath 运算符
运算符 |	描述 |	实例  |	返回值
--|--|--|--|
| 	| 计算两个节点集 |	//book | //cd |	返回所有拥有 book 和 cd 元素的节点集
+ 	| 加法 | 6 + 4 |	10
– 	| 减法 | 6 – 4 |	2
* 	| 乘法 | 6 * 4 |	24
div | 	除法 |	8 div 4 |	2
= 	| 等于 |	price=9.80 |	如果 price 是 9.80，则返回 true。如果 price 是 9.90，则返回 false。
!= 	| 不等于 |	price!=9.80 |	如果 price 是 9.90，则返回 true。如果 price 是 9.80，则返回 false。
< 	| 小于 |	price<9.80 |	如果 price 是 9.00，则返回 true。如果 price 是 9.90，则返回 false。
<= 	| 小于或等于 |	price<=9.80 |	如果 price 是 9.00，则返回 true。如果 price 是 9.90，则返回 false。
> 	| 大于 |	price>9.80 |	如果 price 是 9.90，则返回 true。如果 price 是 9.80，则返回 false。
>= 	| 大于或等于 |	price>=9.80 |	如果 price 是 9.90，则返回 true。如果 price 是 9.70，则返回 false。
or 	| 或 |	price=9.80 or price=9.70 |	如果 price 是 9.80，则返回 true。如果 price 是 9.50，则返回 false。
and | 	与 |	price>9.00 and price<9.90 |	如果 price 是 9.80，则返回 true。如果 price 是 8.50，则返回 false。
mod | 	计算除法的余数 |	5 mod 2 |	1

#### 3.3 使用

##### 3.3.1 小例子
```
from lxml import etree
text = '''
<div>
    <ul>
         <li class="item-0"><a href="link1.html">first item</a></li>
         <li class="item-1"><a href="link2.html">second item</a></li>
         <li class="item-inactive"><a href="link3.html">third item</a></li>
         <li class="item-1"><a href="link4.html">fourth item</a></li>
         <li class="item-0"><a href="link5.html">fifth item</a>
     </ul>
 </div>
'''
html = etree.HTML(text)
result = etree.tostring(html)
print(result)
```

首先我们使用 lxml 的 etree 库，然后利用 etree.HTML 初始化，然后我们将其打印出来。

其中，这里体现了 lxml 的一个非常实用的功能就是自动修正 html 代码，大家应该注意到了，最后一个 li 标签，其实我把尾标签删掉了，是不闭合的。不过，lxml 因为继承了 libxml2 的特性，具有自动修正 HTML 代码的功能。

所以输出结果是这样的
```
<html><body>
<div>
    <ul>
         <li class="item-0"><a href="link1.html">first item</a></li>
         <li class="item-1"><a href="link2.html">second item</a></li>
         <li class="item-inactive"><a href="link3.html">third item</a></li>
         <li class="item-1"><a href="link4.html">fourth item</a></li>
         <li class="item-0"><a href="link5.html">fifth item</a></li>
</ul>
 </div>

</body></html>
```

不仅补全了 li 标签，还添加了 body，html 标签。
文件读取

除了直接读取字符串，还支持从文件读取内容。比如我们新建一个文件叫做 hello.html，内容为

```
<div>
    <ul>
         <li class="item-0"><a href="link1.html">first item</a></li>
         <li class="item-1"><a href="link2.html">second item</a></li>
         <li class="item-inactive"><a href="link3.html"><span class="bold">third item</span></a></li>
         <li class="item-1"><a href="link4.html">fourth item</a></li>
         <li class="item-0"><a href="link5.html">fifth item</a></li>
     </ul>
 </div>
```

利用 parse 方法来读取文件
```
from lxml import etree
html = etree.parse('hello.html')
result = etree.tostring(html, pretty_print=True)
print(result)
```

同样可以得到相同的结果

##### 3.3.2 XPath具体使用

依然以上一段程序为例

1. 获取所有的 `<li>` 标签

```
from lxml import etree
html = etree.parse('hello.html')
print (type(html))
result = html.xpath('//li')
print (result)
print (len(result))
print (type(result))
print (type(result[0]))
```
运行结果
```
<type 'lxml.etree._ElementTree'>
[<Element li at 0x1014e0e18>, <Element li at 0x1014e0ef0>, <Element li at 0x1014e0f38>, <Element li at 0x1014e0f80>, <Element li at 0x1014e0fc8>]

<type 'list'>
<type 'lxml.etree._Element'>
```

可见，etree.parse 的类型是 ElementTree，通过调用 xpath 以后，得到了一个列表，包含了 5 个 `<li>` 元素，每个元素都是 Element 类型

2. 获取` <li> `标签的所有 class
```
result = html.xpath('//li/@class')
print (result)
```

运行结果
```
['item-0', 'item-1', 'item-inactive', 'item-1', 'item-0']
```


3. 获取 `<li>` 标签下 href 为 link1.html 的 `<a>` 标签
```
result = html.xpath('//li/a[@href="link1.html"]')
print (result)
```
运行结果
```
[<Element a at 0x10ffaae18>]
```
4. 获取` <li> `标签下的所有 `<span>` 标签

**注意**: 这么写是不对的
```
result = html.xpath('//li/span')

#因为 / 是用来获取子元素的，而 <span> 并不是 <li> 的子元素，所以，要用双斜杠
result = html.xpath('//li//span')
print(result)
```
运行结果
```
[<Element span at 0x10d698e18>]
```

5. 获取 `<li>` 标签下的所有 class，不包括`<li>`

```
result = html.xpath('//li/a//@class')
print (resul)t
#运行结果
['blod']
```

6. 获取最后一个 `<li>` 的 `<a>` 的 href
```
result = html.xpath('//li[last()]/a/@href')
print (result)
```
运行结果
```
['link5.html']
```


7. 获取倒数第二个元素的内容
```
result = html.xpath('//li[last()-1]/a')
print (result[0].text)
```
运行结果
```
fourth item
```
	
8. 获取 class 为 bold 的标签名
```
result = html.xpath('//*[@class="bold"]')
print (result[0].tag)
```

运行结果
```
span
```

#### 选择XML文件中节点：

- element（元素节点）
- attribute（属性节点）
- text （文本节点）
- concat(元素节点,元素节点)
- comment （注释节点）
- root （根节点）