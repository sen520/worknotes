## HBase

非关系型数据库

----Hadoop Database

高可靠性、高性能、面向列、可伸缩、实时读写的分布式数据库。

数据实际上存储在HDFS上，利用MapReduce来处理海量的数据，利用zookeeper作为分布式协同服务，主要用来存储非结构化和半结构话的松散数据（NoSQL）。

#### 对比

##### 关系型数据库

关系模型指的是二维表格模型

关系型数据库就是由二维表及其之间的联系所组成的一个数据组织。



ACID，指数据库事务正确执行的四个基本要素的缩写。

​	包含：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）、持久性（Durability）。

容易理解

使用方便：通用的SQL语言

易于维护：丰富的完整性，减少了数据的冗余和数据的不一致的概率



**三大瓶颈**

高并发读写的需求：磁盘IO

海量的数据读写性能低

扩展性和可用性差



**数据库三范式**



在关系型数据库中，导致性能欠佳的主要原因是：

​	多表的关联查询

​	复杂的数据分析类型的复杂SQL查询。



##### 非关系型数据库

特点：

​	一般不支持ACID特性，无需经过SQL解析，读写性能高。

​	储存格式：key value、文档、图片等。（在HBase中是以二进制流的方式存储）

​	数据没有耦合性，容易扩展。

缺点

​	很难体验设计的完整性、适合存储一些简单的数据

​	只能用于简单的数据查询

分类

​	面向高性能并发读写的key-value数据库：Redis(查询比插入快)

​	面向海量数据访问的面向文档数据库：MongoDB

​	面向可扩展性的分布式数据库（海量数据量的增加，数据结构的变化）

#### HBase

##### 数据模型

1、ROW KEY

​	决定一行数据

​	按照字典顺序排序的。

​	Row key只能存储64k的字节数据

2、Column Family 列族 & qualifier

​	HBase表中的每个列都归属于某个列族，列族必须作为表模式(schema)定义的一部分预先给出。如 create ‘test’, ‘course’；
​		列名以列族作为前缀，每个“列族”都可以有多个列成员(column)；如 course:math, course:english, 新的列可以随后按需、动态加入；权限控制、存储以及调优都是在列族层面进行的；
​		HBase把同一列族里面的数据存储在同一目录下，由几个文件保存。

3、Cell 单元格
		由行和列的坐标交叉决定； 单元格是有版本的；
		单元格的内容是未解析的字节数组；
		由{row key， column( =<family> +<qualifier>)， version} 唯一确定的单元。cell中的数据是没有类型的，全部是字节码形式存贮。

4、Timestamp 时间戳
		在HBase每个cell存储单元对同一份数据有多个版本，根据唯一的时间戳来区分每个版本之间的差异，不同版本的数据按照时间倒序排序，最新的数据版本排在最前面。
		时间戳的类型是 64位整型。
		时间戳可以由HBase(在数据写入时自动)赋值，此时时间戳是精确到毫秒的当前系统时间。 时间戳也可以由客户显式赋值，如果应用程序要避免数据版本冲突，就必须自己生成具有唯一性的时间戳。

5、HLog(WAL log)
		HLog文件就是一个普通的HadoopSequenceFile，Sequence File的Key是HLogKey对象，HLogKey中记录了写入数据的归属信息，除了table和region名字外，同时还包括 sequence number和timestamp，timestamp是”写入时间”，sequence number的起始值为0，或者是最近一次存入文件系统中sequence number。
		HLog SequeceFile的Value是HBase的KeyValue对象，即对应HFile中的KeyValue。

##### 体系架构

![HBase体系架构](.\img\HBase体系架构.png)

client 找到HRegionServer进行读写

按照rowkey切分

Hlog在HRegion外面，HRegionServer里面

一个store对应一列，所以最多只能有三个 

1、Client
		包含访问HBase的接口并维护cache来加快对HBase的访问

2、Zookeeper

​	保证任何时候，集群中只有一个master；
​		存贮所有Region的寻址入口。
​		实时监控Region server的上线和下线信息。并实时通知Master
​		存储HBase的schema和table元数据

