### 1. 一般命令

1. 显示数据库列表：`show dbs`

2. 切换/创建数据库: `use dabaseA` (dabaseA为数据库名，如果该数据库不存在，则会创建)

3. 删除当前数据库：`db.dropDatabase()`  --当执行use dabaseA命令后，当前数据库就是dabaseA，所以再执行`db.dropDatabase()`，删除的当前数据库就是dabaseA。

4. 显示当前数据库中的操作命令：`db.help()`

5. 显示当前数据库中的集合：`show collections`  (这里的集合类似关系数据库中的表)

6. 显示数据库中某集合的操作命令： `db.table.help()` (这里的table是当前数据库中一个集合)

7. 往某一集合中插入数据：`db.person.insert({'name':'小王', 'age' : 20, 'sex':'男'})` 或者 `db.person.save({'name':'小王', 'age' : 20, 'sex':'男'})`

    **注意：**
     mongodb的save和insert函数都可以向collection里插入数据，但两者是有两个区别：

    -  使用save函数里，如果原来的对象不存在，那他们都可以向collection里插入数据，如果已经存在，save会调用update更新里面的记录,save则需要遍历列表，一个个插入，效率稍低
    　　
    - 而insert则会忽略操作,insert可以一次性插入一个列表，而不用遍历，效率高 
    
        **例如**：
            
        已存在数据：  `{_id : 'abc123', " name " : " 小王 " }`
        
        再次进行插入操作时　`insert({_id : 'abc123', " name " : " 小李 " })` 会报主键重复的错误提示
        　　

        `save({ _id : 'abc123', " name " : " 小李  " })`    会把 小王 修改为 小李  。
        
        如果集合中不存在 `_id : 'abc123'`，
    
        `insert({_id : 'abc123', " name " : " 小李 " })`    增加一条数据
        
        `save({ _id : 'abc123', " name " : " 小李  " })`    增加一条数据

9. 查看当前使用的数据库：`db` 或 `db.getName()` 两者效果一样

10. 显示当前数据库的状态：`db.stats()`

11. 显示当前数据库的版本 ：`db.version()`

12. 显示当前数据库链接的地址：`db.getMongo()`

13. 在指定的机器上，从数据库A，负责数据到B：`db.copyDatabase("mydb", "temp", "127.0.0.1")` 将本机的mydb的数据复制到temp数据库中

14. 显示当前数据库中所有集合: `db.getCollectionNames()`

15. 显示数据库的状态：`db.table.stats()`

16. 删除当前数据库中某个集合：`db.table.drop()` 删除集合 table

17. 删除当前数据库某个集合中的所有数据：`db.table.remove({})`  删除集合 table中所有数据

18. 删除当前数据库某个集合中`name='test'`的记录：`db.table.remove({name:'test'})` 

19. 删除当前数据库某个集合中所有数据：`db.Information.remove({})`

### 2. 查看集合基本信息命令

1. 查看当前数据库中某集合中的帮助：`db.table.help()`

1. 查看某集合的数据条数：`db.table.count()`

1. 查看某集合数据空间大小: `db.table.dataSize()` 单位是字节

1. 查看某集合的总空间大小：`db.table.storageSize()`
### 3. 查询命令
1. 查询索引记录：相当于`select * from table`

        db.table.find()
1. 查询age = 22的记录

        db.table.find({age:22})

1. 查询age >22的记录

        db.table.find({age:{$gt:22}})
        db.table.find("this.age>22")

1. 查询age>=22的记录

        db.table.find({age:{$gte:22}})
        db.table.find("this.age>=22")
5. 查询age <30的记录

        db.table.find({age:{$lt:30}})
        db.table.find("this.age < 30")

6. 查询age <=30的记录

        db.table.find({age:{$lte:30}})
        db.table.find("this.age<=30")

7. 查询age >20 并且age< 30的记录

        db.table.find({age:{gt:20,lt :30}})
        db.table.find("this.age>20 && this.age< 30")

8. 查询集合中name 包含mongo的数据,相当于like '%mongo%' 模糊查询

        db.table.find({name:/mongo/})
9. 查询集合中 name中以mongo开头的数据,相当于like 'mongo%' 模糊查询

        db.table.find({name:/^mongo/})
10. 查询集合中，只查询，name和age两列

        db.table.find({},{name:1,age:1})
11. 查询结合中age>10 ,并且只查询 name 和 age两列

        db.table.find({age:{$gt:10}},{name:1,age:1})
