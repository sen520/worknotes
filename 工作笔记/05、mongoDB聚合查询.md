[mongoDB官方文档](https://docs.mongodb.com/manual/reference/operator/aggregation/or/)
[mongo aggregate](http://www.cnblogs.com/xiexiang168/p/8484919.html)

[小知识](https://phab.buttontech.net/w/dev/%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3/mongodb/)

```js
/**
 * lookup:  默认打包
 *   from : 需要连接的集合
 *   localfield : 当前集合需要连接的字段
 *   foreignField : 外连接集合中的字段
 *   as : 查询结果输出到此字段中         
 */
{'$lookup': {'from': 'project', 'localField': 'fromId', 'foreignField': 'creatorId',
             'as': 'project'}},

```

group 、 max 、 min 、 avg 、 
addToSet 没有重复 、 push 、
first 取第一个 、 last 取最后一个 、 
project 显示字段，0：不显示，1：显示 、
match 匹配条件 、 lt 小于 、 gt 大于
limit 、 skip ....

$project：包含、排除、重命名和显示字段

$match：查询，需要同find()一样的参数

$limit：限制结果数量

$skip：忽略结果的数量

$sort：按照给定的字段排序结果

$group：按照给定表达式组合结果

$concatArr 拼接数组

$unwind：分割数组

```mongo
db.inventory.aggregate( [ { $unwind : "$sizes" } ] )
该操作返回以下结果：
{ "id" : 1, "item" : "ABC1", "sizes" : "S" }
{ "id" : 1, "item" : "ABC1", "sizes" : "M" }
{ "_id" : 1, "item" : "ABC1", "sizes" : "L" }
```

$lookup：类似于关系型数据库中的 left outer join

$replaceRoot:

```
{
   "_id" : 1,
   "fruit" : [ "apples", "oranges" ],
   "in_stock" : { "oranges" : 20, "apples" : 60 },
   "on_order" : { "oranges" : 35, "apples" : 75 }
}
{
   "_id" : 2,
   "vegetables" : [ "beets", "yams" ],
   "in_stock" : { "beets" : 130, "yams" : 200 },
   "on_order" : { "beets" : 90, "yams" : 145 }
}
==================================
db.produce.aggregate( [
   {
     $replaceRoot: { newRoot: "$in_stock" }
   }
] )
=================================================

{ "oranges" : 20, "apples" : 60 }
{ "beets" : 130, "yams" : 200 }

```

$facet：在同一组输入文档中的单个阶段内处理多个聚合流水线。支持创建多方面的聚合，能够在单个阶段中跨多个维度或方面表征数据。



```python
import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017')


# =========================添加数据===========================

# for i in range(0,10):
#     client.info.test_order.insert(
#         {'order_number':i,'order_price':2*i,'order_type':1}
#     )
#
# for i in range(10,20):
#     client.info.test_order.insert(
#         {'order_number':i,'order_price':2*i,'order_type':2}
#     )
#
# for i in range(20,30):
#     client.info.test_order.insert(
#         {'order_number':i,'order_price':3*i,'order_type':3}
#     )

# =========================数据查询===========================
info = client.info
# [$group]
# _id 是要进行分组的key，如果_id为null  相当于select  count(*) from table;

# $sum:
# 统计test_order表条数 ==  'select count(*) as count from test_order';
a1 = [{'$group': {'_id': 'null', 'count': {'$sum': 1}}}]

# 统计test_order表 order_price总和  == 'select sum(order_price) as total_order_price from test_order';
a2 = [{'$group': {'_id': 'null', 'total_price': {'$sum': '$order_price'}}}]

# 统计test_order表不同订单的order_price总和 == 'select sum(order_price) as total_order_price from test_order group by order_type';
a3 = [{'$group': {'_id': '$order_type', 'total_price': {'$sum': '$order_price'}}}]

# min、$max :
# 统计test_order表中order_price最大价格和最小价格
# 不同订单的最大值和最小值 == 'select max(order_price) as order_type_max_price from test_order group by order_type';
a41 = [{'$group': {'_id': 'null', 'max': {'$max': '$order_price'}}}]
a42 = [{'$group': {'_id': 'null', 'min': {'$min': '$order_price'}}}]
a43 = [{'$group': {'_id': '$order_type', 'max': {'$max': '$order_price'}}}]
a44 = [{'$group': {'_id': '$order_type', 'min': {'$min': '$order_price'}}}]

# $avg
# 统计test_order表中order_price平均价格
# 和不同订单的平均价格 == 'select avg(order_price) as order_type_avg_price from test_order group by order_type';
a5 = [{'$group': {'_id': '$order_type', 'avg': {'$avg': '$order_price'}}}]

# $push可以有重复、$addToSet没有重复
# 列举出test_order表中不同类型的订单价格 数据都不要超出16M
a61 = [{'$group': {'_id': '$order_type', 'order_type_price_info': {'$push': '$order_price'}}}]
a62 = [{'$group': {'_id': '$order_type', 'order_type_distinct_price_info': {'$addToSet': '$order_price'}}}]

# $first、$last
# 统计test_order表中不同订单的第一条和最后一条的订单价格(如果有排序则按照排序，如果没有取自然first和last)
a71 = [{'$group': {'_id': '$order_type', 'first': {'$first': '$order_price'}}}]
a72 = [{'$group': {'_id': '$order_type', 'last': {'$last': '$order_price'}}}]

# [$project]
# 根据需求去除test_order不需要展示的字段
b11 = [{'$group': {'_id': '$order_type', 'order_type_sum_price': {'$sum': '$order_price'}}}]
b12 = [{'$group': {'_id': '$order_type', 'order_type_sum_price': {'$sum': '$order_price'}}},
       {'$project': {'_id': 0, 'order_type_sum_price': 1}}]

# [$match]
# 查询不同订单售卖的总价格，其中总价格大于100的 ==
# 'select sum(order_price) as order_type_sum_price from test_order group by order_price having order_type_sum_price > 100'
c11 = [{'$group': {'_id': '$order_type', 'order_type_sum_price': {'$sum': '$order_price'}}},
       {'$match': {'order_type_sum_price': {'$gt': 10}}}]
c12 = [{'$group': {'_id': '$order_type', 'order_type_sum_price': {'$sum': '$order_price'}}},
       {'$match': {'order_type_sum_price': {'$lt': 100}}}]
# 查询 order_type = 3 的总价 = 'select sum(order_price) as total_price' from test_order where order_type = 3';
c13 = [{'$match': {'order_type': 3}}, {'$group': {'_id': 'null', 'total_price': {'$sum': '$order_price'}}}]

# [$limit、$skip]
# 查询限制条数，和跳过条数可以使用在阶段管道用在$group 之前可以大大的提高查询性能
d11 = [{'$skip': 2}, {'$limit': 4}]
d12 = [{'$limit': 4}, {'$skip': 2}]

# [$unwind]
# 可以拆分数组类型字段，其中包含数组字段值
e0 = [{'$match': {'order_price': {'$gt': 30}}},
      {'$group': {'_id': '$order_type', 'order_price': {'$push': '$order_price'}}}]
e1 = [{'$match': {'order_price': {'$gt': 30}}},
      {'$group': {'_id': '$order_type', 'order_price': {'$push': '$order_price'}}}, {'$unwind': '$order_price'}]

# [$out]
# 是把执行的结果写入指定数据表中
f1 = [{'$match': {'order_price': {'$gt': 30}}},
      {'$group': {'_id': '$order_type', 'order_price': {'$push': '$order_price'}}}, {'$unwind': '$order_price'}]
f2 = [{'$match': {'order_price': {'$gt': 30}}},
      {'$group': {'_id': '$order_type', 'order_price': {'$push': '$order_price'}}},
      {'$project': {'_id': 0, 'order_price': 1}}, {'$unwind': '$order_price'}, {'$out': 'test_result'}]
res = info.test_order.aggregate(f2)
for i in res:
    print(i)
```