3、Master

​	为Region server分配region；
​		负责Region server的负载均衡；
​		发现失效的Region server并重新分配其上的region；
​		管理用户对table的增删改操作

4、RegionServer

​	Region server维护region，处理对这些region的IO请求
​		Region server负责切分在运行过程中变得过大的region

5、Region

​	– HBase自动把表水平划分成多个区域(region)，每个region会保存一个表里面某段连续的数据；每个表一开始只有一个region，随着数据不断插入表，region不断增大，当增大到一个阀值的时候，region就会等分会两个新的region（裂变）；
​		– 当table中的行不断增多，就会有越来越多的region。这样一张完整的表被保存在多个Regionserver 上

6、Memstore与storefile

​	一个region由多个store组成，一个store对应一个CF（列族）
​		store包括位于内存中的memstore和位于磁盘的storefile写操作先写入memstore，当memstore中的数据达到某个阈值，hregionserver会启动flashcache进程写入storefile，每次写入形成单独的一个storefile；当storefile文件的数量增长到一定阈值后，系统会进行合并（minor、majorcompaction），在合并过程中会进行版本合并和删除工作（majar），形成更大的storefile
​		– 当一个region所有storefile的大小和超过一定阈值后，会把当前的region分割为两个，并由hmaster分配到相应的regionserver服务器，实现负载均衡

​	– 客户端检索数据，先在memstore找，找不到再找storefile
​		– HRegion是HBase中分布式存储和负载均衡的最小单元。最小单元就表示不同的HRegion可以分布在不同的 HRegion server上。
​		– HRegion由一个或者多个Store组成，每个store保存一个columns family。
​		– 每个Strore又由一个memStore和0至多个StoreFile组成。如图：StoreFile以HFile格式保存在HDFS上

##### HBase读写操作

**1.1 写操作流程**  

(1) Client通过Zookeeper的调度，向RegionServer发出写数据请求，在Region中写数据。  

(2) 数据被写入Region的MemStore，直到MemStore达到预设阈值。 

(3) MemStore中的数据被Flush成一个StoreFile。 

(4) 随着StoreFile文件的不断增多，当其数量增长到一定阈值后，触发Compact合并操作，将多个StoreFile合并成一个StoreFile，同时进行版本合并和数据删除。 

(5) StoreFiles通过不断的Compact合并操作，逐步形成越来越大的StoreFile。  

(6) 单个StoreFile大小超过一定阈值后，触发Split操作，把当前Region Split成2个新的Region。父Region会下线，新Split出的2个子Region会被HMaster分配到相应的RegionServer上，使得原先1个Region的压力得以分流到2个Region上。  

可以看出HBase只有增添数据，所有的更新和删除操作都是在后续的Compact历程中举行的，使得用户的写操作只要进入内存就可以立刻返回，实现了HBase I/O的高性能。 

**1.2 读操作流程**  

(1) Client访问Zookeeper，查找-ROOT-表，获取.META.表信息。  

(2) 从.META.表查找，获取存放目标数据的Region信息，从而找到对应的RegionServer。  

(3) 通过RegionServer获取需要查找的数据。  

(4) Regionserver的内存分为MemStore和BlockCache两部分，MemStore主要用于写数据，BlockCache主要用于读数据。读请求先到MemStore中查数据，查不到就到BlockCache中查，再查不到就会到StoreFile上读，并把读的结果放入BlockCache。  

寻址过程：client–>Zookeeper–>-ROOT-表–>META表–>RegionServer–>Region–>client 

## 环境搭建

tar -zxvf hbase-0.98.12.1-hadoop2-bin.tar.gz 

mv hbase-0.98.12.1-hadoop2 hbase-0.98.12.1

##### 1、配置文件

cd /home/hbase-0.98.12.1/conf

vim hbase-env.sh 

```
export JAVA_HOME=/usr/java/jdk1.7.0_67
export HBASE_MANAGES_ZK=false
```

