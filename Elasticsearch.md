[elasticsearch权威指南](https://es.xiaoleilu.com/index.html)

##mongo-connector

使用`mongo-connector`进行连接

```dockerfile
FROM ubuntu:18.04
LABEL maintainer dokcer_user<sen20181020@358974225@qq.com>
ENV LANG C.UTF-8

RUN apt update
RUN apt install python3 -y \
    && apt install python3-pip -y \
         && pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple 'mongo-connector[elastic5]' && pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple 'elastic2-doc-manager'
```

`docker run -it container bash`

执行命令`mongo-connector --auto-commit-interval=0 -m 192.168.1.2:27018 -t 192.168.1.44:9200 -d elastic2_doc_manager -n data.entity --continue-on-error`

mongo-connector

1. `-m   mongodb_host:port`    —— 数据源地址，mongodb数据库地址。

2. `-t   target_host:port`     —— 数据目的地地址，elasticsearch/solr/mongodb集群地址。建议为集群中的协调节点的地址。

3. `-d   xxx_doc_manager`      —— 数据目的地的document类型。例如：

   ​                              将mongodb中的数据同步到elasticsearch，使用elastic_doc_manager或elastic2_doc_manager。 

   ​                               将mongodb中的数据同步到solr，使用solr_doc_manager。

   ​                               将mongodb中数据同步到其他mongodb，使用mongo_doc_manager。

4. `-n   db.collection ...`    —— 待同步的数据库及其collection。默认同步所有数据库。

5. `-i   filed_name ...`       —— 待同步的字段。默认同步所有字段。

6. `-o   mongodb_oplog_position.oplog`  —— mongo-connector的oplog。默认在mongo-connector命令执行目录下创建oplog.timestamp文件。

   ​                               建议重新分配存储位置（也可重新分配存储文件名），例如 /opt/mongo-connector.oplog。

7. `--auto-commit-interval`    —— 数据同步间隔。默认在不同系统上有不同的值。设置为0表示mongodb中的任何操作立即同步到数据目的地。

8. `--continue-on-error`       —— 一条数据同步失败，日志记录该失败操作，继续后续同步操作。默认为中止后续同步操作。

9. 其他参数包括设置日志输出行为（时间、间隔、路径等）、设置mongodb登录账户和密码、设置（数据目的地）Http连接的证书等、设置mongo-connector的配置文件

**注意**

```
1. mongodb必须开启副本集（Replica Set）。开启副本集才会产生oplog，副本拷贝主分片的oplog并通过oplog与主分片进行同步。   mongo-connector也是通过oplog进行数据同步，故必须开启副本集。 
2. 使用mongo-connector命令同步数据时，-m参数中的mongodb地址应该是主/从分片的地址，   从该地址登录可以看见并操作local数据库（oplog存储在local.oplog.rs）；不能使用mongoos地址。 
3. 使用mongo-connector命令同步数据时 ，mongo-connector的oplog（参照-o参数）不能随便删除，   否则会引起重新同步所有数据的问题。该问题可以通过--no-dump选项关闭。 
4. 生产环境下建议将mongo-connector配置为系统服务，运行mongo-connector时采用配置文件的方式。
```

##elasticsearch

elasticsearch定义了两种查询方式：

#### 一、索引（index）、type、document 相关语句

###### 1、列出所有索引的状态　　

`GET /_cat/indices?v`　　

```
health status index    uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   my_index SOgui_yKSXacTlMHQQht9w   5   1          5            0     14.3kb         14.3kb
yellow open   bank     tzxmtSQhQsqWFfzVjmaK_A   5   1       1008            1    504.9kb        504.9kb
yellow open   schools  SG4nAwtJTcOXCcnf7-mq8w   5   1          0            0      1.2kb          1.2kb
yellow open   teacher  od83pADqTGSk4_TzfGP1ww   5   1          3            0     10.8kb         10.8kb
yellow open   student  oTQ3KElZRzKb3UphMQV41w   5   1          0            0      1.2kb          1.2kb
yellow open   my_store 1e57BmarQ-OQWr5EZFXu5A   5   1          4            0     11.9kb         11.9kb　
```

###### 2、查询索引详细信息　　

```
GET /index1,index2     查询索引index1和索引index2的基本信息
GET /_all    查询所有的基本信息
GET /s*    使用通配符来查询所有以s开头的索引信息
```

###### 3、创建索引　（新版本一个index只能有一个type）

setting中可以设置索引的主分片数number_of_shards默认为5，和主分片的副本数number_of_replicas默认是1；

mapping中主要设置各个type的映射关系。

```
PUT /my_index
{
    "settings": { ... any settings ... },
    "mappings": {
        "type_one": { ... any mappings ... },
        "type_two": { ... any mappings ... },
        ...
    }
}
```

```
PUT /index1
{
  "mappings": {
    "tweet" : {
      "properties" : {
        "tweet" : {
          "type" :    "text",
          "analyzer": "english"
        },
        "date" : {
          "type" :   "date"
        },
        "name" : {
          "type" :   "text"
        },
        "user_id" : {
          "type" :   "long"
        }
      }
    }
  }
}　　　
```

###### 4、删除索引

```
DELETE /{index}　　
DELETE /_all
DELETE /*
```

###### 5、在索引的映射中增加一个字段的映射

```
PUT /gb/_mapping/tweet
{
  "properties" : {
    "tag" : {
      "type" :    "text",
      "index":    "false"
    }
  }
}
```

###### 6、查看某个type的映射关系

GET /{index}/_mapping/{type}

```
GET /gb/_mapping/tweet

///返回
{
   "gb": {
      "mappings": {
         "tweet": {
            "properties": {
               "date": {
                  "type": "date"
               },
               "name": {
                  "type": "text"
               },
               "tag": {
                  "type": "text",
                  "index": false
               },
               "tweet": {
                  "type": "text",
                  "analyzer": "english"
               },
               "user_id": {
                  "type": "long"
               }
            }
         }
      }
   }
}
```

###### 7、在索引文档中添加或者替换文档，在添加的时候id并不是必须的，如果没有设置id，则会随机产生一个id

```
PUT /{index}/{type}/{id}
{
    "filed":"value"
}
```

###### 8、更新索引中文档的内容

```
POST /{index}/{type}/{id}/_update
{
    "doc":{
        "name":"kyle",
        "age":20
    }
}
```

###### 9、删除文档

`DELETE /{index}/{type}/{id}`

###### 10、批处理

```
POST /teacher/chinese/_bulk
{"index":{"_id":"3"}}
{"name": "John Doe" }
{"index":{"_id":"4"}}
{"name": "Jane Doe" }


POST /teacher/chinese/_bulk
{"update":{"_id":"1"}}
{"doc": { "name": "jimmy" } }
{"delete":{"_id":"2"}}

POST /_bulk
{ "delete": { "_index": "website", "_type": "blog", "_id": "123" }} 
{ "create": { "_index": "website", "_type": "blog", "_id": "123" }}
{ "title":    "My first blog post" }
{ "index":  { "_index": "website", "_type": "blog" }}
{ "title":    "My second blog post" }
{ "update": { "_index": "website", "_type": "blog", "_id": "123", "_retry_on_conflict" : 3} }
{ "doc" : {"title" : "My updated blog post"} }
```

###### 11、批量导入大量数据（注意文本的最后要空一行）　　

curl -H "Content-Type: application/json" -XPOST "localhost:9200/bank/account/_bulk?pretty&refresh" --data-binary "@accounts.json"

```
{"index":{"_id":"1"}}
{"account_number":1,"balance":39225,"firstname":"Amber","lastname":"Duke","age":32,"gender":"M","address":"880 Holmes Lane",
"employer":"Pyrami","email":"amberduke@pyrami.com","city":"Brogan","state":"IL"}

{"index":{"_id":"2"}}
{"account_number":6,"balance":5686,"firstname":"Hattie","lastname":"Bond","age":36,"gender":"M","address":"671 Bristol Street",
"employer":"Netagy","email":"hattiebond@netagy.com","city":"Dante","state":"TN"}
```

###### 12、查询文档数　

```
GET /_count   ///查询所有文档数
GET /index/_count       ///查询index中文档数
GET /index/type/_count ///查询type中的文档
```

###### 13、创建新的文档而不是覆盖有两种做法，创建成功会返回

```
PUT /website/blog/123?op_type=create
{ ... }

PUT /website/blog/123/_create
{ ... }
```

###### 14、使用脚本对文档进行更新，在原有的基础上加1，upsert表示如果没有该字段就初始化为1，retry_on_conflict=5表示更新失败后还要重试5次，因为有些操作是不在意执行的先后顺序的

```
POST /bank/account/1/_update?retry_on_conflict=5
{ "script" : "ctx._source.balance+=1", "upsert": { "balance": 1 } }
```

 

#### 二、简单查询

使用GET请求在URL后面携带参数来进行简单的查询

1、GET /bank/account/_search?_source=account_number,balance,&size=1&from=0&q=account_number:44

```
//这是查询返回的结果
{
   "took": 2,    //执行整个搜索请求耗费了多少毫秒
   "timed_out": false,    //查询是否超时
   "_shards": {    //表示查询中参与分片的总数，以及这些分片成功了多少个失败了多少个
      "total": 5,
      "successful": 5,
      "skipped": 0,
      "failed": 0
   },
   "hits": {    //所有查询到的结果
      "total": 1008,    //表示匹配到的文档总数
      "max_score": 1,    //结果中最大的评分
      "hits": [
         {
            "_index": "bank",    //    索引名称
            "_type": "account",    //type名称
            "_id": "25",    //id名称
            "_score": 1,    //评分
            "_source": {    //存储的数据源信息
               "account_number": 25,
               "balance": 40540,
               "firstname": "Virginia",
               "lastname": "Ayala",
               "age": 39,
               "gender": "F",
               "address": "171 Putnam Avenue",
               "employer": "Filodyne",
               "email": "virginiaayala@filodyne.com",
               "city": "Nicholson",
               "state": "PA"
            }
         }
      ]
   }
}
```

2、同时查询多索引多类型的数据

```
　　　　/_search在所有的索引中搜索所有的类型

　　　　/gb/_search在 gb 索引中搜索所有的类型

　　　　/gb,us/_search在 gb 和 us 索引中搜索所有的文档

　　　　/g*,u*/_search在任何以 g 或者 u 开头的索引中搜索所有的类型

　　　　/gb/user/_search在 gb 索引中搜索 user 类型

　　　　/gb,us/user,tweet/_search在 gb 和 us 索引中搜索 user 和 tweet 类型

　　　　/_all/user,tweet/_search在所有的索引中搜索 user 和 tweet 类型
```

3、不查询文档的元数据，只查询source部分的数据　　GET /{index}/{type}/{id}/_source

```
GET /bank/account/44/_source

//返回
{
   "account_number": 44,
   "balance": 34487,
   "firstname": "Aurelia",
   "lastname": "Harding",
   "age": 37,
   "gender": "M",
   "address": "502 Baycliff Terrace",
   "employer": "Orbalix",
   "email": "aureliaharding@orbalix.com",
   "city": "Yardville",
   "state": "DE"
}
```

#### 三、请求体查询

使用HTTP请求来发送json数据进行查询

1、查询所有的文档，默认评分是1，可以通过设置boost来，由于有些代理服务器不支持GET请求带请求体，所以实际中还是要用POST请求。

```
GET /bank/account/_search
{
  "query": {
    "match_all": {"boost":1.2} 
　　} 
}
```

2、分页查询所有文档

```
GET /bank/account/_search
{
  "query": {
    "match_all": {}
  },
  "from": 0, 
  "size": 1 
}
```

3、查询gender为M的账户，只显示account_number,gender,balance三个字段，通过balance倒序排列，从第一条开始查，页大小为20

```
GET /bank/account/_search
{
    "query":{
        "match": {
            "gender":"M"
        }
    },
    "_source":[
        "account_number",
        "gender",
        "balance"
    ],
    "sort": [
        {
            "balance": "desc"
       }
    ],
    "from":0,
    "size":20
    
}
```

4、全文检索，索引中只要有任意一个匹配拆分后词就可以出现在结果中，只是匹配度越高的排越前面

```
GET /bank/account/_search
{
    "query":{
        "match": {
            "address":"street"
        }
    }
}
```

上面的操作是默认为or，可以设置operator为and，这样就必须要所有的词都要匹配

```
GET /bank/account/_search
{
    "query":{
        "match": {
            "address":{
                "query":"171 Putnam",
                "operator":"and"
            }  
        }
    }
}
```

5、短语搜索，查询首先将查询字符串解析成一个词项列表，然后对这些词项进行搜索，但只保留那些包含 全部 搜索词项，且 位置 与搜索词项相同的文档。就相当于拿查询字符串直接去文档里面找

```
GET /_search
{
    "query": {
        "match_phrase" : {
            "message" : "this is a test"
        }
    }
}
```

6、match_phrase_prefix和match_phrase一样，不过它可以允许文本的最后一项使用前缀匹配。

```
GET /_search
{
    "query": {
        "match_phrase_prefix" : {
            "message" : {
                "query" : "quick brown f",
                "max_expansions" : 10
            }
        }
    }
}
```

7、可以匹配多字段，如下可以使用*还作为通配符进行匹配，使用^符号来对匹配字段的权重进行增加^3就是权重增加三倍。

```
GET /_search
{
  "query": {
    "multi_match" : {
      "query":    "this is a test", 
      "fields": [ "subject^3", "message*" ] 
    }
  }
}
```

8、短语匹配，但是允许中间间隔几个词，slop为几就是允许间隔几个词，几个词之间离的越近分数越高

```
GET /bank/account/_search
{
    "query":{
        "match_phrase": {
            "address":{
                "query":"171 Avenue",
                "slop":"1"
            }  
        }
    }
}
```

9、取回多个文档

```
///不同的index、不同的type
GET /_mget
{
   "docs" : [
      {
         "_index" : "index1",
         "_type" :  "type1",
         "_id" :    2
      },
      {
         "_index" : "index2",
         "_type" :  "type2",
         "_id" :    1,
         "_source":[
             "filed1",
             "filed2"
         ]
      }
   ]
}
```

```
///相同的index，不同的type
GET /{index}/_mget
{
   "docs" : [
      {"_type":"type1","_id" : 2},
      {"_type":"type2", "_id" :1 }
   ]
}
```

```
///相同的index和type，不同的id
GET /{index}/{type}/_mget
{
   "ids":[1,2]
}
```

10、term查找被用于精确值 匹配，这些精确值可能是数字、时间、布尔或者那些 `not_analyzed` 的字符串。`term` 查询对于输入的文本不 *分析* ，所以它将给定的值进行精确查询。

注意：如果要用term查找某个字段的值，要避免这个字段没有被分词，否则可能无法匹配到

```
GET /bank/account/_search
{
    "query":{
       "term": {
             "address": "171"
       }
    }
}
```

11、terms查询和 `term`查询一样，但它允许你指定多值进行匹配。如果这个字段包含了指定值中的任何一个值，那么这个文档满足条件。terms 查询对于输入的文本不分析。它查询那些精确匹配的值（包括在大小写、重音、空格等方面的差异）。

```
GET /bank/account/_search
{
    "query":{
        "terms": {
            "address": [ "Banker", "171", "Street"] 
        }
    }
}
```

12、exists和missing查询，分别用来判断是否存在或者缺失。

```
///查询是否存在field_name这个字段
GET /my_index/posts/_search
{
    "query" : {
        "constant_score" : {
            "filter" : {
                "exists" : { "field" : "field_name" }
            }
        }
    }
}
```

13、组合查询，因为很多时候查询条件都比较复杂，这时就需要使用bool来将多个查询组合起来。bool接收一下参数

`　　　　　　must`文档 *必须* 匹配这些条件才能被包含进来。

`　　　　　　must_not`文档 *必须不* 匹配这些条件才能被包含进来。

`　　　　　　should`如果满足这些语句中的任意语句，将增加 `_score` ，否则，无任何影响。它们主要用于修正每个文档的相关性得分。

　　　　　　`filter`*必须* 匹配，但它以不评分、过滤模式来进行。这些语句对评分没有贡献，只是根据过滤标准来排除或包含文档。filter中也可以嵌套bool

```
GET /bank/account/_search
{
    "query": {
        "bool": {
            "must":{ 
                "match": { "address": "street" }
            },
            "must_not": { 
                "match": { "balance":   "47406" }
            },
            "should": [
                { "match": { "balance": "3150" }}
            ],
            "filter": {
              "range": { 
                  "age": { "gte":30 }
              } 
            }
        }
    }
}
```

```
//bool过滤器可以嵌套使用
GET /my_store/products/_search
{
   "query" : {
      "filtered" : {
         "filter" : {
            "bool" : {
              "should" : [
                { "term" : {"productID" : "KDKE-B-9947-#kL5"}},
                { "bool" : { 
                  "must" : [
                    { "term" : {"productID" : "JODL-X-1937-#pV7"}}, 
                    { "term" : {"price" : 30}} 
                  ]
                }}
              ]
           }
         }
      }
   }
}
```

14、constant_score查询：它被经常用于你只需要执行一个 filter 而没有其它查询（例如，评分查询）的情况下。可以使用它来取代只有 filter 语句的 `bool` 查询。在性能上是完全相同的，但对于提高查询简洁性和清晰度有很大帮助。　

```
GET /bank/account/_search
{
    "query": {
       "constant_score":   {
            "filter": {
                "term": { "age": 30 } 
            }
        }
    }
}
```

15、验证查询：验证查询语句是否正确。

```
GET /bank/account/_validate/query
{
    "query": {
       "constant_score":   {
            "filter": {
                "term": { "age": 30 } 
            }
        }
    }
}
```

16、确保查询的字段与输入的字段完全匹配，最好的方式是增加并索引另一个字段， 这个字段用以存储该字段包含词项的数量。

```
GET /my_index/my_type/_search
{
    "query": {
        "constant_score" : {
            "filter" : {
                 "bool" : {
                    "must" : [
                        { "term" : { "tags" : "search" } }, 
                        { "term" : { "tag_count" : 1 } } 
                    ]
                }
            }
        }
    }
}
```

17、范围查找range，如果对字符串进行比较，那么是数字<大写字母<小写字母，字符从头开始比较，和js一样。

　　　　range的主要参数为：　　

　　　　　　`gt`: `>` 大于（greater than）

　　　　　　`lt`: `<` 小于（less than）

　　　　　　`gte`: `>=` 大于或等于（greater than or equal to）

　　　　　　`lte`: `<=` 小于或等于（less than or equal to）

```
GET /my_store/products/_search
{
    "query" : {
        "constant_score" : {
            "filter" : {
                "range" : {
                    "price" : {
                        "gte" : 20,
                        "lt"  : 40
                    }
                }
            }
        }
    }
}
```

```
///对于时间方面的范围可以通过now来表示当前时间，下面表示最近一个小时之内
"range" : {
    "timestamp" : {
        "gt" : "now-1h"
    }
}

///可以通拿过||符号后面跟一个日期表达式来表示日期，下面表示小于2014-01-01
"range" : {
    "timestamp" : {
        "gt" : "2014-01-01 00:00:00",
        "lt" : "2014-01-01 00:00:00||+1M" 
    }
}
```

18、设置最小匹配度　　后面可以是数字也可以是百分比

```
GET /my_index/my_type/_search
{
  "query": {
    "match": {
      "title": {
        "query":                "quick brown dog",
        "minimum_should_match": "75%"
      }
    }
  }
}
```

19、通过boost来提升权限，boost默认值为1

```
GET /_search
{
    "query": {
        "bool": {
            "must": {
                "match": {  
                    "content": {
                        "query":    "full text search",
                        "operator": "and"
                    }
                }
            },
            "should": [
                { "match": {
                    "content": {
                        "query": "Elasticsearch",
                        "boost": 3 
                    }
                }},
                { "match": {
                    "content": {
                        "query": "Lucene",
                        "boost": 2 
                    }
                }}
            ]
        }
    }
}
```

20、dis_max最大化查询：将任何与任一查询匹配的文档作为结果返回，但只将最佳匹配的评分作为查询的评分结果返回 。如果某一个field中匹配到了尽可能多的关键词，那么就应被排在前面；而不是尽可能多的field匹配到了少数的关键词排在前面。

```
{
    "query": {
        "dis_max": {
            "queries": [
                { "match": { "title": "Brown fox" }},
                { "match": { "body":  "Brown fox" }}
            ]
        }
    }
}
```

21、`tie_breaker` ：上面的dis_max只是将最佳匹配分数作为分数有时并不合理，所以用tie_breaker来设置其他匹配分数的权重，那么最后的分数就是所有分数的总和，tie_breaker的值为0到1。

```
{
    "query": {
        "dis_max": {
            "queries": [
                { "match": { "title": "Quick pets" }},
                { "match": { "body":  "Quick pets" }}
            ],
            "tie_breaker": 0.3
        }
    }
}
```

22、使用multi_match查询,多匹配查询的类型有多种，其中的三种恰巧与 三个场景对应，即： `best_fields` 、 `most_fields` 和 `cross_fields` （最佳字段、多数字段、跨字段）。我们可以使用multi_match来对查询语句进行简化。multi_match中尽量避免使用no_analyzed字段。

```
///原始查询
{
  "dis_max": {
    "queries":  [
      {
        "match": {
          "title": {
            "query": "Quick brown fox",
            "minimum_should_match": "30%"
          }
        }
      },
      {
        "match": {
          "body": {
            "query": "Quick brown fox",
            "minimum_should_match": "30%"
          }
        }
      },
    ],
    "tie_breaker": 0.3
  }
}

///简化后的查询
{
    "multi_match": {
        "query":                "Quick brown fox",
        "type":                 "best_fields", 
        "fields":               [ "title", "body" ],
        "tie_breaker":          0.3,
        "minimum_should_match": "30%" 
    }
}
```

23、多数字段查询most_field，根据字面上可知匹配的时候要尽可能将匹配了更多字段的文档返回过来，所有的字段都参与评分。

```
GET /my_index/_search
{
   "query": {
        "multi_match": {
            "query":       "jumping rabbits",
            "type":        "most_fields",
            "fields":      [ "title^10", "title.std" ] 
        }
    }
}
```

24、cross_field跨字段查询，将所有的字段看作是一个大的字段，然后去查询。

```
GET /books/_search
{
    "query": {
        "multi_match": {
            "query":       "peter smith",
            "type":        "cross_fields",
            "fields":      [ "title^2", "description" ] 
        }
    }
}
```


25、使用临近度提高相关度


```
GET /my_index/my_type/_search
{
  "query": {
    "bool": {
      "must": {
        "match": { 
          "title": {
            "query":                "quick brown fox",
            "minimum_should_match": "30%"
          }
        }
      },
      "should": {
        "match_phrase": { 
          "title": {
            "query": "quick brown fox",
            "slop":  50
          }
        }
      }
    }
  }
}
```

26、prefix前缀查询：默认状态下， `prefix` 查询不做相关度评分计算，它只是将所有匹配的文档返回，并为每条结果赋予评分值 `1` 。

```
GET /my_index/address/_search
{
    "query": {
        "prefix": {
            "postcode": "W1"
        }
    }
}
```



27、通配符查询wildcard:允许指定匹配的正则式。它使用标准的 shell 通配符查询： `?` 匹配任意字符， `*` 匹配 0 或多个字符。

```
GET /my_index/address/_search
{
    "query": {
        "wildcard": {
            "postcode": "W?F*HW" 
        }
    }
}
```

　　　　28、正则表达式查询Regexp：

```
GET /my_index/address/_search
{
    "query": {
        "regexp": {
            "postcode": "W[0-9].+" 
        }
    }
}
```

29、查询时输入即搜索match_phrase_prefix，就是在原有match_phrase的基础上将查询字符串的最后一个词作为前缀使用，来进行模糊匹配。

```
///参数 max_expansions 控制着可以与前缀匹配的词的数量，它会先查找第一个与前缀 bl 匹配的词，然后依次查找搜集与之匹配的词（按字母顺序），直到没有更多可匹配的词或当数量超过 max_expansions 时结束。
{
    "match_phrase_prefix" : {
        "brand" : {
            "query": "walker johnnie bl", 
            "slop":  10,
             "max_expansions":50
        }
    }
}
```

