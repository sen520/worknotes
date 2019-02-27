# spark(使用前必须安装JDK)

## spark和Hadoop

Spark 拥有Hadoop MapReduce 所具有的优点；但不同于 MapReduce 的是 Job 中间输出结果可以保存在内存中，从而不再需要读写 HDFS。

Hadoop：额外的复制，序列化和磁盘IO开销

spark

基于内存和 DAG（有向无环图）
	都是分布式计算框架，Spark 基于内存，MR 基于 HDFS。Spark 处理数据的能力一般是 MR 的十倍以上，Spark 中除了基于内存计算外，还有 DAG 有向无环图来切分任务的执行先后顺序



## 运行模式

**local**

​	多用于本地测试，如在 eclipse，idea 中写程序测试等。

**Standalone**

​	Standalone 是 Spark 自带的一个资源调度框架，它支持完全分布式。

**Yarn**

​	Hadoop 生态圈里面的一个资源调度框架，Spark 也是可以基于 Yarn来计算的。

​	要基于 Yarn 来进行资源调度，必须实现 AppalicationMaster 接口，Spark 实现了这个接口，所以可以基于 Yarn。



## SparkCore

#### RDD

(Resilient Distributed Dateset)弹性分布式数据集。

###### RDD五大特性

1. RDD 是由一系列的 partition 组成的。
2. 函数是作用在每一个 partition（split）上的。
3. RDD 之间有一系列的依赖关系。
4. 分区器是作用在 K,V 格式的 RDD 上。(并行度)
5. RDD 提供一系列最佳的计算位置。

![RDD理解](.\img\RDD理解.png)



注意：
		1、textFile 方法底层封装的是读取 MR 读取文件的方式，读取文件之前先 split，切分成一个个block，然后映射成RDD，默认 split 大小是一个 block 大小。

​	2、RDD 实际上不存储数据，只是业务逻辑，数据存储在内存partition中。

​	3、什么是 K,V 格式的 RDD?
			如果 RDD 里面存储的数据都是二元组对象，那么这个 RDD 我们就叫做 K,V 格式的 RDD。

​	4、哪里体现 RDD 的弹性（容错）？
			partition 数量，大小没有限制，体现了 RDD 的弹性。
			RDD 之间依赖关系，可以基于上一个 RDD 重新计算出 RDD。

​		如果程序在运行过程中中断，就在这一阶段起点重新运行。

​	5、哪里体现 RDD 的分布式？

​		RDD 是由 Partition 组成，partition 是分布在不同节点上的。

​		RDD 提供计算最佳位置，体现了数据本地化。体现了大数据中“计算移动数据不移动”的理念。

#### Spark 代码流程

1. 创建 SparkConf 对象
  ➢ 可以设置 Application name。
  ➢ 可以设置运行模式及资源需求。
2. 创建 SparkContext 对象
3. 基于 Spark 的上下文创建一个 RDD，对 RDD 进行处理。
4. 应用程序中要有 Action 类算子来触发 Transformation 类算子执行。
5. 关闭 Spark 上下文对象 SparkContext。

```python
"""
@File  : pysparkwordcount.py
@Author: sen
@Date  : 2018/7/24 19:16
@Software  : PyCharm
"""
from pyspark import SparkContext
from pyspark import SparkConf

# 程序的入口  一个SparkContext代表一个drive == 一个job任务
# conf = SparkConf().setAppName('wordcount').setMaster('local[*]') 有多少机器跑
conf = SparkConf().setAppName('wordcount').setMaster('local')
sc = SparkContext(conf=conf)

data = ['hello I want a apple', 'Do you have one', 'yes I have a apple']

# 将数据集转换成RDD，让spark来处理
datardd = sc.parallelize(data)
# result = datardd.map(lambda x:x).collect()
# result = datardd.map(lambda x:x.split(' ')).collect()
# result = datardd.flatMap(lambda x:x).collect()
# flatMap = flat + Map
# flatMap：先map后  再Flat扁平化处理==>返回一个新的 RDD

# result = datardd.flatMap(lambda x:x.split(' ')).collect()
# result = datardd.flatMap(lambda x:x.split(' ')).map(lambda w:(w,1)).collect()
words = datardd.flatMap(lambda x: x.split(' ')).map(lambda w: (w, 1))
# result = words.reduceByKey(lambda a,b:a+b).collect()

# print(result)


def f(x):
    print(x)


words.reduceByKey(lambda a, b: a + b).foreach(f)

```



#### Transformations 转换算子

Transformations 类算子是一类算子（函数）叫做转换算子，如map,flatMap,reduceByKey 等。ransformations 算子是延迟执行，也叫懒加载执行。

