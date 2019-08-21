Response是一个基类，有以下子类：

- TextResponse
- HtmlResponse
- XmlResponse

下载器依据HTTP响应头部中的`Content-Type`信息创建某个Response子类对象。

其中 HtmlResponse和XmlRsponse是TextResponse的子类。

以`HtmlResponse`为例

- url

  HTTP响应的url地址，str类型

- status

  HTTP响应的状态码，int类型	200,404

- headers

  HTTP响应头，类字典类型，可以调用get或getlist方法对其进行访问

  ```python
  response.headers.get('Content-Type')
  response.headers.getList('Set-Cookie')
  ```

- body

  HTTP响应正文，bytes类型

- text

  文本形式的HTTP响应正文，str类型，由response.body使用response.encoding解码得到的

  ```python
  response.text = response.body.decode(response.encoding)
  ```

- encoding

  HTTP响应正文的编码，它的值可能是从HTTP响应头或正文解析出来的。

- request

  产生该HTTP响应的Request对象。

- meta

  response.request.meta，在构造Request对象时，可将要传递给响应处理函数的信息通过meta参数传入；响应处理函数处理响应时，通过`response.meta`将信息取出。

- selector

- xpath

- css

- urljoin

  用于构造绝对url，当传入的url参数是一个相对地址时，根据response.url计算出相应的绝对url



