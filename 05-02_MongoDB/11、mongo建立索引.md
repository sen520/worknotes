# 1、MongoDB 索引

索引通常能够极大的提高查询的效率，如果没有索引，MongoDB在读取数据时必须扫描集合中的每个文件并选取那些符合查询条件的记录。

这种扫描全集合的查询效率是非常低的，特别在处理大量的数据时，查询可以要花费几十秒甚至几分钟，这对网站的性能是非常致命的。

索引是特殊的数据结构，索引存储在一个易于遍历读取的数据集合中，索引是对数据库表中一列或多列的值进行排序的一种结构

------

## createIndex() 方法

MongoDB使用 createIndex() 方法来创建索引。

> 注意在 3.0.0 版本前创建索引方法为 db.collection.ensureIndex()，之后的版本使用了 db.collection.createIndex() 方法，ensureIndex() 还能用，但只是 createIndex() 的别名。

### 语法

createIndex()方法基本语法格式如下所示：

```
>db.collection.createIndex(keys, options)
```

语法中 Key 值为你要创建的索引字段，1 为指定按升序创建索引，如果你想按降序来创建索引指定为 -1 即可。

### 实例

```
>db.col.createIndex({"title":1})
>
```

createIndex() 方法中你也可以设置使用多个字段创建索引（关系型数据库中称作复合索引）。

```
>db.col.createIndex({"title":1,"description":-1})
>
```

createIndex() 接收可选参数，可选参数列表如下：

| Parameter          | Type          | Description                                                  |
| ------------------ | ------------- | ------------------------------------------------------------ |
| background         | Boolean       | 建索引过程会阻塞其它数据库操作，background可指定以后台方式创建索引，即增加 "background" 可选参数。 "background" 默认值为**false**。 |
| unique             | Boolean       | 建立的索引是否唯一。指定为true创建唯一索引。默认值为**false**. |
| name               | string        | 索引的名称。如果未指定，MongoDB的通过连接索引的字段名和排序顺序生成一个索引名称。 |
| dropDups           | Boolean       | 3.0+版本已废弃。在建立唯一索引时是否删除重复记录,指定 true 创建唯一索引。默认值为 **false**. |
| sparse             | Boolean       | 对文档中不存在的字段数据不启用索引；这个参数需要特别注意，如果设置为true的话，在索引字段中不会查询出不包含对应字段的文档.。默认值为 **false**. |
| expireAfterSeconds | integer       | 指定一个以秒为单位的数值，完成 TTL设定，设定集合的生存时间。 |
| v                  | index version | 索引的版本号。默认的索引版本取决于mongod创建索引时运行的版本。 |
| weights            | document      | 索引权重值，数值在 1 到 99,999 之间，表示该索引相对于其他索引字段的得分权重。 |
| default_language   | string        | 对于文本索引，该参数决定了停用词及词干和词器的规则的列表。 默认为英语 |
| language_override  | string        | 对于文本索引，该参数指定了包含在文档中的字段名，语言覆盖默认的language，默认值为 language. |

### 实例

在后台创建索引：

```
db.values.createIndex({open: 1, close: 1}, {background: true})
```

通过在创建索引时加 background:true 的选项，让创建工作在后台执行

# 2、MongoDB 索引限制

------

## 额外开销

每个索引占据一定的存储空间，在进行插入，更新和删除操作时也需要对索引进行操作。所以，如果你很少对集合进行读取操作，建议不使用索引。

------

## 内存(RAM)使用

由于索引是存储在内存(RAM)中,你应该确保该索引的大小不超过内存的限制。

如果索引的大小大于内存的限制，MongoDB会删除一些索引，这将导致性能下降。

------

## 查询限制

索引不能被以下的查询使用：

- 正则表达式及非操作符，如 `$nin`, `$not`, 等。
- 算术运算符，如 `$mod`, 等。
- `$where` 子句

所以，检测你的语句是否使用索引是一个好的习惯，可以用explain来查看。

------

## 索引键限制

从2.6版本开始，如果现有的索引字段的值超过索引键的限制，MongoDB中不会创建索引。

------

## 插入文档超过索引键限制

如果文档的索引字段值超过了索引键的限制，MongoDB不会将任何文档转换成索引的集合。与mongorestore和mongoimport工具类似。

------

## 最大范围

- 集合中索引不能超过64个
- 索引名的长度不能超过128个字符
- 一个复合索引最多可以有31个字段

# 3、pymongo 索引相关操作

- [pymongo.collection.Collection.create_index](https://api.mongodb.com/python/current/api/pymongo/collection.html?highlight=index#pymongo.collection.Collection.create_index) (Python method, in `collection` – Collection level operations)
- [pymongo.collection.Collection.create_indexes](https://api.mongodb.com/python/current/api/pymongo/collection.html?highlight=index#pymongo.collection.Collection.create_indexes) (Python method, in `collection` – Collection level operations)
- [pymongo.collection.Collection.drop_index](https://api.mongodb.com/python/current/api/pymongo/collection.html?highlight=index#pymongo.collection.Collection.drop_index) (Python method, in `collection` – Collection level operations)
- [pymongo.collection.Collection.drop_indexes](https://api.mongodb.com/python/current/api/pymongo/collection.html?highlight=index#pymongo.collection.Collection.drop_indexes) (Python method, in `collection` – Collection level operations)
- [pymongo.collection.Collection.ensure_index](https://api.mongodb.com/python/current/api/pymongo/collection.html?highlight=index#pymongo.collection.Collection.ensure_index) (Python method, in `collection` – Collection level operations)
- [pymongo.collection.Collection.index_information](https://api.mongodb.com/python/current/api/pymongo/collection.html?highlight=index#pymongo.collection.Collection.index_information) (Python method, in `collection` – Collection level operations)
- [pymongo.collection.Collection.list_indexes](https://api.mongodb.com/python/current/api/pymongo/collection.html?highlight=index#pymongo.collection.Collection.list_indexes) (Python method, in `collection` – Collection level operations)
- [pymongo.collection.Collection.reindex](https://api.mongodb.com/python/current/api/pymongo/collection.html?highlight=index#pymongo.collection.Collection.reindex) (Python method, in `collection` – Collection level operations)