➢ map
		将一个 RDD 中的每个数据项，通过 map 中的函数映射变为一个新的元素。
		特点：输入一条，输出一条数据。
	➢ flatMap
		先 map 后 flat。与 map 类似，每个输入项可以映射为 0 到多个输出项。
	➢ reduceByKey
		将相同的 Key 根据相应的逻辑进行处理。
	➢ sortby
	➢ sortByKey
		作用在 K,V 格式的 RDD 上，对 key 进行升序或者降序排序。

```
"""
@File  : wordcount.py
@Author: sen
@Date  : 2018/7/24 21:55
@Software  : PyCharm
"""

from pyspark import SparkContext,SparkConf

conf = SparkConf().setAppName('counts').setMaster('local')
sc = SparkContext(conf=conf)


file = sc.textFile('./word')
result = file.flatMap(lambda x:x.split()).map(lambda w:(w,1)).reduceByKey(lambda a,b:a+b)
# print(result.collect())

sorted_result = result.map(lambda pairs:(pairs[1],pairs[0])).sortByKey(ascending=False).map(lambda pairs:(pairs[1],pairs[0]))
print(sorted_result.collect(),end='\n')

# f1 = file.count()
# print(f1)

```

#### Action 行动算子

◆ 概念：
		Action 类算子也是一类算子（函数）叫做行动算子，如foreach,collect，count 等。Transformations 类算子是延迟执行，Action 类算子是触发执行。一个 application 应用程序中有几个Action 类算子执行，就有几个 job 运行。
	◆ Action 类算子
		➢ collect
			将计算结果回收到 Driver 端。
		➢ foreach
			可以循环迭代取出各节点服务器上的内容



#### Spark 任务执行原理

![spark执行任务原理](.\img\spark执行任务原理.png)

以上图中有四个机器节点，Driver 和 Worker 是启动在节点上的进程，运行在 JVM 中的进程。
	➢ Driver 与集群节点之间有频繁的通信。
	➢ Driver 负责任务(tasks)的分发和结果的回收。任务的调度。如果 task的计算结果非常大就不要回收了。会造成 oom 。
	➢ Worker 是 Standalone 资源调度框架里面资源管理的从节点。也是JVM 进程。
	➢ Master  是 Standalone 资源调度框架里面资源管理的主节点。也是JVM 进程。

#### Spark 缓存策略

```
StorageLevel.DISK_ONLY = StorageLevel(True, False, False, False)
StorageLevel.DISK_ONLY_2 = StorageLevel(True, False, False, False, 2)
StorageLevel.MEMORY_ONLY = StorageLevel(False, True, False, True)
StorageLevel.MEMORY_ONLY_2 = StorageLevel(False, True, False, True, 2)
StorageLevel.MEMORY_ONLY_SER = StorageLevel(False, True, False, False)
StorageLevel.MEMORY_ONLY_SER_2 = StorageLevel(False, True, False, False, 2)
StorageLevel.MEMORY_AND_DISK = StorageLevel(True, True, False, True)
StorageLevel.MEMORY_AND_DISK_2 = StorageLevel(True, True, False, True, 2)
StorageLevel.MEMORY_AND_DISK_SER = StorageLevel(True, True, False, False)
StorageLevel.MEMORY_AND_DISK_SER_2 = StorageLevel(True, True, False, False, 2)
StorageLevel.OFF_HEAP = StorageLevel(False, False, True, False, 1)
```



#### 环境搭建

tar -zxvf spark-1.6.0-bin-hadoop2.4.tgz.gz 

mv spark-1.6.0-bin-hadoop2.4 spark-1.6.0

cd spark-1.6.0/conf

vim slaves.template 

```
hadoop02
hadoop03
```

mv spark-env.sh.template spark-env.sh

vim spark-env.sh 

```
export SPARK_MASTER_IP=hadoop01  # 主机
export SPARK_MASTER_PORT=7077	# 端口号
export SPARK_WORKER_CORES=2		# 核心数
export SPARK_WORKER_MEMORY=1g	# 内存
```

scp -r spark-1.6.0 hadoop02:/home/

scp -r spark-1.6.0 hadoop03:/home/

cd /home/spark-1.6.0/sbin

执行：./start-all.sh 

http://hadoop01:8080/

http://hadoop02:8088/cluster

##### 更改端口号

1、cd  /home/spark-1.6.0/sbin

vim start-master.sh

端口号：  SPARK_MASTER_WEBUI_PORT=8080



2、export  'SPARK_MASTER_WEBUI_PORT=9999'

查看端口号

