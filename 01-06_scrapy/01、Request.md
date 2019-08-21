Request(url, [, callback, method='GET', headers, body, cookies, meta, encoding='utf-8', priority, dont_filter, errback])

通常我们只需要传url，callback，body，headers，常用的还有meta

- url(必须)

- callback

  页面解析函数，callable类型，Request对象请求页面下载完成后，由该参数指定的页面解析函数被调用。如果未传递该参数，默认调用Spider的parse方法。

- method

  HTTP请求的方法，默认为'GET'

- headers

  如果其中的某项的值为None，表示不发送该项HTTP头部，{‘Cookie’: None} 禁止发送Cookie

- body

  HTTP请求的正文，bytes或str类型

- cookies

  Cookie信息字典，dict类型

- meta

  Request的元数据字典，dict类型，用于给框架中其他组件传递信息，比如中间件Item，Pipeline。其他组件可以使用Request对象的meta属性访问改元数据字典(request.meta)，也用于给响应处理函数传递信息

- encoding

  url和body参数的编码认为‘utf-8’。如果传入的url或body参数是str类型，就使用该参数进行编码。

- priority

  请求的优先级默认值为0，优先级高的请求优先下载

- dont_filter

  默认情况下为False, 对同一个url地址多次提交下载请求，后面的请求会被去重过滤器过滤（避免重复）。如果设置为True，可以使请求避免被过滤，强制下载。【多次爬取一个内容随时间变化的页面时（每次使用相同的url）,可以设置为True】

- errback

  请求出现异常或者出现HTTP错误时（例如404）的回调函数