vim hbase-site.xml 

```
<property>
	<name>hbase.rootdir</name>
	<value>hdfs://sen/hbase</value>    ========hdfs://sen/------------hdfs集群名称
</property>
<property>
	<name>hbase.cluster.distributed</name>
	<value>true</value>
</property>
<property>
	<name>hbase.zookeeper.quorum</name>
	<value>hadoop01,hadoop02,hadoop03</value>
</property>
```

vim regionservers 

```
hadoop02 
hadoop03         
```

vim backup-masters

```
hadoop02
```

cp  /home/hadoop-2.6.5/etc/hadoop/hdfs-site.xml  ./

##### 2、配置环境变量

vim ~/.bash_profile

```
export HBASE_HOME=/home/hbase-0.98.12.1
export PATH=$PATH:$HBASE_HOME/bin
```

scp -r ~/.bash_profile hadoop02:/root/

scp -r ~/.bash_profile hadoop03:/root/

source ~/.bash_profile

scp -r hbase-0.98.12.1 hadoop02:/home/

scp -r hbase-0.98.12.1 hadoop03:/home/

## 启动

在哪启动哪台机器就是master

zkServer.sh start

start-all.sh 

start-hbase.sh

http://hadoop01:60010

![HBase shell](.\img\HBase shell.png)

##### 操作

hbase shell

list  --- 查看表

create 'python' ,'cf1'   =======创建表

scan 'python'  查看表

put 'python' ,'rk00101' ,'cf1:name','zs'==== 添加记录

get 'python' ,'rk00101','cf1:age'  ===== 查看记录

delete 'python' ,'rk00101','cf1:age' ==== 删除记录

 disable 'python'        drop 'python'    ======删除表

##### API

```python
#!/usr/bin/env python3
# ! coding:utf-8 -*-

import happybase

'''
https://blog.csdn.net/lizhe_dashuju/article/details/53931749
此时会出现下面的错误：
thriftpy.parser.exc.ThriftParserError: ThriftPy does not support generating module with path in protocol 'c'

解决的办法请参考这个连接：
http://stackoverflow.com/questions/39220102/error-import-impyla-library-on-windows
即将   C:\Python27\Lib\site-packages\thriftpy\parser\parser.py , line 488        
if url_scheme == '':
修改为
if len(url_scheme) <= 1:

https://www.jianshu.com/p/ec0f456cf816

参数：
row_start、row_stop：起始和终止rowkey，查询两rowkey间的数据
row_prefix：rowkey前缀。注：使用row_prefix的时候，row_start和row_stop不能使用
filter：要使用的过滤器(hbase 0.92版本及以上生效)
timestamp：按指定时间戳查询
reverse：默认为False。为True时，scan结果按rowkey倒序排列



hbase 连接 
      row   查询 = get  对列族 列 
      put   插入数据   批量插入
      scan  扫描  批量扫描  rowkey的【start，stop】相当于mysql里where查询 
            过滤器  row_prefix：rowkey前缀过滤 左闭右开
            ...

'''
# 要先在hbase某个节点上开启thrift服务
# hbase thrift -p 9090 start
connection = happybase.Connection('hadoop01', autoconnect=False)
# connection.create_table(name='python2',families='cf1')
connection.open()

# print所有的表名
print('All tables: ', connection.tables(), '\n')

# 操作testtable表
# 这个操作是一个提前声明-我要用到这个表了-但不会提交给thrift server做操作
table = connection.table(b'python')
#
# # 检索某一行
row = table.row(b'1234')
print('a row:', row, '\n')
#
# # right
print(row[b'cf1:name'])
# print(row[b'cf:age'])


# 显示所有列族
print('所有列族', table.families(), '\n')

# 输出两列
print('print two rows:')
rows = table.rows([b'1234', b'20181013'])
for key, data in rows:
    print(key, data)

# 字典输出两列
print('\n', 'print two dict rows')
rows_as_dict = dict(table.rows([b'1234', b'20181013']))
print(rows_as_dict)

# 输入row的一个列族所有值
row = table.row(b'1234', columns=[b'cf1'])
print('\n', '输出一个列族', row)

# scan操作
print('\n', 'do scan')
for key, data in table.scan():
    print(key, data)

print('==='*30)
# print([x for x in table.scan(row_start='111',row_stop='555')])
print([x for x in table.scan(row_prefix=b'123')])
#put
#该表已有column familylz，列id和realValue
# student ={"cf1:id":'test',"cf1:age":"18"}
# table.put(row="123456",data = student)

# 删除
# table.delete('123456')
# 指定删除
# table.delete(row='123456',columns=["cf1:id"])


# --------------------批量处理---------------------
# batch方法：

student111 = {"cf1:name":"xiaohuang","cf1:zipcode":"222222"}
student222 = {"cf1:name":"xiaolv","cf1:zipcode":"333333"}

t = connection.table('python')
bat = t.batch()

#添加student111和student222，也可以进行批量删除
bat.put('111',data = student111)
bat.put('222',data = student222)
# bat.delete('111')
bat.send()

# 使用with管理批量
# student333 = {"cf1:name":"xiaolan","cf1:zipcode":"323232"}
#添加student333并删除student222
# with t.batch() as bat:
#     bat.put('333',data = student333)
#     bat.delete('111')

# 查询指定cell的数据
print(table.cells('222','cf1:name',include_timestamp=True))


# 过滤器
# row_start、row_stop：起始和终止rowkey，查询两rowkey间的数据
# row_prefix：rowkey前缀。注：使用row_prefix的时候，row_start和row_stop不能使用
# filter：要使用的过滤器(hbase 0.92版本及以上生效)
# timestamp：按指定时间戳查询
# reverse：默认为False。为True时，scan结果按rowkey倒序排列

# scan(self, row_start=None, row_stop=None, row_prefix=None,
#              columns=None, filter=None, timestamp=None,
#              include_timestamp=False, batch_size=1000, scan_batching=None,
#              limit=None, sorted_columns=False, reverse=False)
```

