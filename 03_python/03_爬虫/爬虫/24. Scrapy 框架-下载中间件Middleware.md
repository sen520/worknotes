### 1. Spider 下载中间件(Middleware)
Spider 中间件(Middleware) 下载器中间件是介入到 Scrapy 的 spider 处理机制的钩子框架，您可以添加代码来处理发送给 Spiders 的 response 及 spider 产生的 item 和 request

### 2. 激活一个下载DOWNLOADER_MIDDLEWARES
要激活一个下载器中间件组件，将其添加到 `DOWNLOADER_MIDDLEWARES`设置中，该设置是一个字典，其键是中间件类路径，它们的值是中间件命令
```
DOWNLOADER_MIDDLEWARES  =  { 
    'myproject.middlewares.CustomDownloaderMiddleware' ： 543 ，
}
```
该`DOWNLOADER_MIDDLEWARES`设置与`DOWNLOADER_MIDDLEWARES_BASEScrapy`中定义的设置（并不意味着被覆盖）合并， 然后按顺序排序，以获得最终的已启用中间件的排序列表：第一个中间件是靠近引擎的第一个中间件，最后一个是靠近引擎的中间件到下载器。换句话说，`process_request()` 每个中间件的方法将以增加中间件的顺序（100,200,300，...）`process_response()`被调用，并且每个中间件的方法将以降序调用

要决定分配给中间件的顺序，请参阅 `DOWNLOADER_MIDDLEWARES_BASE`设置并根据要插入中间件的位置选择一个值。顺序很重要，因为每个中间件都执行不同的操作，而您的中间件可能依赖于之前（或后续）正在使用的中间件

如果要禁用内置中间件（`DOWNLOADER_MIDDLEWARES_BASE`默认情况下已定义和启用的中间件 ），则必须在项目`DOWNLOADER_MIDDLEWARES`设置中定义它，并将“ 无” 作为其值。例如，如果您要禁用用户代理中间件

```
DOWNLOADER_MIDDLEWARES  =  { 
    'myproject.middlewares.CustomDownloaderMiddleware' ： 543 ，
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware' ： None ，
}
```
最后，请记住，某些中间件可能需要通过特定设置启用

### 3. 编写你自己的下载中间件
每个中间件组件都是一个Python类，它定义了一个或多个以下方法
```
class scrapy.downloadermiddlewares.DownloaderMiddleware
```
> 任何下载器中间件方法也可能返回一个延迟

#### 3.1 process_request(self, request, spider)
> 当每个request通过下载中间件时，该方法被调用

process_request()必须返回其中之一
- 返回 None
    - Scrapy 将继续处理该 request，执行其他的中间件的相应方法，直到合适的下载器处理函数(download handler)被调用，该 request 被执行(其 response 被下载)
- 返回一个 Response 对象
    - Scrapy 将不会调用 任何 其他的 process_request()或 process_exception()方法，或相应地下载函数； 其将返回该 response。已安装的中间件的 process_response()方法则会在每个 response 返回时被调用
- 返回一个 Request 对象
    - Scrapy 则停止调用 process_request 方法并重新调度返回的 request。当新返回的 request 被执行后， 相应地中间件链将会根据下载的 response 被调用
- raise IgnoreRequest
    - 如果抛出 一个 IgnoreRequest 异常，则安装的下载中间件的 process_exception() 方法会被调用。如果没有任何一个方法处理该异常， 则 request 的 errback(Request.errback)方法会被调用。如果没有代码处理抛出的异常， 则该异常被忽略且不记录(不同于其他异常那样)
    
参数:
- request (Request 对象) – 处理的request
- spider (Spider 对象) – 该request对应的spider
#### 3.2 process_response(self, request, response, spider)

> 当下载器完成http请求，传递响应给引擎的时候调用


- process_request() 必须返回以下其中之一: 返回一个 Response 对象、 返回一个 Request 对象或raise一个 IgnoreRequest 异常

    - 如果其返回一个 Response (可以与传入的response相同，也可以是全新的对象)， 该response会被在链中的其他中间件的 process_response() 方法处理。

    - 如果其返回一个 Request 对象，则中间件链停止， 返回的request会被重新调度下载。处理类似于 process_request() 返回request所做的那样。

    - 如果其抛出一个 IgnoreRequest 异常，则调用request的errback(Request.errback)。 如果没有代码处理抛出的异常，则该异常被忽略且不记录(不同于其他异常那样)。

- 参数:
    - request (Request 对象) – response所对应的request
    - response (Response 对象) – 被处理的response
    - spider (Spider 对象) – response所对应的spider


### 4 使用代理
settings.py
```
PROXIES=[
    {"ip":"122.236.158.78:8118"},
    {"ip":"112.245.78.90:8118"}
]
DOWNLOADER_MIDDLEWARES = {
    #'xiaoshuo.middlewares.XiaoshuoDownloaderMiddleware': 543,
    'xiaoshuo.proxyMidde.ProxyMidde':100
}
```
创建一个midderwares
```
from xiaoshuo.settings import PROXIES
import random
class ProxyMidde(object):
    def process_request(self, request, spider):
            proxy = random.choice(PROXIES)
            request.meta['proxy']='http://'+proxy['ip']
```
写一个spider测试
```
from scrapy import Spider


class ProxyIp(Spider):
    name = 'ip'
    #http://www.882667.com/
    start_urls = ['http://ip.cn']

    def parse(self, response):
        print(response.text)

```

### 5 使用动态UA

```
# 随机的User-Agent
class RandomUserAgent(object):
    def process_request(self, request, spider):
        useragent = random.choice(USER_AGENTS)

        request.headers.setdefault("User-Agent", useragent)
```