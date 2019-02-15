### 1. 介绍
Scrapy提供了一个 item pipeline ，来下载属于某个特定项目的图片，比如，当你抓取产品时，也想把它们的图片下载到本地。

这条管道，被称作图片管道，在 `ImagesPipeline` 类中实现，提供了一个方便并具有额外特性的方法，来下载并本地存储图片:

- 将所有下载的图片转换成通用的格式（JPG）和模式（RGB）
- 避免重新下载最近已经下载过的图片
- 缩略图生成
- 检测图像的宽/高，确保它们满足最小限制


这个管道也会为那些当前安排好要下载的图片保留一个内部队列，并将那些到达的包含相同图片的项目连接到那个队列中。 这可以避免多次下载几个项目共享的同一个图片

### 2. 使用图片管道

当使用 ImagesPipeline ，典型的工作流程如下所示:

1. 在一个爬虫里，你抓取一个项目，把其中图片的URL放入 image_urls 组内
2. 项目从爬虫内返回，进入项目管道
3. 当项目进入 ImagesPipeline，image_urls 组内的URLs将被Scrapy的调度器和下载器（这意味着调度器和下载器的中间件可以复用）安排下载，当优先级更高，会在其他页面被抓取前处理。项目会在这个特定的管道阶段保持“locker”的状态，直到完成图片的下载（或者由于某些原因未完成下载）。
4. 当图片下载完，另一个组(images)将被更新到结构中。这个组将包含一个字典列表，其中包括下载图片的信息，比如下载路径、源抓取地址（从 image_urls 组获得）和图片的校验码。 images 列表中的图片顺序将和源 image_urls 组保持一致。如果某个图片下载失败，将会记录下错误信息，图片也不会出现在 images 组中



### 3. 具体流程(此处以zol网站为例)
1. 定义item
```
import scrapy


class ImagedownloadItem(scrapy.Item):
    # define the fields for your item here like:
    img_name = scrapy.Field()
    img_urls =scrapy.Field()
```

2. 编写spider
> 思路：获取文件地址-->获取图片名称-->推送地址

此处是一张一张的推送
```
class ZolSpiderSpider(scrapy.Spider):
    name = 'zol'
    allowed_domains = ['zol.com.cn']
    url ='http://desk.zol.com.cn'
    start_urls = [url+'/bizhi/7106_88025_2.html']

    def parse(self, response):
        image_url = response.xpath('//img[@id="bigImg"]/@src').extract_first()
        image_name = response.xpath('//h3')[0].xpath('string(.)').extract_first().strip().replace('\r\n\t\t', '')
        next_image = response.xpath('//a[@id="pageNext"]/@href').extract_first()
        item = ImagedownloadItem()
        item["img_name"] = image_name
        item["img_urls"] = image_url
        yield item

        yield scrapy.Request(self.url+next_image,callback=self.parse,)
```
3. 编写pipline

 以下如果不想改文件名，meta属性可以忽略不写
 
```
    def get_media_requests(self, item, info):
        '''
        #如果item[urls]里里面是列表，用下面
        urls= item['urls']
        for url in urls:
            yield scrapy.Request(url,meta={"item",item})
        '''
        # 如果item[urls]里里面是一个图片地址，用这下面的
        yield scrapy.Request(item['img_urls'], meta={"item": item})
```

因为scrapy里是使用它们URL的 SHA1 hash 作为文件名，所以如果想重命名：
```
  def file_path(self, request, response=None, info=None):
        item = request.meta["item"]
        #去掉文件里的/,避免创建图片文件时出错
        filename = item["img_name"].replace("/","-")+".jpg"

        return filename
```
4. 定义图片保存在哪？
在settings中增加一句
```
IMAGES_STORE = "e:/pics"
```