## 题目

##### 1、人员-角色

人员有多个角色  角色优先级

角色有多个人员

人员 删除添加角色

角色 可以添加删除人员

人员 角色 删除添加



小明  	学习委员 > 体育委员  > 组长

小红    	班长 >	课代表	> 	组长

组长 小红 小明

```
表：
	人员表：
		rowkey		cf1 人员信息		cf2 角色优先级
		pid			cf1:name=...		cf2:rid=N(数字越大，优先级越高)
		
		001			cf1:name=小明		   cf2:03=8(学习委员)，cf2:04=6(体育委员)，cf2:05=5(组长)...
		002			cf1:name=小红		   cf2:01=9(班长)，cf2:02=7(课代表),cf2:05=5(组长)
	
	角色表：
		rowkey		cf1 角色			  cf2 人员id
		rid			cf1:name=...		cf2:pid=...
		
		01			cf1:班长			  cf2:pid=002
		02			cf1:课代表			 cf2:pid=002
		03			cf1:学习委员		cf2:pid=001
		04			cf1:体育委员		cf2:pid=001
		05			cf1:组长			  cf2:pid01=001,cf2:pid02=002
```

##### 2、组织架构  部门-子部门

查询  顶级部门

查询  每个部门的所有子部门

部门  添加、删除子部门

部门  添加、删除

```
部门表：
    rowkey		cf1:部门					cf2:cn=子部门
    0/1_id		cf1:name=...				cf2:cn=...

    0_001			cf1:name=董事				 cf2:cn1=开发部，cf2:cn2=算发部，cf2:cn3=产品部
    1_001			cf1:name=开发部			cf2:cn1=前端，cf2:cn2=后台，cf2:cn3=测试
    1_002			cf1:name=算法部
    1_003			cf1:name=产品部
    2_001			cf1:name=前端
    2_002			cf1:name=后台
    2_003			cf1:name=测试

    0	顶级部门
    1	1级部门
    2	2级部门
```

##### 3、微博

