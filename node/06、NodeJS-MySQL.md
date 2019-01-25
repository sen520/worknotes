## Node.js 连接 MySQL

本章节我们将为大家介绍如何使用 Node.js 来连接 MySQL，并对数据库进行操作。

如果你还没有 MySQL 的基本知识，可以参考我们的教程：[MySQL 教程](http://www.runoob.com/mysql/mysql-tutorial.html)。

本教程使用到的 Websites 表 SQL 文件：[websites.sql](http://static.runoob.com/download/websites.sql)。

#### （1）安装驱动

本教程使用了[淘宝定制的 cnpm 命令](http://www.runoob.com/nodejs/nodejs-npm.html#taobaonpm)进行安装：

```
$ cnpm install mysql
```

#### （2）连接数据库

在以下实例中根据你的实际配置修改数据库用户名、及密码及数据库名：

test.js 文件代码：

```js
var mysql = require('mysql');
var connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'123456',
  database:'test'
});

connection.connect();

connection.query('SELECT 1+1 AS solution',function(error,result,fields){
  if (error) throw error;
  console.log('The solution is: ', result[0].solution);
}) 
```

执行以下命令输出结果为：

```
The solution is:  2
```

#### （3）数据库连接参数说明：

| 参数               | 描述                                                         |
| :----------------- | :----------------------------------------------------------- |
| host               | 主机地址 （默认：localhost）                                 |
| user               | 用户名                                                       |
| password           | 密码                                                         |
| port               | 端口号 （默认：3306）                                        |
| database           | 数据库名                                                     |
| charset            | 连接字符集（默认：'UTF8_GENERAL_CI'，注意字符集的字母都要大写） |
| localAddress       | 此IP用于TCP连接（可选）                                      |
| socketPath         | 连接到unix域路径，当使用 host 和 port 时会被忽略             |
| timezone           | 时区（默认：'local'）                                        |
| connectTimeout     | 连接超时（默认：不限制；单位：毫秒）                         |
| stringifyObjects   | 是否序列化对象                                               |
| typeCast           | 是否将列值转化为本地JavaScript类型值 （默认：true）          |
| queryFormat        | 自定义query语句格式化方法                                    |
| supportBigNumbers  | 数据库支持bigint或decimal类型列时，需要设此option为true （默认：false） |
| bigNumberStrings   | supportBigNumbers和bigNumberStrings启用 强制bigint或decimal列以JavaScript字符串类型返回（默认：false） |
| dateStrings        | 强制timestamp,datetime,data类型以字符串类型返回，而不是JavaScript Date类型（默认：false） |
| debug              | 开启调试（默认：false）                                      |
| multipleStatements | 是否许一个query中有多个MySQL语句 （默认：false）             |
| flags              | 用于修改连接标志                                             |
| ssl                | 使用ssl参数（与crypto.createCredenitals参数格式一至）或一个包含ssl配置文件名称的字符串，目前只捆绑Amazon RDS的配置文件 |

更多说明可参见：<https://github.com/mysqljs/mysql>

------

#### （4）数据库操作( CURD )

 MySQL 用户名为 root，密码为 123456，数据库为 dept，你需要根据自己配置情况修改。

###### 查询数据

将上面我们提供的 SQL 文件导入数据库后，执行以下代码即可查询出数据：

```js
var mysql = require('mysql');

var connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'123456',
  port:'3306',
  database:'test',
});

connection.connect();

var sql = 'select * from dept';

// 查
connection.query(sql,function(err,result){
  if (err){
  	console.log('[SELECT ERROR] - ',err.message);
  	return;
  }
   console.log('--------------------------SELECT----------------------------');
   console.log(result);
   console.log('------------------------------------------------------------\n\n');  
})
/*
--------------------------SELECT----------------------------
[ RowDataPacket { DEPTNO: 10, DNAME: 'ACCOUNTING', LOC: 'NEW YORK' },
  RowDataPacket { DEPTNO: 20, DNAME: 'RESEARCH', LOC: 'DALLAS' },
  RowDataPacket { DEPTNO: 30, DNAME: 'SALES', LOC: 'CHICAGO' },
  RowDataPacket { DEPTNO: 40, DNAME: 'OPERATIONS', LOC: 'BOSTON' } ]
------------------------------------------------------------
*/
```

###### 插入数据

我们可以向数据表 websties 插入数据：

```js
var mysql = require('mysql');
var connection = mysql.createConnection({
  host:'127.0.0.1',
  user:'root',
  password:'123456',
  port:'3306',
  database:'test',
});

var addSQL = "INSERT INTO bonus values(?,?,?,?);";
var addSQLParams = ['zsx','xxx',23,34];
// 增加
connection.query(addSQL,addSQLParams,function(err,result){
  if(err){
  	console.log('[INSERT ERROR] -',err.message);
  	return;
  }
       console.log('--------------------------INSERT----------------------------');
       //console.log('INSERT ID:',result.insertId);        
       console.log('INSERT ID:',result);        
       console.log('-----------------------------------------------------------------\n\n');  
})
/*
--------------------------INSERT----------------------------
INSERT ID: OkPacket {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 0,
  serverStatus: 2,
  warningCount: 0,
  message: '',
  protocol41: true,
  changedRows: 0 }
-----------------------------------------------------------------
*/
```

执行成功后，查看数据表，即可以看到添加的数据：

![CRUD](..\img\CRUD.png)

###### 更新数据

我们也可以对数据库的数据进行修改：

```js
var mysql = require('mysql');
var connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'123456',
  port:'3306',
  database:'test',
})

connection.connect();

var modSQL = 'update bonus set ename = "ls" where sal = 34;';
// 改
connection.query(modSQL,function(err,result){
  if (err){
  	console.log('[UPDATE ERROR] - ',err.message);
  	return;
  }
    console.log('--------------------------UPDATE----------------------------');
  console.log('UPDATE affectedRows',result.affectedRows);
  console.log('-----------------------------------------------------------------\n\n');
})
/*
--------------------------UPDATE----------------------------
UPDATE affectedRows 1
-----------------------------------------------------------------
*/
```

###### 删除数据

```js
var mysql = require('mysql');

var connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'123456',
  port:'3306',
  database:'test',
})

connection.connect();

var delSQL = 'DELETE FROM bonus WHERE sal=23;';

connection.query(delSQL,function(err,result){
  if(err){
    console.log('[DELETE ERROR] - ',err.message);
    return
  }
         console.log('--------------------------DELETE----------------------------');
       console.log('DELETE affectedRows',result.affectedRows);
       console.log('-----------------------------------------------------------------\n\n');  
})
/*
--------------------------DELETE----------------------------
DELETE affectedRows 1
-----------------------------------------------------------------
*/
```