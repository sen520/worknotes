### 1. Item Pipeline 介绍
当Item 在Spider中被收集之后，就会被传递到Item Pipeline中进行处理

每个item pipeline组件是实现了简单的方法的python类，负责接收到item并通过它执行一些行为，同时也决定此Item是否继续通过pipeline,或者被丢弃而不再进行处理

item pipeline的主要作用：
1. 清理html数据
1. 验证爬取的数据
1. 去重并丢弃
1. 讲爬取的结果保存到数据库中或文件中

### 2. 编写自己的item pipeline
#### 2.1 必须实现的函数
- process_item(self,item,spider)


每个item piple组件是一个独立的pyhton类，必须实现以process_item(self,item,spider)方法

每个item pipeline组件都需要调用该方法，这个方法必须返回一个具有数据的dict,或者item对象，或者抛出DropItem异常，被丢弃的item将不会被之后的pipeline组件所处理

#### 2.2 可以选择实现
- open_spider(self,spider)
表示当spider被开启的时候调用这个方法

- close_spider(self,spider)
当spider关闭时候这个方法被调用

#### 2.3 应用到项目
```
import json

class MoviePipeline(object):
    def process_item(self, item, spider):
        json.dump(dict(item), open('diban.json', 'a', encoding='utf-8'), ensure_ascii=False)
        return item
        
```

#### 注意：
写到pipeline后，要在settings中设置才可生效
```
ITEM_PIPELINES = {
    'spiderdemo1.pipelines.MoviePipeline': 300
}
```

#### 2.4 将项目写入MongoDB

MongoDB地址和数据库名称在Scrapy设置中指定; MongoDB集合以item类命名

```
from pymongo import MongoClient
from middle.settings import HOST
from middle.settings import PORT
from middle.settings import DB_NAME
from middle.settings import SHEET_NAME


class MiddlePipeline(object):
    def __init__(self):
        client = MongoClient(host=HOST, port=PORT)
        my_db = client[DB_NAME]
        self.sheet = my_db[SHEET_NAME]

    def process_item(self, item, spider):
        self.sheet.insert(dict(item))
        return item
```