12. 按年龄排序

        db.table.find().sort({age:1,name:1}) 按照年龄和姓名升序
        db.table.find().sort({age:-1,name:1}) 按照年龄降序，姓名升序
        #python
        db.table.find().sort(‘age‘，pymongo.ASCENDING) 
        或 
        db.table.find().sort(‘age‘，1)升序；
        
        db.table.find().sort(‘age‘，pymongo.DESCENDING) 
        或
        db.table.find().sort(‘age‘，-1)降序

        db.table.find().sort([(‘age‘，pymongo.DESCENDING),('name',pymongo.ASCENDING)]) 年龄降序，姓名升序
        或
        db.table.find().sort([(‘age‘，-1),('name':1)])年龄降序，姓名升序

    注意mongo和python里面命令的区别是冒号，python是逗号

13. 查询前10条数据，相当于`select top 10 from table`

        db.table.find().limit(10)

14. 查询10条以后的数据，相当于 `select * from table where id not in (select top * from table )`

        db.table.find().skip(10)

15. 查询5-10条之间的数据
    
        db.table.find().skip(5).limit(10)

16. 查询 age =10 or age =20的记录

        db.table.find({$or:[{age:20},{age:30}]})

17. 查询age >20的记录条数
    
        db.table.find({age:{$gt:20}}).count()

18. 查询age>30 or age <20 的记录
    
        db.table.find({or:[{age:{gt:30}},{age:{$lt:20}}]})
        db.table.find("this.age>30 || this.age < 20")

19. 查询age > 40 or name ='mike'的记录　　

        db.table.find({or:[{age:{gt:40}},{name:'mike'}]})

20. 查询age > 40 or name ='mike'的记录，只查询name 和age两列,并且按照name升序，age降序

            db.table.find({or:[{age:{gt:40}},{name:'mike'}]},{name:1,age:-1})
    查询age > 40 并且 name ='mike'的记录，只查询name 和age两列,并且按照name升序，age降序

        db.table.find({and:[{age:{gt:40}},{name:'mike'}]},{name:1,age:-1})

    python 代码
    
        db.table.find({'and':[{age:{'$gt':40}},{'name':'mike'}]},{'name':1,'age':-1})  
        像and和字段名必须在引号内，否则报错

21. 查询age 在[30,40] 内的记录

        db.table.find({age:{$in:[30,40]}})

22. 查询age不在[30,40]范围内的记录

        db.table.find({age:{$nin:[30,40]}})

23. 查询age能被3整除的记录

        db.table.find({age:{$mod:[3,0]}})

24. 查询age能被3整除余2的记录

        
        db.table.find({age:{$mod:[3,2]}})
     
//假如有以下文档 { 'name' : { 'first' : 'Joe', 'last' : 'Schmoe' } 'age' : 45 }
        
25. 查询姓名为询姓名是Joe Schmoe的记录

        db.table.find({'name.first':'Joe','name.last':'Schmoe'})
        
        db.table.find({name:{first:'Joe',last:'Schmoe'}})
        
25. 如果需要多个元素来匹配数组，就需要使用$all了

　　　　//假设在我们表中3个下面的文档：

		db.food.insert({'_id' : 1,'fruit' : ['apple', 'banana', 'peach']})

		db.food.insert({'_id' : 2,'fruit' : ['apple', 'kumquat', 'orange']})

		db.food.insert({'_id' : 3,'fruit' : ['cherry', 'banana', 'apple']})

要找到既有apple又有banana的文档：

		db.food.find({fruit:{$all:['apple', 'banana']}})

26. 查询age不是30并且性别不是‘男’的记录,就用到 $nor

		db.person.find({$nor:[{age:30},{sex:'男'}]})

27. 查询age不大于30的记录，用到not，not执行逻辑NOT运算，选择出不能匹配表达式的文档 ，包括没有指定键的文档。

		db.person.find({age:{not:{gt:30}}})

28. 如果$exists的值为true,选择存在该字段的文档；若值为false则选择不包含该字段的文档。

　　　　选择age存在，且不在[30,40]只能的记录

		db.person.find({age:{exists:true,nin:[30,40]}})

29. 查询name中包括字母t的记录，类似 name like '%t%'

		db.person.find({name:/t/})

		db.person.find({name:{$regex:/t/}})

		db.person.find({name:/t/i})  i在这里是不区分大小写

		db.person.find({name:{regex:/t/,options:'i'}})  i在这里是不区分大小写

30. 查询name中以t字母结尾的记录，类似 name like '%t', 要用到符号$

		db.person.find({name:/t$/})

31. 如果在查询的时候需要多个元素来匹配数组，就需要用到$all了，这样就匹配一组元素。

    例如：假如创建了包含3个元素的如下集合：

        { "_id" : 1, "fruit" : [ "apple", "banana", "peach" ] }
        { "_id" : 2, "fruit" : [ "apple", "pear", "orange" ] }
        { "_id" : 3, "fruit" : [ "cherry", "banana", "apple" ] }