echo $SPARK_MASTER_WEBUI_PORT

##### 配置yarn

cd /home/spark-1.6.0/conf

vim spark-env.sh

```
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
```

 scp spark-env.sh hadoop02:/home/spark-1.6.0/conf/

 scp spark-env.sh hadoop03:/home/spark-1.6.0/conf/

启动

zkServer.sh start

start-all.sh 

hadoop02,03:

​	yarn-daemon.sh start resourcemanager

#### 案例

cd /home/spark-1.6.0/examples/src/main/python/

vim pi.py

![pi案例](.\img\pi案例.png)

原理：

​	半径为1是，圆的面积为pi，正方形的面积为4，圆的面积为正方形面积减去四周

​	圆的面积  =（落在圆内的点/正方形的点）*4

```python
from __future__ import print_function

import sys
from random import random
from operator import add

from pyspark import SparkContext


if __name__ == "__main__":
    """
        Usage: pi [partitions]
    """
    sc = SparkContext(appName="PythonPi")
    partitions = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    n = 100000 * partitions   # 循环迭代的次数

    def f(_):
        x = random() * 2 - 1
        y = random() * 2 - 1
        return 1 if x ** 2 + y ** 2 < 1 else 0

    count = sc.parallelize(range(1, n + 1), partitions).map(f).reduce(add)
    print("Pi is roughly %f" % (4.0 * count / n))

    sc.stop()

```

cd /home/spark-1.6.0/bin/

java 启动

```
./spark-submit --master yarn --class org.apache.spark.examples.SparkPi ../lib/spark-examples-1.6.0-hadoop2.4.0.jar 10000  （10000为task,任务调度数）
```

python启动：数值小一点

```
./spark-submit --master yarn /home/spark-1.6.0/examples/src/main/python/pi.py 500（1g不够）
```

#### 附

wordcount 写入内存和磁盘的对比

1、获取文件

```python
"""
@File  : get_word.py
@Author: sen
@Date  : 2018/7/25 9:13
@Software  : PyCharm
"""
import requests
from lxml import etree

url = 'https://danci.911cha.com/book_71.html'
headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.26 Safari/537.36 Core/1.63.5702.400 QQBrowser/10.2.1893.400'
}
response = requests.get(url=url,headers=headers)
html = etree.HTML(response.text)
words = html.xpath('//div[@class="mcon f14"]/ul/li/a/text()')
with open('./word.txt','a') as f:
    for i in range(0,100000):  # 此处遍历10万次，保证数据足够大
        print('第%d次写入'%i)
        for word in words:
                f.write('\n'+word)
```

2、执行文件，由于数据文件比较大，所以等待时间比较长

```python
"""
@File  : cache.py
@Author: sen
@Date  : 2018/7/25 8:56
@Software  : PyCharm
"""
from pyspark import SparkContext, SparkConf, StorageLevel
import datetime

conf = SparkConf().setAppName('vv').setMaster('local[2]')
sc = SparkContext(conf=conf)

files = sc.textFile('./word.txt')
# files.cache() # 加载到缓存，由于是懒加载，不会有数据
# files.count() # 基于磁盘后，加载到缓存
# files.count() # 基于内存

# cache是懒加载
files1 = files.persist(storageLevel=StorageLevel.MEMORY_ONLY)
start = datetime.datetime.now()
count1 = files1.count() # files1中实际没有数据，基于磁盘，并加载到内存
end1 = datetime.datetime.now()
print('到磁盘中，count1 ==> Time:',(end1-start).microseconds)
print('='*50)
start2 = datetime.datetime.now()
count2 = files1.count() # 基于内存
end2 = datetime.datetime.now()
print('Cache到内存中，count2==>Time:',(end2-start2).microseconds)
```

结果

```
到磁盘中，count1 ==> Time: 798998
Cache到内存中，count2==>Time: 415787
```

## Standalone 模式两种提交任务方式

#### Standalone--client提交任务方式

###### 提交命令

cd /home/spark-1.6.0/sbin/

./start-all.sh 

```
./spark-submit --master spark://hadoop01:7077 ../examples/src/main/python/pi.py 10
```

![Standalone-client执行原理](.\img\Standalone-client执行原理.png)

 执行流程

1. client 模式提交任务后，会在客户端启动 Driver 进程，进行任务调度（选择在本地或者集群上运行任务）。

   在本地提交sparkcontext和数据，之后在spark集群上运行，通过client收集数据到driver上

2. Driver 会向 Master 申请启动 Application 启动的资源。

3. 资源申请成功，Driver 端将 task 发送到 有资源的worker 端执行（触发action）。

