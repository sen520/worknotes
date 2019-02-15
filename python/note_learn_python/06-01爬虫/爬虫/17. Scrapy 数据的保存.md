### 1. 数据的提取
#### 1.1 控制台打印
```
import scrapy


class DoubanSpider(scrapy.Spider):
    name = 'douban'
    allwed_url = 'douban.com'
    start_urls = [
        'https://movie.douban.com/top250/'
    ]

    def parse(self, response):
        movie_name = response.xpath("//div[@class='item']//a/span[1]/text()").extract()
        movie_core = response.xpath("//div[@class='star']/span[2]/text()").extract()
        yield {
            'movie_name':movie_name,
            'movie_core':movie_core
        }
```
执行以上代码，我可以在控制看到：
```

2018-01-24 15:17:14 [scrapy.utils.log] INFO: Scrapy 1.5.0 started (bot: spiderdemo1)
2018-01-24 15:17:14 [scrapy.utils.log] INFO: Versions: lxml 4.1.1.0, libxml2 2.9.5, cssselect 1.0.3, parsel 1.3.1, w3lib 1.18.0, Twiste
d 17.9.0, Python 3.6.3 (v3.6.3:2c5fed8, Oct  3 2017, 18:11:49) [MSC v.1900 64 bit (AMD64)], pyOpenSSL 17.5.0 (OpenSSL 1.1.0g  2 Nov 201
7), cryptography 2.1.4, Platform Windows-10-10.0.10240-SP0
2018-01-24 15:17:14 [scrapy.crawler] INFO: Overridden settings: {'BOT_NAME': 'spiderdemo1', 'NEWSPIDER_MODULE': 'spiderdemo1.spiders',
'ROBOTSTXT_OBEY': True, 'SPIDER_MODULES': ['spiderdemo1.spiders']}
2018-01-24 15:17:14 [scrapy.middleware] INFO: Enabled extensions:
['scrapy.extensions.corestats.CoreStats',
 'scrapy.extensions.telnet.TelnetConsole',
 'scrapy.extensions.logstats.LogStats']
2018-01-24 15:17:14 [scrapy.middleware] INFO: Enabled downloader middlewares:
['scrapy.downloadermiddlewares.robotstxt.RobotsTxtMiddleware',
 'scrapy.downloadermiddlewares.httpauth.HttpAuthMiddleware',
 'scrapy.downloadermiddlewares.downloadtimeout.DownloadTimeoutMiddleware',
 'scrapy.downloadermiddlewares.defaultheaders.DefaultHeadersMiddleware',
 'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware',
 'scrapy.downloadermiddlewares.retry.RetryMiddleware',
 'scrapy.downloadermiddlewares.redirect.MetaRefreshMiddleware',
 'scrapy.downloadermiddlewares.httpcompression.HttpCompressionMiddleware',
 'scrapy.downloadermiddlewares.redirect.RedirectMiddleware',
 'scrapy.downloadermiddlewares.cookies.CookiesMiddleware',
 'scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware',
 'scrapy.downloadermiddlewares.stats.DownloaderStats']
2018-01-24 15:17:14 [scrapy.middleware] INFO: Enabled spider middlewares:
['scrapy.spidermiddlewares.httperror.HttpErrorMiddleware',
 'scrapy.spidermiddlewares.offsite.OffsiteMiddleware',
 'scrapy.spidermiddlewares.referer.RefererMiddleware',
 'scrapy.spidermiddlewares.urllength.UrlLengthMiddleware',
 'scrapy.spidermiddlewares.depth.DepthMiddleware']
2018-01-24 15:17:14 [scrapy.middleware] INFO: Enabled item pipelines:
[]
2018-01-24 15:17:14 [scrapy.core.engine] INFO: Spider opened
2018-01-24 15:17:14 [scrapy.extensions.logstats] INFO: Crawled 0 pages (at 0 pages/min), scraped 0 items (at 0 items/min)
2018-01-24 15:17:14 [scrapy.extensions.telnet] DEBUG: Telnet console listening on 127.0.0.1:6023
2018-01-24 15:17:14 [scrapy.core.engine] DEBUG: Crawled (200) <GET https://movie.douban.com/robots.txt> (referer: None)
2018-01-24 15:17:15 [scrapy.downloadermiddlewares.redirect] DEBUG: Redirecting (301) to <GET https://movie.douban.com/top250> from <GET
 https://movie.douban.com/top250/>
2018-01-24 15:17:15 [scrapy.core.engine] DEBUG: Crawled (200) <GET https://movie.douban.com/top250> (referer: None)
2018-01-24 15:17:15 [scrapy.core.scraper] DEBUG: Scraped from <200 https://movie.douban.com/top250>
{'movie_name': ['肖申克的救赎', '霸王别姬', '这个杀手不太冷', '阿甘正传', '美丽人生', '千与千寻', '泰坦尼克号', '辛德勒的名单', '盗梦空
间', '机器人总动员', '海上钢琴师', '三傻大闹宝莱坞', '忠犬八公的故事', '放牛班的春天', '大话西游之大圣娶亲', '教父', '龙猫', '楚门的世
界', '乱世佳人', '熔炉', '触不可及', '天堂电影院', '当幸福来敲门', '无间道', '星际穿越'], 'movie_core': ['9.6', '9.5', '9.4', '9.4', '9
.5', '9.2', '9.2', '9.4', '9.3', '9.3', '9.2', '9.1', '9.2', '9.2', '9.2', '9.2', '9.1', '9.1', '9.2', '9.2', '9.1', '9.1', '8.9', '9.0
', '9.1']}
2018-01-24 15:17:15 [scrapy.core.engine] INFO: Closing spider (finished)
2018-01-24 15:17:15 [scrapy.statscollectors] INFO: Dumping Scrapy stats:
{'downloader/request_bytes': 651,
 'downloader/request_count': 3,
 'downloader/request_method_count/GET': 3,
 'downloader/response_bytes': 13900,
 'downloader/response_count': 3,
 'downloader/response_status_count/200': 2,
 'downloader/response_status_count/301': 1,
 'finish_reason': 'finished',
 'finish_time': datetime.datetime(2018, 1, 24, 7, 17, 15, 247183),
 'item_scraped_count': 1,
 'log_count/DEBUG': 5,
 'log_count/INFO': 7,
 'response_received_count': 2,
 'scheduler/dequeued': 2,
 'scheduler/dequeued/memory': 2,
 'scheduler/enqueued': 2,
 'scheduler/enqueued/memory': 2,
 'start_time': datetime.datetime(2018, 1, 24, 7, 17, 14, 784782)}
2018-01-24 15:17:15 [scrapy.core.engine] INFO: Spider closed (finished)

```