添加、查看关注

粉丝列表

写微博

查看首页、所有关注过的好友发布的最新微博

查看某个用户发布的所有微博  降序排序

```
用户关系表 user-relations	
	rowkey		cf1(用户信息)    			    cf2(关注 粉丝信息)						
	uid		    cf1:name=...,	  	    cf2:fid=...,cf2:gid=...
										
微博内容表 blog
	rowkey 					   cf1（微博内容）

   uid_max-time     	   			content=...  
     
消息表
	rowkey 				cf1

	uid              cf1:sq=uid_max-time   (v=n,最大的版本数)
	
	
------------------------------------------------------------

用户关系表
	rowkey            cf1                       
	uid             cf1:name=...,cf1:gid=...,cf1:fid=...
 
 
微博表：和上面的uid对应                     
   rowkey     			       cf1
 uid_max-time                具体内容



================================================================
大家整理：
用户关系表
	rowkey               cf1                                   cf2
uid_max-time         cf1:gid=...,cf1:fid=...                 具体内容
 
=================================================================

J：
关系表
  rowkey		cf1							
   uid		 cf1:gid=..,cf1:fid=..		 
   
微博表：
   rowkey		      			cf1	
 wid:uid_max-time			cf1:context=...
	 
收取微博表：
   rowkey		      	cf1	
    uid					wid(maxversion=5):gid
  
=================================================================
	
```

## 高表和宽表

[详情](https://yq.aliyun.com/articles/213705)

hbase中的宽表是指很多列较少行，即列多行少的表，一行中的数据量较大，行数少；高表是指很多行较少列，即行多列少，一行中的数据量较少，行数大 

hbase的row key是分布式的索引，也是分片的依据。 

##### 高表的优劣

- 查询性能：高表更好，因为查询条件都在row key中, 是全局分布式索引的一部分。高表一行中的数据较少。所以**查询缓存BlockCache能缓存更多的行**，以行数为单位的吞吐量会更高。
- 分片能力：**高表分片粒度更细，各个分片的大小更均衡**。因为高表一行的数据较少，宽表一行的数据较多。HBase按行来分片。
- 元数据开销：**高表元数据开销更大**。高表行多，row key多，可能造成region数量也多，- root -、 .meta表数据量更大。过大的元数据开销，可能引起HBase集群的不稳定、master更大的负担（这方面后续再好好总结）。
- 事务能力：**宽表事务性更好**。HBase对一行的写入（Put）是有事务原子性的，一行的所有列要么全部写入成功，要么全部没有写入。但是多行的更新之间没有事务性保证。
- 数据压缩比：如果我们对一行内的数据进行压缩，**宽表能获得更高的压缩比**。因为宽表中，一行的数据量较大，往往存在更多相似的二进制字节，有利于提高压缩比。通过压缩，缓解了宽表一行数据量太大，并导致分片大小不均匀的问题。查询时，我们根据row key找到压缩后的数据，进行解压缩。而且解压缩可以通过协处理器（coproesssor）在HBase服务器上做，而不是在业务应用的服务器上做，以充分应用HBase集群的CPU能力。

设计表时，可以不绝对追求高表、宽表，而是在两者之间做好**平衡**。根据查询模式，需要分布式索引、分片、**有很高选择度**（即能据此查询条件迅速锁定很小范围的一些行）的查询用字段，应该放入row key；能够均匀地划分数据字节数的字段，也应该放入row key，作为分片的依据。选择度较低，并且不需要作为分片依据的查询用字段，放入column family和column qualifier，不放入row key。

 

## HBase预分区

创建HBase表的时候默认一张表只有一个region，所有的put操作都会往这一个region中填充数据，当这个一个region过大时就会进行split。如果在创建HBase的时候就进行预分区则会减少当**数据量猛增**时由于region split带来的资源消耗。

HBase表的预分区需要**紧密结合业务场景**来选择分区的key值，每个region都有一个startKey和一个endKey来表示该region存储的rowKey范围。

```
创建包含预分区表的命令如下：
> create 't1', 'cf1', SPLITS => ['00101', '00120', '00130'] 

或者 

> create 't2', 'cf1', SPLITS_FILE => '/home/hadoop/splitfile.txt' /home/hadoop/splitfile.txt中存储内容如下： 
00101
00120
00130
```

该语句会创建4个region：

![HBase预分区](.\img\HBase预分区.png)

这样做的好处就是，再传入数据的时候，可以动态的为数据根据rowkey插入到对应的region中

## HBase优化

##### 1、创建预分区

默认情况下，在创建HBase表的时候会自动创建一个region分区，当导入数据的时候，所有的HBase客户端都向这一个region写数据，直到这个region足够大了才进行切分。一种可以加快批量写入速度的方法是通过预先创建一些空的regions，这样当数据写入HBase时，会按照region分区情况，在集群内做数据的负载均衡。 

##### 2、RowKey

HBase中row key用来检索表中的记录，支持以下三种方式：

·        通过单个row key访问：即按照某个row key键值进行get操作；

·        通过row key的range进行scan：即通过设置startRowKey和endRowKey，在这个范围内进行扫描；

·        全表扫描：即直接扫描整张表中所有行记录。

在HBase中，**row key可以是任意字符串，最大长度64KB**，实际应用中一般为10~100bytes，存为byte[]字节数组，**一般设计成定长的**。

row key是按照**字典顺序**存储，因此，设计row key时，要充分利用这个排序特点，将经常一起读取的数据存储到一块，将最近可能会被访问的数据放在一块。

举个例子：如果最近写入HBase表中的数据是最可能被访问的，可以考虑将时间戳作为row key的一部分，由于是字典序排序，所以可以使用Long.MAX_VALUE - timestamp作为row key，这样能保证新写入的数据在读取时可以被快速命中。

Rowkey规则：**保证唯一**

1、 越小越好

2、 Rowkey的设计是要根据实际业务来

3、 散列性

​	a)     取反   001  002  100 200