4. worker 将 task 执行情况和结果返回到 Driver 端。

总结：

client 模式适用于测试调试程序。Driver 进程是在客户端启动的，这里的客户端就是指**提交应用程序的当前节点**。在 Driver 端可以看到 task 执行的情况。生产环境下不能使用 client 模式，是因为：假设要提交 100 application 到集群运行，Driver 每次都会在 client 端启动，那么就会导致客户端 100 次网络IO暴增的问题

#### Standalone-cluster 提交任务方式(#)

```
./spark-submit --master spark://hadoop01:7077 --deploy-mode cluster --class org.apache.spark.examples.SparkPi ../lib/spark-examples-1.6.0-hadoop2.4.0.jar 100
```

http://hadoop01:8080/ 可以查看

![Standalone-cluster执行原理](.\img\Standalone-cluster执行原理.png)

执行流程

1. cluster 模式提交应用程序后，会向 Master 请求启动 Driver.
2. Master 接受请求，随机在集群**一台**节点启动 Driver 进程。
3. Driver 启动后为当前的应用程序申请资源。
4. Driver 端发送 task 到 worker 节点上执行。
5. worker 将执行情况和执行结果返回给 Driver 端。
   总结:

Driver 进程是在集群某一台 Worker 上启动的，在客户端是无法查看 task的执行情况的。假设要提交 100 个 application 到集群运行,每次 Driver 会随机在集群中某一台 Worker 上启动，那么这 100 次网卡流量暴增的问题就散布在集群上



## Yarn 模式两种提交任务方式

####  yarn-client 提交任务方式

```
./spark-submit
--master yarn
--class org.apache.spark.examples.SparkPi ../lib/spark-examples-1.6.0-
hadoop2.6.0.jar
100


./spark-submit
--master yarn–client
--class org.apache.spark.examples.SparkPi ../lib/spark-examples-1.6.0-
hadoop2.6.0.jar
100


./spark-submit
--master yarn
--deploy-mode client
--class org.apache.spark.examples.SparkPi ../lib/spark-examples-1.6.0-
hadoop2.6.0.jar
100
```

![yarn-client模式任务流程](.\img\yarn-client模式任务流程.png)

执行流程

1. 客户端提交一个 Application，在客户端启动一个 Driver 进程。
2. 应用程序启动后会向 RS(ResourceManager)发送请求，启动AM(ApplicationMaster)的资源。
3. RS 收到请求，随机选择一台 NM(NodeManager)启动 AM。这里的 NM 相当于 Standalone 中的 Worker 节点。
4. AM 启动后，会向 RS 请求一批 container 资源，用于启动Executor.
5. RS 会找到一批 NM 返回给 AM,用于启动 Executor。
6. AM 会向 NM 发送命令启动 Executor。
7. Executor 启动后，会反向注册给 Driver，Driver 发送 task 到Executor,执行情况和结果返回给 Driver 端。



➢ 总结

​	Yarn-client 模式同样是适用于测试，因为 Driver 运行在本地，Driver 会与 yarn 集群中的 Executor 进行大量的通信，会造成客户机网卡流量的大量增加.

ApplicationMaster 的作用：

1. 为当前的 Application 申请资源
2. 给 NameNode 发送消息启动 Executor。
  注意：ApplicationMaster 有 launchExecutor 和申请资源的功能，并没有作业调度的功能

#### yarn-cluster 提交任务方式

```
./spark-submit
--master yarn
--deploy-mode cluster
--class org.apache.spark.examples.SparkPi ../lib/spark-examples-1.6.0-
hadoop2.6.0.jar
100


./spark-submit
--master yarn-cluster
--class org.apache.spark.examples.SparkPi ../lib/spark-examples-1.6.0-
hadoop2.6.0.jar
100

```

![yarn-cluster模式任务流程](.\img\yarn-cluster模式任务流程.png)

执行流程

1. 客户机提交 Application 应用程序，发送请求到RS(ResourceManager),请求启动AM(ApplicationMaster)。
2. RS 收到请求后随机在一台 NM(NodeManager)上启动 AM（相当于 Driver 端）。
3. AM 启动，AM 发送请求到 RS，请求一批 container 用于启动Executor。
4. RS 返回一批 NM 节点给 AM。
5. AM 连接到 NM,发送请求到 NM 启动 Executor。
6. Executor 反向注册到 AM 所在的节点的 Driver。Driver 发送task 到 Executor。

➢ 总结

Yarn-Cluster 主要用于生产环境中，因为 Driver 运行在 Yarn 集群中某一台 nodeManager 中，每次提交任务的 Driver 所在的机器都是随机的，不会产生某一台机器网卡流量激增的现象