　　　　要找到既有apple, 又有banana的文档，就要用到$all

		db.food.find({fruit:{$all:['apple','banana']}})

　　　　查询结果如下：

        db.food.find({fruit:{$all:['apple','banana']}})
        { "_id" : 1, "fruit" : [ "apple", "banana", "peach" ] }
        { "_id" : 3, "fruit" : [ "cherry", "banana", "apple" ] }

　　　　注意两条结果记录的apple和banana的顺序是不一样的，也就是说，顺序无关紧要。

　　　　要是想查询指定数组位置的元素，则需要用key.index语法指定下标

		db.food.find({'fruit.2':'peach'})，结果为：

　　　　{ "_id" : 1, "fruit" : [ "apple", "banana", "peach" ] }

32. null

　　　　null比较奇怪，它确实能匹配本身，假如有下面的数据：

    { "_id" : 1, "fruit" : [ "apple", "banana", "peach" ] }
    { "_id" : 2, "fruit" : [ "apple", "pear", "orange" ] }
    { "_id" : 3, "fruit" : [ "cherry", "banana", "apple" ] }
    { "_id" : 4, "fruit" : null }

db.food.find({fruit:null}) 
查询结果：

    { "_id" : 4, "fruit" : null }

但是null不仅能匹配本身，而且能匹配“不存在的” ，例如：

　　　　`db.food.find({x: null})` ，food集合中本来不包含x键的，结果如下：

db.food.find({x:null})

    { "_id" : 1, "fruit" : [ "apple", "banana", "peach" ] }
    { "_id" : 2, "fruit" : [ "apple", "pear", "orange" ] }
    { "_id" : 3, "fruit" : [ "cherry", "banana", "apple" ] }
    { "_id" : 4, "fruit" : null }

33. $size 对于查询来说也是意义非凡，顾名思义就是可用它来查询指定长度的数组

    比如有以下数据：


    { "_id" : 1, "fruit" : [ "apple", "banana", "peach" ] }
    { "_id" : 2, "fruit" : [ "apple", "pear", "orange" ] }
    { "_id" : 3, "fruit" : [ "cherry", "banana", "apple" ] }
    { "_id" : 4, "fruit" : null }
    { "_id" : 5, "fruit" : [ "apple", "orange" ] }

`db.food.find({fruit:{$size:3}})`

查询结果如下：fruit对应的数组的长度为3

    { "_id" : 1, "fruit" : [ "apple", "banana", "peach" ] }
    { "_id" : 2, "fruit" : [ "apple", "pear", "orange" ] }
    { "_id" : 3, "fruit" : [ "cherry", "banana", "apple" ] }

`db.food.find({fruit:{$size:1}})`

查询结果如下：fruit对应的数组的长度为1

    { "_id" : 5, "fruit" : [ "apple", "orange" ] }

34. slice 可以按偏移量返回记录，针对数组。

    如{"slice":10}返回前10条,{"$slice":{[23,10]}}从24条取10条

    例如在集合food中有数据如下：

    
    { "_id" : 1, "fruit" : [ "apple", "pear", "orange", "strawberry", "banana" ], "name" : "fruitName1" }
    { "_id" : 2, "fruit" : [ "apple", "orange", "pear", "banana" ], "name" : "fruitName2" }
    { "_id" : 3, "fruit" : [ "cherry", "banana", "apple" ], "name" : "fruitName3" }
    { "_id" : 4, "fruit" : null }

    针对fruit 如何只获取该键对应数据前个数据，{"$slice":2}

    查询语句：db.food.find({},{fruit:{$slice:2}}) 查询结果为：

    { "_id" : 1, "fruit" : [ "apple", "pear" ], "name" : "fruitName1" }  注意fruit对应的数据，只获取了，前两个数据，后面的去掉了
    { "_id" : 2, "fruit" : [ "apple", "orange" ], "name" : "fruitName2" }
    { "_id" : 3, "fruit" : [ "cherry", "banana" ], "name" : "fruitName3" }
    { "_id" : 4, "fruit" : null }

    针对fruit 如何只获取该键对应数据从第二个数据开始取，取两个，{"$slice":[1,2]}

    查询语句：db.food.find({},{fruit:{$slice:[1,2]}}) 查询结果为：

    { "_id" : 1, "fruit" : [ "pear", "orange" ], "name" : "fruitName1" }
    { "_id" : 2, "fruit" : [ "orange", "pear" ], "name" : "fruitName2" }
    { "_id" : 3, "fruit" : [ "banana", "apple" ], "name" : "fruitName3" }
    { "_id" : 4, "fruit" : null }