​	b)    Hash

##### 3、列族（column family）

不要在一张表里定义太多的**column family**。目前Hbase并不能很好的处理超过2~3个column family的表。因为某个column family在flush的时候，它邻近的column family也会因关联效应被触发flush，最终导致系统产生更多的I/O。感兴趣的同学可以对自己的HBase集群进行实际测试，从得到的测试结果数据验证一下。 

##### 4、In Memory

默认关闭

创建表的时候，可以通过  表.setInMemory(true)  将表放到RegionServer的缓存中，保证在读取的时候被cache命中。 

##### 5、Max Version

创建表的时候，可以通过HColumnDescriptor.setMaxVersions(int maxVersions)设置表中数据的最大版本，如果只需要保存最新版本的数据，那么可以设置 setMaxVersions(1)。如果数据量有1G，版本数设为2，这样就会有2个G，在通过Hash副本，这样就会有6G的数据，所以版本数一般设为1。

##### 6、Time To Live

创建表的时候，可以通过  表.setTimeToLive(int timeToLive)设置表中数据的**存储生命期**，过期数据将自动被删除，例如如果只需要存储最近两天的数据，那么可以设置setTimeToLive(2 * 24 * 60 * 60)。 

##### 7、Compact & Split

在HBase中，数据在更新时首先写入WAL 日志(HLog)和内存(MemStore)中，MemStore中的数据是排序的，当MemStore累计到一定阈值时，就会创建一个新的MemStore，并且将老的MemStore添加到flush队列，由单独的线程flush到磁盘上，成为一个StoreFile。于此同时， 系统会在zookeeper中记录一个redo point，表示这个时刻之前的变更已经持久化了**(minor compact)**。

StoreFile是只读的，一旦创建后就不可以再修改。因此Hbase的更新其实是不断追加的操作。当一个Store中的StoreFile达到一定的阈值后，就会进行一次合并**(major compact)**，将对同一个key的修改合并到一起，形成一个大的StoreFile，当StoreFile的大小达到一定阈值后，又会对 StoreFile进行分割**(split)**，等分为两个StoreFile。

