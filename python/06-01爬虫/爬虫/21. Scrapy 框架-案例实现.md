### 爬取小说
spider
```
import scrapy
from xiaoshuo.items import XiaoshuoItem


class XiaoshuoSpiderSpider(scrapy.Spider):
    name = 'xiaoshuo_spider'
    allowed_domains = ['zy200.com']
    url = 'http://www.zy200.com/5/5943/'
    start_urls = [url + '11667352.html']

    def parse(self, response):
        info = response.xpath("/html/body/div[@id='content']/text()").extract()
        href = response.xpath("//div[@class='zfootbar']/a[3]/@href").extract_first()
        xs_item = XiaoshuoItem()
        xs_item['content'] = info
        yield xs_item

        if href != 'index.html':
            new_url = self.url + href
            yield scrapy.Request(new_url, callback=self.parse)
```

items
```
import scrapy


class XiaoshuoItem(scrapy.Item):
    # define the fields for your item here like:
    content = scrapy.Field()
    href = scrapy.Field()

```

pipeline
```
class XiaoshuoPipeline(object):
    def __init__(self):
        self.filename = open("dp1.txt", "w", encoding="utf-8")

    def process_item(self, item, spider):
        content = item["title"] + item["content"] + '\n'
        self.filename.write(content)
        self.filename.flush()
        return item

    def close_spider(self, spider):
        self.filename.close()
```