35. $elemMatch
        
    如果对象有一个元素是数组，那么$elemMatch可以匹配内数组内的元素。

    例如数据集school中有如下数据：

        { "_id" : 1, "zipcode" : "63109", "students" : [ { "name" : "john", "school" : 102, "age" : 10 }, { "name" : "jess", "school" : 102, "age" : 11 },
        { "name" : "jeff", "school" : 108, "age" : 15 } ] }
        { "_id" : 2, "zipcode" : "63110", "students" : [ { "name" : "ajax", "school" : 100, "age" : 7 }, { "name" : "achilles", "school" : 100, "age" : 8 } ] }
        { "_id" : 3, "zipcode" : "63108", "students" : [ { "name" : "ajax", "school" : 100, "age" : 7 }, { "name" : "achilles", "school" : 100, "age" : 8 } ] }
        { "_id" : 4, "zipcode" : "63109", "students" : [ { "name" : "barney", "school" : 102, "age" : 7 }, { "name" : "ruth", "school" : 102, "age" : 16 } ] }
        { "_id" : 5, "zipcode" : "63109", "students" : [ { "name" : "barney", "school" : 102, "age" : 12 }, { "name" : "ruth", "school" : 102, "age" : 16 } ] }

要查询 zipcode="63109" ，school= ‘102’ 并且 age>10的记录


        db.school.find( { zipcode: "63109" },{ students: { elemMatch: { school: 102 ,age:{gt: 10}} } } )
        
查询结果：

        { "_id" : 1, "students" : [ { "name" : "jess", "school" : 102, "age" : 11 } ] }
        { "_id" : 4, "students" : [ { "name" : "ruth", "school" : 102, "age" : 16 } ] }
        { "_id" : 5, "students" : [ { "name" : "barney", "school" : 102, "age" : 12 } ] }

36. $exists 
    
    判断某个字段是否存在，查询school集合中存在zipcode字段的记录

        db.school.find({zipcode:{$exists:1}})

37. 假如有集合school ,数据如下：

        { "_id" : 1, "zipcode" : "63109", "students" : [ { "name" : "john", "school" : 102, "age" : 10 }, { "name" : "jess", "school" : 102, "age" : 11 }, { 　　"name" : "jeff", "school" : 108, "age" : 15 } ] }
        { "_id" : 2, "zipcode" : "63110", "students" : [ { "name" : "ajax", "school" : 100, "age" : 7 }, { "name" : "achilles", "school" : 100, "age" : 8 } ] }
        { "_id" : 3, "zipcode" : "63109", "students" : [ { "name" : "ajax", "school" : 100, "age" : 7 }, { "name" : "achilles", "school" : 100, "age" : 8 } ] }
        { "_id" : 4, "zipcode" : "63109", "students" : [ { "name" : "barney", "school" : 102, "age" : 7 }, { "name" : "ruth", "school" : 102, "age" : 16 } ] }
        { "_id" : 5, "zipcode" : "63109", "students" : [ { "name" : "barney", "school" : 102, "age" : 12 }, { "name" : "ruth", "school" : 102, "age" : 16 } ] }

    如果只查询students字段里面的内容，并且只查询school =102 的姓名和年龄信息：

    查询语句为：
        
        db.school.find({'students.school':102},{'students.name':1,'students.age':1})`

    结果如下：

        { "_id" : 1, "students" : [ { "name" : "john", "age" : 10 }, { "name" : "jess", "age" : 11 }, { "name" : "jeff", "age" : 15 } ] }
        { "_id" : 4, "students" : [ { "name" : "barney", "age" : 7 }, { "name" : "ruth", "age" : 16 } ] }
        { "_id" : 5, "students" : [ { "name" : "barney", "age" : 12 }, { "name" : "ruth", "age" : 16 } ] }
    假设school 集合中包含一些记录：students字段对应一个数据字典

        { "_id" : 7, "zipcode" : "63109", "students" : { "name" : "jike", "school" : "102", "age" : 45 } }
        { "_id" : 8, "zipcode" : "63109", "students" : { "name" : "Marry", "school" : "100", "age" : 75 } }

    如果只查询字段students对应name和age信息，则查询语句如下：

        db.school.find({_id:{$gt:5}},{'students.name':1,'students.age':1})

    结果为：这里_id是必须要显示的

        { "_id" : 7, "students" : { "name" : "jike", "age" : 45 } }
        { "_id" : 8, "students" : { "name" : "Marry", "age" : 75 } }