缺点是任务提交后不能看到日志。只能通过 yarn 查看日志。



 ApplicationMaster 的作用：

为当前的 Application 申请资源

给 NameNode 发送消息启动 Excutor。

任务调度。

 停止集群任务命令：yarn application -kill applicationID

## 补充部分算子

transformation
		➢ join,leftOuterJoin,rightOuterJoin,fullOuterJoin
		作用在 K,V 格式的 RDD 上。根据 K 进行连接，对（K,V）join(K,W)返回（K,(V,W)）
		* join 后的分区数与父 RDD 分区数多的那一个相同。
		➢ union
		合并两个数据集。两个数据集的类型要一致。
		* 返回新的 RDD 的分区数是合并 RDD 分区数的总和。
		➢ intersection
		取两个数据集的交集
		➢ subtract
		取两个数据集的差集
		➢ mapPartition
		map:返回一个 RDD 对 RDD 上的每一个元素进行函数处理
		mapPartition： 与 map 类似，遍历的单位是每个 partition 上的数据，返回一个 RDD
		➢ distinct(map+reduceByKey+map)

action
		➢ foreachPartition 遍历的数据是每个 partition 的数据。

## 广播变量和累加器

#### 广播

![广播](.\img\广播.png)

发送一个list发送到对应的worker上执行，把每个list封装到每个task上，发送到Executor上（只发送一次，是只读的），由BlockManager来管理list，task执行的时候从BlockManager上获取。

➢ 注意事项

​	 能不能将一个 RDD 使用广播变量广播出去？
		不能，因为 RDD 是不存储数据的。可以将 RDD 的结果广播出去。

​	 广播变量只能在 Driver 端定义，不能在 Executor 端定义。

​	 在 Driver 端可以修改广播变量的值，在 Executor 端无法修改广播变量的值

```python
from pyspark import SparkContext,SparkConf
from numpy import array
#
conf=SparkConf().setMaster('local').setAppName('broadcast')  # broadcast 广播变量
sc = SparkContext(conf=conf)

# broadcast_var= sc.broadcast(array([1,2,3,4]))
# print(broadcast_var.value)


# b = sc.broadcast(['python', 0, 1, 2, 3, 4, 5])
# print(b.value)
# #
# # res = sc.parallelize([1,2,4]).filter(lambda x: x in b.value).collect()
# res = sc.parallelize([1, 2]).flatMap(lambda x: b.value).collect()
# print(res)



# pipeline计算模式
# conf = SparkConf().setMaster("local").setAppName("pipeline")
#
# sc = SparkContext(conf=conf)
# rdd = sc.parallelize(array([1, 2, 3, 4]))
#
# rdd1 = rdd.map(lambda x:x)
#
# rdd2 = rdd1.filter(lambda x: x)
#
# print(rdd2.collect())
# sc.stop()
```



#### 累加器

![累加器](.\img\累加器.png)

```python
from pyspark import SparkContext,SparkConf
from numpy import array

# 累加器
num = sc.accumulator(10)

def f(x):
    global num
    num+=x

rdd = sc.parallelize([20,30,40,50])
rdd.foreach(f)
final = num.value
print ("Accumulated value is -> %i" % (final))
```

注意:

​	累加器在 Driver 端定义赋初始值，累加器只能在 Driver 端读取，在 Excutor 端更新

## 术语解释

![术语解释](.\img\术语解释.png)

## 血统

Lineage（血统）

• 利用内存加快数据加载,在众多的其它的 In-Memory 类数据库或 Cache 类系统中也有实现，Spark 的主要区别在于它处理分布式运算环境下的数据容错性（节点实效/数据丢失）问题时采用的方案。为了保证 RDD中数据的鲁棒性，RDD 数据集通过所谓的血统关系(Lineage)记住了它是如何从其它RDD 中演变过来的。

相比其它系统的细颗粒度的内存数据更新级别的备份或者 LOG 机制，RDD 的 Lineage记录的是粗颗粒度的
特定数据转换（Transformation）操作（filter, map, join etc.)行为。当这个 RDD 的部分分区数据丢失时，它可以通过 Lineage 获取足够的信息来重新运算和恢复丢失的数据分区。 这种粗颗粒的数据模型，限制了 Spark 的运用场合，但同时相比细颗粒度的数据模型，也带来了性能的提升。