#### 1.2 以文件的方式输出
##### 1.2.1 python原生方式
```
with open("movie.txt", 'wb') as f:
    for n, c in zip(movie_name, movie_core):
        str = n+":"+c+"\n"
        f.write(str.encode())
```

##### 1.2.2 以scrapy内置方式
scrapy 内置主要有四种：JSON，JSON lines，CSV，XML

我们将结果用最常用的JSON导出，命令如下：
```
scrapy crawl dmoz -o douban.json -t json  
```
-o 后面是导出文件名，-t 后面是导出类型

#### 2 提取内容的封装Item
> Scrapy进程可通过使用蜘蛛提取来自网页中的数据。Scrapy使用Item类生成输出对象用于收刮数据

> Item 对象是自定义的python字典，可以使用标准字典语法获取某个属性的值

##### 2.1 定义

```
import scrapy


class InfoItem(scrapy.Item):
    # define the fields for your item here like:
    movie_name = scrapy.Field()
    movie_core = scrapy.Field()
```

##### 2.2 使用
```
def parse(self, response):
    movie_name = response.xpath("//div[@class='item']//a/span[1]/text()").extract()
    movie_core = response.xpath("//div[@class='star']/span[2]/text()").extract()
    
    for n, c in zip(movie_name, movie_core):
        movie = InfoItem()
        movie['movie_name'] = n
        movie['movie_core'] = c
        yield movie
```