由于对表的更新是不断追加的，处理读请求时，需要访问Store中全部的StoreFile和MemStore，将它们按照row key进行合并，由于StoreFile和MemStore都是经过排序的，并且StoreFile带有内存中索引，通常合并过程还是比较快的。

实际应用中，可以考虑必要时手动进行major compact，将同一个row key的修改进行合并形成一个大的StoreFile。同时，可以将StoreFile设置大些，减少split的发生。



hbase为了防止小文件（被刷到磁盘的menstore）过多，以保证保证查询效率，hbase需要在必要的时候将这些小的store file合并成相对较大的store file，这个过程就称之为compaction。在hbase中，主要存在两种类型的compaction：**minor  compaction**和**major compaction**。

**minor compaction:的是较小、很少文件的合并。**

**major compaction 的功能是将所有的store file合并成一个**，触发major compaction的可能条件有：major_compact 命令、majorCompact() API、region server自动运行（相关参数：hbase.hregion.majoucompaction 默认为24 小时、hbase.hregion.majorcompaction.jetter 默认值为0.2 防止region server 在同一时间进行major compaction）。

hbase.hregion.majorcompaction.jetter参数的作用是：对参数hbase.hregion.majoucompaction 规定的值起到浮动的作用，假如两个参数都为默认值24和0.2，那么major compact最终使用的数值为：19.2	(24-24*0.2)    ~28.8	(24+24\*0.2) 这个范围。



1、 关闭自动major compaction

2、 手动编程major compaction

Timer类，contab

minor compaction的运行机制要复杂一些，它由一下几个参数共同决定：

hbase.hstore.compaction.min :默认值为 3，表示至少需要三个满足条件的store file时，minor compaction才会启动

hbase.hstore.compaction.max 默认值为10，表示一次minor compaction中最多选取10个store file

hbase.hstore.compaction.min.size 表示文件大小小于该值的store file 一定会加入到minor compaction的store file中

hbase.hstore.compaction.max.size 表示文件大小大于该值的store file 一定会被minor compaction排除

hbase.hstore.compaction.ratio 将store file 按照文件年龄排序（older to younger），minor compaction总是从older store file开始选择

##### 8、写表的操作

###### 1、 多HTable并发写

创建多个HTable客户端用于写操作，提高写数据的吞吐量

###### 2、 HTable参数设置

1、 Auto Flush

通过调用	 表.setAutoFlush(false)方法可以将HTable写客户端的自动flush关闭，这样可以批量写入数据到HBase，而不是有一条put就执行一次更新，只有当put填满客户端写缓存时，才实际向HBase服务端发起写请求。默认情况下auto flush是开启的。

2、 Write Buffer

通过调用  表.setWriteBufferSize(writeBufferSize)方法可以设置HTable客户端的写buffer大小，如果新设置的buffer小于当前写buffer中的数据时，buffer将会被flush到服务端。其中，writeBufferSize的单位是byte字节数，可以根据实际写入数据量的多少来设置该值。

3、 WAL Flag

在HBae中，客户端向集群中的RegionServer提交数据时（Put/Delete操作，查找不操作日志文件），首先会先写WAL（Write Ahead Log）日志（即HLog，一个RegionServer上的所有Region共享一个HLog），只有当WAL日志写成功后，再接着写MemStore，然后客户端被通知提交数据成功；如果写WAL日志失败，客户端则被通知提交失败。这样做的好处是可以做到RegionServer宕机后的数据恢复。

因此，对于相对不太重要的数据，可以在Put/Delete操作时，通过调用  表.setWriteToWAL(false)或  表.setWriteToWAL(false)函数，放弃写WAL日志，从而提高数据写入的性能。

值得注意的是：谨慎选择关闭**WAL**日志，因为这样的话，一旦**RegionServer**宕机，**Put/Delete**的数据将会无法根据**WAL**日志进行恢复。一般在操作重要的数据的时候都开启日志文件。不重要的就没必要开启了。