• RDD 在 Lineage 依赖方面分为两种 Narrow Dependencies 与 Wide Dependencies 用来解决数据容错的高
效性。 Narrow Dependencies 是指父 RDD 的每一个分区最多被一个子 RDD 的分区所用，表现为一个父RDD 的分区对应于一个子 RDD 的分区或多个父 RDD 的分区对应于一个子 RDD 的分区，也就是说一个父RDD 的一个分区不可能对应一个子 RDD 的多个分区。 Wide Dependencies 是指子RDD 的分区依赖于父RDD 的多个分区或所有分区，也就是说存在一个父 RDD 的一个分区对应一个子 RDD的多个分区。对与Wide Dependencies，这种计算的输入和输出在不同的节点上，lineage 方法对与输入节点完好，而输出节点宕机时，通过重新计算，这种情况下，这种方法容错是有效的，否则无效，因为无法重试，需要向上其祖先追溯看是否可以重试（这就是 lineage，血统的意思），Narrow Dependencies对于数据的重算开销要远小于 Wide Dependencies 的数据重算开销。

• 容错

​	在 RDD 计算，通过 checkpoint 进行容错，做 checkpoint 有两种方式，一个是checkpoint data，一个是 logging the updates。用户可以控制采用哪种方式来实现容错，默认是 logging the updates 方式，通过记录跟踪所有生成 RDD 的转换（transformations）也就是记录每个 RDD 的 lineage（血统）来重新计算生成丢失的分区数据。

​	每个 RDD 都会记录自己依赖与哪个或哪些 RDD，万一某个RDD 的某些 partition 挂了，可以通过其它 RDD 并行计算迅速恢复出来

## 窄依赖和宽依赖

RDD 之间有一系列的依赖关系，依赖关系又分为窄依赖和宽依赖。

➢ 窄依赖

父 RDD 和子 RDD partition 之间的关系是一对一的。或者父 RDD 一个 partition 只对应一个子 RDD 的 partition 情况下的父 RDD 和子RDD partition 关系是多对一的。不会有 shuffle 的产生。

➢ 宽依赖

父 RDD 与子 RDD partition 之间的关系是一对多。会有 shuffle 的产生。

![宽窄依赖理解](.\img\宽窄依赖理解.png)

## Stage

Spark 任务会根据 RDD 之间的依赖关系，形成一个 DAG 有向无环图，DAG 会提交给 DAGScheduler，DAGScheduler 会把 DAG 划分相互依赖的多个 stage，划分 stage 的依据就是 RDD 之间的宽窄依赖。遇到宽依赖
就划分 stage,每个 stage 包含一个或多个 task 任务。然后将这些 task 以taskSet 的形式提交给 TaskScheduler 运行。

stage 是由一组并行的 task 组成。

➢ stage 切割规则

​	切割规则：从后往前，遇到宽依赖就切割 stage

![stage切割规则](.\img\stage切割规则.png)

➢ stage 计算模式

​	pipeline 管道计算模式,pipeline 只是一种计算思想，模式。

![stage计算模式](.\img\stage计算模式.png)

 数据一直在管道里面什么时候数据会落地？

​	对 RDD 进行持久化。

​	shuffle write 的时候。

 Stage 的 task 并行度是由 stage 的最后一个 RDD 的分区数来决定的 。

 如何改变 RDD 的分区数？
		例如：reduceByKey(XXX,3),GroupByKey(4)

➢ 测试验证 pipeline 计算模式

```python
conf = SparkConf().setMaster("local").setAppName("pipeline")
sc = SparkContext(conf=conf)
rdd = sc.parallelize(array([1, 2, 3, 4]))
rdd1 = rdd.map(lambda x:x)
rdd2 = rdd1.filter(lambda x: x)
print(rdd2.collect())
sc.stop()
```

## Spark 资源调度和任务调度

![spark资源调度和任务调度](.\img\spark资源调度和任务调度.png)

➢ Spark 资源调度和任务调度的流程：

启动集群后，Worker 节点会向 Master 节点汇报资源情况，Master 掌握了集群资源情况。当 Spark 提交一个 Application 后，根据 RDD 之间的依赖关系将 Application 形成一个 DAG 有向无环图。任务提交后，Spark 会
在 Driver 端创建两个对象：DAGScheduler 和 TaskScheduler，DAGScheduler 是任务调度的高层调度器，是一个对象。DAGScheduler的主要作用就是将 DAG 根据 RDD 之间的宽窄依赖关系划分为一个个的Stage，然后将这些 Stage 以 TaskSet 的形式提交给 TaskScheduler（TaskScheduler 是任务调度的低层调度器，这里 TaskSet 其实就是一个集合，里面封装的就是一个个的 task 任务,也就是 stage 中的并行度 task任务），TaskSchedule 会遍历 TaskSet 集合，拿到每个 task 后会将 task发送到计算节点 Executor 中去执行（其实就是发送到 Executor 中的线程池 ThreadPool 去执行）。task 在 Executor 线程池中的运行情况会向TaskScheduler 反馈，当 task 执行失败时，则由 TaskScheduler 负责重试，将 task 重新发送给 Executor 去执行，默认重试 3 次。如果重试 3 次依然
失败，那么这个 task 所在的 stage 就失败了。stage 失败了则由DAGScheduler 来负责重试，重新发送 TaskSet 到 TaskSchdeuler，Stage 默认重试 4 次。如果重试 4 次以后依然失败，那么这个 job 就失败
了。job 失败了，Application 就失败了。
TaskScheduler 不仅能重试失败的 task,还会重试 straggling（落后，缓慢）task（也就是执行速度比其他 task 慢太多的 task）。如果有运行缓慢的task 那么 TaskScheduler 会启动一个新的 task 来与这个运行缓慢的 task执行相同的处理逻辑。两个 task 哪个先执行完，就以哪个 task 的执行结果为准。这就是 Spark 的推测执行机制。在 Spark 中推测执行默认是关闭的。
推测执行可以通过 spark.speculation 属性来配置。
	注意：
		 对于 ETL 类型要入数据库的业务要关闭推测执行机制，这样就不会有重复的数据入库。
		 如果遇到数据倾斜的情况，开启推测执行则有可能导致一直会有task 重新启动处理相同的逻辑，任务可能一直处于处理不完的状态。![Spark 资源调度和任务调度的流程](.\img\Spark 资源调度和任务调度的流程.png)

➢ 粗粒度资源申请和细粒度资源申请

 粗粒度资源申请(Spark）

​	在 Application 执行之前，将所有的资源申请完毕，当资源申请成功后，才会进行任务的调度，当所有的 task 执行完成后，才会释放这部分资源。

​	优点：在 Application 执行之前，所有的资源都申请完毕，每一个task 直接使用资源就可以了，不需要 task 在执行前自己去申请资源，task 启动就快了，task 执行快了，stage 执行就快了，job 就快了，application 执行就快了。

缺点：直到最后一个 task 执行完成才会释放资源，集群的资源无法充分利用。

​	 细粒度资源申请（MapReduce）

​		Application 执行之前不需要先去申请资源，而是直接执行，让 job中的每一个 task 在执行前自己去申请资源，task 执行完成就释放资源。
			优点：集群的资源可以充分利用。
			缺点：task 自己去申请资源，task 启动变慢，Application 的运行就相应的变慢了。

## SparkShuffle

#### SparkShuffle 概念

reduceByKey 会将上一个 RDD 中的每一个 key 对应的所有 value 聚合成一个 value，然后生成一个新的 RDD，元素类型是<key,value>对的形式，这样每一个 key 对应一个聚合起来的 value。

问题：聚合之前，每一个 key 对应的 value 不一定都是在一个partition 中，也不太可能在同一个节点上，因为 RDD 是分布式的弹性的数据集，RDD 的 partition 极有可能分布在各个节点上。如何聚合？

– Shuffle Write：上一个 stage 的每个 map task 就必须保证将自己处理的当前分区的数据相同的 key 写入一个分区文件中，可能会写入多个不同的分区文件中。

– Shuffle Read：reduce task 就会从上一个 stage 的所有 task 所在的机器上寻找属于己的那些分区文件，这样就可以保证每一个 key 所对应的 value 都会汇聚到同一个节点上去处理和聚合。

Spark 中有两种 Shuffle 类型，HashShuffle 和 SortShuffle，Spark1.2 之前是 HashShuffle 默认的分区器是 HashPartitioner，Spark1.2 引入 SortShuffle 默认的分区器是 RangePartitioner。

#### HashShuffle

###### 普通机制

➢ 普通机制示意图

![普通机制示意图](.\img\HashShuffle普通机制示意图.png)

➢ 执行流程

a) 每一个 map task 将不同结果写到不同的 buffer 中，每个buffer 的大小为 32K。buffer 起到数据缓存的作用。

b) 每个 buffer 文件最后对应一个磁盘小文件。

c) reduce task 来拉取对应的磁盘小文件。

➢ 总结

① .map task 的计算结果会根据分区器（默认是hashPartitioner）来决定写入到哪一个磁盘小文件中去。
ReduceTask 会去 Map 端拉取相应的磁盘小文件。

② .产生的磁盘小文件的个数：

​	M（map task 的个数）*R（reduce task 的个数）

➢ 存在的问题

​	产生的磁盘小文件过多，会导致以下问题：