###### 3、 批量写

通过调用  表.put(Put)方法可以将一个指定的row key记录写入HBase，同样HBase提供了另一个方法：通过调用  表.put(List\<Put>)方法可以将指定的row key列表，批量写入多行记录，这样做的好处是批量执行，只需要一次网络I/O开销，这对于对数据实时性要求高，网络传输RTT高的情景下可能带来明显的性能提升。

###### 4、 多线程并发写

在客户端开启多个HTable写线程，每个写线程负责一个HTable对象的flush操作，这样结合定时flush和写buffer（writeBufferSize），可以既保证在数据量小的时候，数据可以在较短时间内被flush（如1秒内），同时又保证在数据量大的时候，写buffer一满就及时进行flush。下面给个具体的例子：



##### 9、读表操作

###### 1、多HTable并发读

创建多个HTable客户端用于读操作，提高读数据的吞吐量

###### 2、HTable参数设置 :

1、Scanner Caching

hbase.client.scanner.caching配置项可以设置HBase scanner一次从服务端抓取的数据条数，默认情况下一次一条。通过将其设置成一个合理的值，可以减少scan过程中next()的时间开销，代价是scanner需要通过客户端的内存来维持这些被cache的行记录。

有三个地方可以进行配置：

1）在HBase的conf配置文件中进行配置；

2）通过调用HTable.setScannerCaching(int scannerCaching)进行配置；

3）通过调用Scan.setCaching(int caching)进行配置。  （用的最多）

**三者的优先级越来越高。**

2、 Scan Attribute Selection

scan时指定需要的Column Family，可以减少网络传输数据量，否则默认scan操作会返回整行所有Column Family的数据。

3、 Close ResultScanner

通过scan取完数据后，记得要**关闭ResultScanner**，否则RegionServer可能会出现问题（对应的Server资源无法释放）。

###### 3、批量读

通过调用HTable.get(Get)方法可以根据一个指定的row key获取一行记录，同样HBase提供了另一个方法：通过调用HTable.get(List\<Get\>)方法可以根据一个指定的row key列表，批量获取多行记录，这样做的好处是批量执行，只需要一次网络I/O开销，这对于对数据实时性要求高而且网络传输RTT高的情景下可能带来明显的性能提升。

5、 多线程并发读

在客户端开启多个HTable读线程，每个读线程负责通过HTable对象进行get操作。下面是一个多线程并发读取HBase，获取店铺一天内各分钟PV值的例子：

###### 4、 缓存查询结果

对于频繁查询HBase的应用场景，可以考虑在应用程序中做缓存，当有新的查询请求时，首先在缓存中查找，如果存在则直接返回，不再查询HBase；否则对HBase发起读请求查询，然后在应用程序中将查询结果缓存起来。至于缓存的替换策略，可以考虑LRU等常用的策略。

###### 5、 Blockcache

HBase上Regionserver的内存分为两个部分，一部分作为Memstore，主要用来写；另外一部分作为BlockCache，主要用于读。

写请求会先写入Memstore，Regionserver会给每个region提供一个Memstore，当Memstore满64MB以后，会启动 flush刷新到磁盘。当Memstore的总大小超过限制时（heapsize * hbase.regionserver.global.memstore.upperLimit * 0.9），会强行启动flush进程，从最大的Memstore开始flush直到低于限制。

读请求先到Memstore中查数据，查不到就到BlockCache中查，再查不到就会到磁盘上读，并把读的结果放入BlockCache。由于BlockCache采用的是LRU策略，因此BlockCache达到上限(heapsize * hfile.block.cache.size * 0.85)后，会启动淘汰机制，淘汰掉最老的一批数据。

一个Regionserver上有一个BlockCache和N个Memstore，它们的大小之和不能大于等于heapsize * 0.8，否则HBase不能启动。默认BlockCache为0.2，而Memstore为0.4。对于注重读响应时间的系统，可以将**BlockCache**设大些，比如设置**BlockCache=0.4**，**Memstore=0.39**，以加大缓存的命中率。