​	a) 在 Shuffle Write 过程中会产生很多写磁盘小文件的对象。
	b) 在 Shuffle Read 过程中会产生很多读取磁盘小文件的对象。
	c) 在 JVM 堆内存中对象过多会造成频繁的 gc,gc 还无法解决运行所需要的内存 的话，就会 OOM。
	d) 在数据传输过程中会有频繁的网络通信，频繁的网络通信出现通信故障的可能性大大增加，一旦网络通信出现了故障会导致 shuffle file cannot find 由于这个错误导致的 task 失败，TaskScheduler 不负责重试，由 DAGScheduler 负责重试 Stage。

###### 合并机制

➢ 合并机制示意图

![合并机制示意图](.\img\HashShuffle合并机制示意图.png)

➢ 总结

​	产生磁盘小文件的个数：C(core 的个数)*R（reduce 的个数）

#### SortShuffle

###### 普通机制

➢ 普通机制示意图

![SortShuffle普通机制示意图](.\img\SortShuffle普通机制示意图.png)

➢ 执行流程

a) map task 的计算结果会写入到一个内存数据结构里面，内存数据结构默认是 5M

b) 在 shuffle 的时候会有一个定时器，不定期的去估算这个内存结构的大小，当内存结构中的数据超过 5M 时，比如现在内存结构中的数据为 5.01M，那么他会申请 5.01*2-5=5.02M内存给内存数据结构。

c) 如果申请成功不会进行溢写，如果申请不成功，这时候会发生溢写磁盘。

d) 在溢写之前内存结构中的数据会进行排序分区

e) 然后开始溢写磁盘，写磁盘是以 batch 的形式去写，一个batch 是 1 万条数据，

f) map task 执行完成后，会将这些磁盘小文件合并成一个大的磁盘文件，同时生成一个索引文件。

g) reduce task 去 map 端拉取数据的时候，首先解析索引文件，根据索引文件再去拉取对应的数据。

➢ 总结

​	产生磁盘小文件的个数： 2*M（map task 的个数）

###### bypass 机制

➢ bypass 机制示意图

![bypass 机制示意图](.\img\bypass 机制示意图.png)

➢ 总结

① .bypass 运行机制的触发条件如下：

shuffle reduce task 的数量小于

spark.shuffle.sort.bypassMergeThreshold 的参数值。这个值默认是 200。

② .产生的磁盘小文件为：2*M（map task 的个数）

#### Shuffle 文件寻址

###### MapOutputTracker

MapOutputTracker 是 Spark 架构中的一个模块，是一个主从架构。管理磁盘小文件的地址。

➢ MapOutputTrackerMaster 是主对象，存在于 Driver 中。

➢ MapOutputTrackerWorker 是从对象，存在于 Excutor 中。

###### BlockManager

BlockManager 块管理者，是 Spark 架构中的一个模块，也是一个主从架构。

➢ BlockManagerMaster,主对象，存在于 Driver 中。

BlockManagerMaster 会在集群中有用到广播变量和缓存数据或者删除缓存数据的时候，通知 BlockManagerSlave 传输或者删除数据。

➢ BlockManagerWorker，从对象，存在于 Excutor 中。

BlockManagerWorker 会与 BlockManagerWorker 之间通信。
 无论在 Driver 端的 BlockManager 还是在 Excutor 端的

BlockManager 都含有四个对象：

① DiskStore:负责磁盘的管理。

② MemoryStore：负责内存的管理。

③ ConnectionManager：负责连接其他的BlockManagerWorker。

④ BlockTransferService:负责数据的传输。

###### Shuffle 文件寻址图

![Shuffle 文件寻址图](.\img\Shuffle 文件寻址图.png)

###### Shuffle 文件寻址流程

a) 当 map task 执行完成后，会将 task 的执行情况和磁盘小文件的地址封装到 MpStatus 对象中，通过
MapOutputTrackerWorker 对象向 Driver 中的MapOutputTrackerMaster 汇报。

b) 在所有的 map task 执行完毕后，Driver 中就掌握了所有的磁盘小文件的地址。

c) 在 reduce task 执行之前，会通过 Excutor 中MapOutPutTrackerWorker 向 Driver 端的MapOutputTrackerMaster 获取磁盘小文件的地址。

d) 获取到磁盘小文件的地址后，会通过 BlockManager 中的ConnectionManager 连接数据所在节点上的
ConnectionManager,然后通过 BlockTransferService 进行数据的传输。

e) BlockTransferService 默认启动 5 个 task 去节点拉取数据。默认情况下，5 个 task 拉取数据量不能超过 48M。

