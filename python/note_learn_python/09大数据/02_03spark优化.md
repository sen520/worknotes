#### 1、资源调度

1） 在部署 spark 集群中指定资源分配的默认参数

在 spark 安装包的 conf 下 spark-env.sh

SPARK_WORKER_CORES

SPARK_WORKER_MEMORY

SPARK_WORKER_INSTANCES 每台机器启动 worker 数

2） 在提交 Application 的时候给当前的 Application 分配更多的资源

提交命令选项：（在提交 Application 的时候使用选项）

--executor-cores

--executor-memory

--total-executor-cores

配置信息：（Application 的代码中设置或在 Spark-default.conf 中设置）

spark.executor.cores

spark. executor.memory

spark.max.cores

动态分配资源

spark.shuffle.service.enabled true //启用 External shuffle Service 服务

spark.shuffle.service.port 7337 //Shuffle Service 服务端口，必须和yarn-site 中的一致

spark.dynamicAllocation.enabled true //开启动态资源分配

spark.dynamicAllocation.minExecutors 1 //每个 Application 最小分配的executor 数

spark.dynamicAllocation.maxExecutors 30 //每个 Application 最大并发分配的 executor 数

spark.dynamicAllocation.schedulerBacklogTimeout 1s

spark.dynamicAllocation.sustainedSchedulerBacklogTimeout 5s

#### 2、并行度调优

1） 如果读取的数据在 HDFS 中，降低 block 大小，相当于提高了 RDD中 partition 个数 sc.textFile(xx,numPartitions)

2） sc.parallelize(xxx, numPartitions)

3） sc.makeRDD(xxx, numPartitions)

4） sc.parallelizePairs(xxx, numPartitions)

5） repartions/coalesce

6） redecByKey/groupByKey/join ---(xxx, numPartitions)

7） spark.default.parallelism net set

8） spark.sql.shuffle.partitions---200

9） 自定义分区器

10）如果读取数据是在 SparkStreaming 中

​	Receiver: spark.streaming.blockInterval—200ms

​	Direct:读取的 topic 的分区数

#### 3、代码调优

###### 1）避免创建重复的 RDD

val rdd1 = sc.textFile(path1)

val rdd2 = sc.textFile(path1) 

这就是创建了重复的 RDD有什么问题？ 

对于执行性能来说没有问题，但是呢，代码乱

###### 2）复用同一个 RDD

val rdd1 = RDD<String,String>

val rdd2 = rdd1.map(_._2)

这样的话 rdd2 是 rdd1 的子集。 rdd2 执行了一个操作 filter rdd2.filter() = rdd1.map（(_._2)）.filter()

###### 3）对多次使用的 RDD 进行持久化

如何选择一种最合适的持久化策略？

默认情况下，性能最高的当然是 MEMORY_ONLY，但前提是你的内存必须足够足够大，可以绰绰有余地存放下整个 RDD 的所有数据。因为不进行序列化与反序列化操作，就避免了这部分的性能开销；对这个 RDD 的后续算子操作，都是基于纯内存中的数据的操作，不需要从磁盘文件中读取数据，性能也很高；而且不需要复制一份数据副本，并远程传送到其他节点上。但是这里必须要注意的是，在实际的生产环境中，恐怕能够直接用这种策略的场景还是有限的，如果 RDD 中数据比较多时（比如几十亿），直接用这种持久化级别，会导致 JVM 的 OOM 内存溢出异常。

如果使用 MEMORY_ONLY 级别时发生了内存溢出，那么建议尝试使用MEMORY_ONLY_SER 级别。该级别会将 RDD 数据序列化后再保存在内存中，此时每个 partition 仅仅是一个字节数组而已，大大减少了对象数量，并降低了内存占用。这种级别比 MEMORY_ONLY 多出来的性能开销，主要就是序列化与反序列化的开销。但是后续算子可以基于纯内存进行操作，因此性能总体还是比较高的。此外，可能发生的问题同上，如果RDD 中的数据量过多的话，还是可能会导致 OOM 内存溢出的异常。

如 果 纯 内 存 的 级 别 都 无 法 使 用 ， 那 么 建 议 使 用MEMORY_AND_DISK_SER 策略，而不是 MEMORY_AND_DISK 策略。因为既然到了这一步，就说明 RDD 的数据量很大，内存无法完全放下。序列化后的数据比较少，可以节省内存和磁盘的空间开销。同时该策略会优先尽量尝试将数据缓存在内存中，内存缓存不下才会写入磁盘。

通常不建议使用 DISK_ONLY 和后缀为\_2 的级别：因为完全基于磁盘文件进行数据的读写，会导致性能急剧降低，有时还不如重新计算一次所有RDD。后缀为_2 的级别，必须将所有数据都复制一份副本，并发送到其他节点上，数据复制以及网络传输会导致较大的性能开销，除非是要求作业的高可用性，否则不建议使用。

持久化算子：

cache:

​	MEMORY_ONLY

persist：

​	MEMORY_ONLY

​	MEMORY_ONLY_SER

​	MEMORY_AND_DISK_SER

​	一般不要选择带有_2 的持久化级别。

checkpoint:

① 如果一个 RDD 的计算时间比较长或者计算起来比较复杂，一般将这个 RDD 的计算结果保存到 HDFS 上，这样数据会更加安全。

② 如果一个 RDD 的依赖关系非常长，也会使用 checkpoint,会切断依赖关系，提高容错的效率。

###### 4）尽量避免使用 shuffle 类的算子

使用广播变量来模拟使用 join,使用情况：一个 RDD 比较大，一个 RDD比较小。

join 算子=广播变量+filter、广播变量+map、广播变量+flatMap

###### 5）使用 map-side 预聚合的 shuffle 操作

即尽量使用有 combiner 的 shuffle 类算子。

combiner 概念：

​	在 map 端，每一个 map task 计算完毕后进行的局部聚合。

combiner 好处：

​	1) 降低 shuffle write 写磁盘的数据量。

​	2) 降低 shuffle read 拉取数据量的大小。

​	3) 降低 reduce 端聚合的次数。

​		有 combiner 的 shuffle 类算子：

​		1) reduceByKey:这个算子在 map 端是有 combiner 的，在一些场景中可以使用 reduceByKey 代替 groupByKey。

​		2) aggregateByKey

​		3) combineByKey

###### 6）尽量使用高性能的算子

使用 reduceByKey 替代 groupByKey

使用 mapPartition 替代 map

使用 foreachPartition 替代 foreach

filter 后使用 coalesce 减少分区数

使用使用repartitionAndSortWithinPartitions 替代repartition与sort类操作

使用 repartition 和 coalesce 算子操作分区。

###### 7）使用广播变量

开发过程中，会遇到需要在算子函数中使用外部变量的场景（尤其是大变量，比如 100M 以上的大集合），那么此时就应该使用 Spark 的广播(Broadcast）功能来提升性能，函数中使用到外部变量时，默认情况下，Spark 会将该变量复制多个副本，通过网络传输到 task 中，此时每个 task都有一个变量副本。如果变量本身比较大的话（比如 100M，甚至 1G），那么大量的变量副本在网络中传输的性能开销，以及在各个节点的Executor 中占用过多内存导致的频繁 GC，都会极大地影响性能。如果使用的外部变量比较大，建议使用 Spark 的广播功能，对该变量进行广播。广播后的变量，会保证每个 Executor 的内存中，只驻留一份变量副本，而 Executor 中的 task 执行时共享该 Executor 中的那份变量副本。这样的话，可以大大减少变量副本的数量，从而减少网络传输的性能开销，并减少对 Executor 内存的占用开销，降低 GC 的频率。

广播大变量发送方式：Executor 一开始并没有广播变量，而是 task 运行需 要 用 到 广 播 变 量 ， 会 找 executor 的 blockManager 要 ，bloackManager 找 Driver 里面的 blockManagerMaster 要。

使用广播变量可以大大降低集群中变量的副本数。不使用广播变量，变量的副本数和 task 数一致。使用广播变量变量的副本和 Executor 数一致。

###### 8）使用 Kryo 优化序列化性能

在 Spark 中，主要有三个地方涉及到了序列化：

1) 在算子函数中使用到外部变量时，该变量会被序列化后进行网络传输。

2) 将自定义的类型作为 RDD 的泛型类型时（比如 JavaRDD\<SXT>，SXT是自定义类型），所有自定义类型对象，都会进行序列化。因此这种情况下，也要求自定义的类必须实现 Serializable 接口。

3) 使用可序列化的持久化策略时（比如 MEMORY_ONLY_SER），Spark会将 RDD 中的每个 partition 都序列化成一个大的字节数组。

Kryo 序列化器介绍：

Spark 支持使用 Kryo 序列化机制。Kryo 序列化机制，比默认的 Java 序列化机制，速度要快，序列化后的数据要更小，大概是 Java 序列化机制的 1/10。所以 Kryo 序列化优化以后，可以让网络传输的数据变少；在集群中耗费的内存资源大大减少。

对于这三种出现序列化的地方，我们都可以通过使用 Kryo 序列化类库，来优化序列化和反序列化的性能。Spark 默认使用的是 Java 的序列化机制，也就是 ObjectOutputStream/ObjectInputStream API 来进行序列
化和反序列化。但是 Spark 同时支持使用 Kryo 序列化库，Kryo 序列化类库的性能比 Java 序列化类库的性能要高很多。官方介绍，Kryo 序列化机制比 Java 序列化机制，性能高 10 倍左右。Spark 之所以默认没有使用Kryo 作为序列化类库，是因为 Kryo 要求最好要注册所有需要进行序列化的自定义类型，因此对于开发者来说，这种方式比较麻烦。

Spark 中使用 Kryo：

```python
Sparkconf.set("spark.serializer",
"org.apache.spark.serializer.KryoSerializer")
.registerKryoClasses(new Class[]{SpeedSortKey.class})
```

###### 9）优化数据结构

java 中有三种类型比较消耗内存：

1) 对象，每个 Java 对象都有对象头、引用等额外的信息，因此比较占用内存空间。

2) 字符串，每个字符串内部都有一个字符数组以及长度等额外信息。

3) 集合类型，比如 HashMap、LinkedList 等，因为集合类型内部通常会使用一些内部类来封装集合元素，比如 Map.Entry。

因此 Spark 官方建议，在 Spark 编码实现中，特别是对于算子函数中的代码，尽量不要使用上述三种数据结构，尽量使用字符串替代对象，使用原始类型（比如 Int、Long）替代字符串，使用数组替代集合类型，这样尽可能地减少内存占用，从而降低 GC 频率，提升性能。

###### 10）使用高性能的库 fastutil

fasteutil 介绍：

fastutil 是扩展了 Java 标准集合框架（Map、List、Set；HashMap、ArrayList、HashSet）的类库，提供了特殊类型的 map、set、list 和 queue；

fastutil 能够提供更小的内存占用，更快的存取速度；我们使用 fastutil提供的集合类，来替代自己平时使用的 JDK 的原生的 Map、List、Set，好处在于，fastutil 集合类，可以减小内存的占用，并且在进行集合的遍历、根据索引（或者 key）获取元素的值和设置元素的值的时候，提供更快的存取速度。fastutil 的每一种集合类型，都实现了对应的 Java 中的标准接口（比如 fastutil 的 map，实现了 Java 的 Map 接口），因此可以直接放入已有系统的任何代码中。

fastutil 最新版本要求 Java 7 以及以上版本。

使用：

见 RandomExtractCars.java 类

#### 4、数据本地化

###### 数据本地化级别

1) PROCESS_LOCAL

​	task 要计算的数据在本进程（Executor）的内存中。

![PROCESS_LOCAL](.\img\PROCESS_LOCAL.png)

2) NODE_LOCAL

​	① task 所计算的数据在本节点所在的磁盘上。

​	② task 所计算的数据在本节点其他 Executor 进程的内存中。

![NODE_LOCAL](.\img\NODE_LOCAL.png)

3) NO_PREF

​	task 所计算的数据在关系型数据库中，如 mysql。

![NO_PREF](.\img\NO_PREF.png)

4) RACK_LOCAL

task所计算的数据在同机架的不同节点的磁盘或者Executor进程的内存中

![RACK_LOCAL](.\img\RACK_LOCAL.png)

5) ANY

跨机架。

###### Spark 数据本地化调优

![Spark 数据本地化调优](.\img\Spark 数据本地化调优.png)

Spark 中任务调度时，TaskScheduler 在分发之前需要依据数据的位置来分发，最好将 task 分发到数据所在的节点上，如果 TaskScheduler 分发的 task在默认 3s 依然无法执行的话，TaskScheduler 会重新发送这个 task 到相同的 Executor 中去执行，会重试 5 次，如果依然无法执行，那么 TaskScheduler会降低一级数据本地化的级别再次发送 task。

如上图中，会先尝试 1,PROCESS_LOCAL 数据本地化级别，如果重试 5 次每次等待 3s,会默认这个 Executor 计算资源满了，那么会降低一级数据本地化级别到 2，NODE_LOCAL,如果还是重试 5 次每次等待 3s 还是失败，那么还是会降低一级数据本地化级别到 3，RACK_LOCAL。这样数据就会有网络传输，降低了执行效率。

1) 如何提高数据本地化的级别？
		可以增加每次发送 task 的等待时间（默认都是 3s），将 3s 倍数调大， 结合 WEBUI 来调节：
		• spark.locality.wait
		• spark.locality.wait.process
		• spark.locality.wait.node
		• spark.locality.wait.rack

​	注意：等待时间不能调大很大，调整数据本地化的级别不要本末倒置，虽然每一个 task 的本地化级别是最高了，但整个 Application 的执行时间反而加长。

2) 如何查看数据本地化的级别？

​	通过日志或者 WEBUI

#### 5、内存调优

![内存调优](.\img\内存调优.png)

JVM 堆内存分为一块较大的 Eden 和两块较小的 Survivor，每次只使用 Eden 和其中一块 Survivor，当回收时将 Eden 和 Survivor 中还存活着的对象一次性复制到另外一块 Survivor 上，最后清理掉 Eden 和刚才用过的 Survivor。

也就是说当 task 创建出来对象会首先往 Eden 和 survivor1 中存放，survivor2是空闲的，当 Eden 和 survivor1 区域放满以后就会触发 minor gc 小型垃圾回收，清理掉不再使用的对象。会将存活下来的对象放入 survivor2 中。

如果存活下来的对象大小大于 survivor2 的大小，那么 JVM 就会将多余的对象直接放入到老年代中。如果这个时候年轻代的内存不是很大的话，就会经常的进行 minor gc，频繁的 minor gc 会导致短时间内有些存活的对象（多次垃圾回收都没有回收掉，一直在用的又不能被释放,这种对象每经过一次 minor gc 都存活下来）频繁的倒来倒去，会导致这些短生命周期的对象（不一定长期使用）每进行一次垃圾回收就会长一岁。年龄过大，默认 15 岁，垃圾回收还是没有回收回去就会跑到老年代里面去了。

这样会导致在老年代中存放大量的短生命周期的对象，老年代应该存放的是数量比较少并且会长期使用的对象，比如数据库连接池对象。这样的话，老年代就会满溢（full gc 因为本来老年代中的对象很少，很少进行 full gc 因此采取了不太复杂但是消耗性能和时间的垃圾回收算法）。不管 minor gc 还是 full gc 都会导致 JVM的工作线程停止。

**总结-堆内存不足造成的影响**：

1) 频繁的 minor gc。

2) 老年代中大量的短声明周期的对象会导致 full gc。

3) gc 多了就会影响 Spark 的性能和运行的速度。

Spark JVM 调优主要是降低 gc时间，可以修改 Executor 内存的比例参数。RDD 缓存、task 定义运行的算子函数，可能会创建很多对象，这样会占用大量的堆内存。堆内存满了之后会频繁的 GC，如果 GC 还不能够满足内存的需要的话就会报 OOM。比如一个 task 在运行的时候会创建 N 个对象，这些对象首先要放入到 JVM 年轻代中。比如在存数据的时候我们使用了foreach 来将数据写入到内存，每条数据都会封装到一个对象中存入数据库
中，那么有多少条数据就会在 JVM 中创建多少个对象。

**Spark 中如何内存调优？**

Spark Executor 堆内存中存放（以静态内存管理为例）：RDD 的缓存数据和广播变量（spark.storage.memoryFraction 0.6），shuffle 聚合内存（spark.shuffle.memoryFraction 0.2）,task 的运行（0.2）那么如何调优呢？

1) 提高 Executor 总体内存的大小

2) 降低储存内存比例或者降低聚合内存比例

如何查看 gc？

Spark WEBUI 中 job->stage->task

#### 6、Spark Shuffle 调优

1. buffer 大小——32KB
2. shuffle read 拉取数据量的大小——48M
3. shuffle 聚合内存的比例——20%
4. 拉取数据重试次数——5 次
5. 重试间隔时间 60s
6. Spark Shuffle 的种类
7. HashShuffle 合并机制
8. SortShuffle bypass 机制 200 次

#### 7、调节 Executor 的堆外内存

Spark 底层 shuffle 的传输方式是使用 netty 传输，netty 在进行网络传输的过程会申请堆外内存（netty 是零拷贝），所以使用了堆外内存。默认情况下，这个堆外内存上限默认是每一个 executor 的内存大小的 10%；真正处理大数据的时候，这里都会出现问题，导致 spark 作业反复崩溃，无法运行；此时就会去调节这个参数，到至少 1G（1024M），甚至说 2G、4G。

executor 在进行 shuffle write，优先从自己本地关联的 mapOutPutWorker中获取某份数据如果本地 mapOutPutWorkers 没有的话，那么会通过TransferService，去远程连接其他节点上 executor 的 block manager 去获取，如果本地 block manager 没有的话，那么会通过 TransferService，去远程连接其他节点上 executor 的 block manager 去获取，尝试建立远程的网络连接，并且去拉取数据。频繁创建对象让 JVM 堆内存满溢，进行垃圾回收。正好碰到那个 exeuctor 的 JVM 在垃圾回收。处于垃圾回过程中，所有的工作线程全部停止；相当于只要一旦进行垃圾回收，spark / executor 停止工作，无法提供响应，spark 默认的网络连接的超时时长是 60s；如果卡住 60s 都无法建立连接的话，那么这个 task 就失败了。task 失败了就会出现 现 shuffle file cannot find 的错误。

那么如何调节等待的时长呢？

在./spark-submit 提交任务的脚本里面添加：

​	--conf spark.core.connection.ack.wait.timeout=300

​	Executor 由于内存不足或者堆外内存不足了，挂掉了，对应的 Executor 上面的 block manager 也挂掉了，找不到对应的 shuffle map output 文件，Reducer 端不能够拉取数据。

我们可以调节堆外内存的大小，如何调节？

​	在./spark-submit 提交任务的脚本里面添加

​	yarn 下：

​	--conf spark.yarn.executor.memoryOverhead=2048 单位 M

​	standalone 下：

​	--conf spark.executor.memoryOverhead=2048 单位 M

#### 8、解决数据倾斜

###### 1）使用 Hive ETL 预处理数据

方案适用场景：

如果导致数据倾斜的是 Hive 表。如果该 Hive 表中的数据本身很不均匀（比如某个 key 对应了 100 万数据，其他 key 才对应了 10 条数据），而且业务场景需要频繁使用 Spark 对 Hive 表执行某个分析操作，那么比较适合使用这种技术方案。

方案实现思路：

此时可以评估一下，是否可以通过 Hive 来进行数据预处理（即通过 HiveETL 预先对数据按照 key 进行聚合，或者是预先和其他表进行 join），然后在 Spark 作业中针对的数据源就不是原来的 Hive 表了，而是预处理后的 Hive 表。此时由于数据已经预先进行过聚合或 join 操作了，那么在Spark 作业中也就不需要使用原先的 shuffle 类算子执行这类操作了。

方案实现原理：

这种方案从根源上解决了数据倾斜，因为彻底避免了在 Spark 中执行shuffle 类算子，那么肯定就不会有数据倾斜的问题了。但是这里也要提醒一下大家，这种方式属于治标不治本。因为毕竟数据本身就存在分布不均匀的问题，所以 Hive ETL 中进行 group by 或者 join 等 shuffle 操作时，还是会出现数据倾斜，导致 Hive ETL 的速度很慢。我们只是把数据倾斜的发生提前到了 Hive ETL 中，避免 Spark 程序发生数据倾斜而已。

###### 2）过滤少数导致倾斜的 key

方案适用场景：

如果发现导致倾斜的 key 就少数几个，而且对计算本身的影响并不大的话，那么很适合使用这种方案。比如 99%的 key 就对应 10 条数据，但是只有一个 key 对应了 100 万数据，从而导致了数据倾斜。

方案实现思路：

如果我们判断那少数几个数据量特别多的 key，对作业的执行和计算结果不是特别重要的话，那么干脆就直接过滤掉那少数几个 key。比如，在Spark SQL 中可以使用 where 子句过滤掉这些 key 或者在 Spark Core
中对 RDD 执行 filter 算子过滤掉这些 key。如果需要每次作业执行时，动态判定哪些 key 的数据量最多然后再进行过滤，那么可以使用 sample算子对 RDD 进行采样，然后计算出每个 key 的数量，取数据量最多的 key
过滤掉即可。

方案实现原理：

将导致数据倾斜的 key 给过滤掉之后，这些 key 就不会参与计算了，自然不可能产生数据倾斜。、

###### 3）提高 shuffle 操作的并行度

方案实现思路：

在对 RDD 执行 shuffle 算子时，给 shuffle 算子传入一个参数，比如reduceByKey(1000)，该参数就设置了这个 shuffle 算子执行时 shuffleread task的数量。对于Spark SQL中的shuffle类语句，比如group by、join 等，需要设置一个参数，即 spark.sql.shuffle.partitions，该参数代表了 shuffle read task 的并行度，该值默认是 200，对于很多场景来说都有点过小。

方案实现原理：

增加 shuffle read task 的数量，可以让原本分配给一个 task 的多个 key分配给多个 task，从而让每个 task 处理比原来更少的数据。举例来说，如果原本有 5 个不同的 key，每个 key 对应 10 条数据，这 5 个 key 都是
分配给一个task的，那么这个task就要处理50条数据。而增加了shuffleread task 以后，每个 task 就分配到一个 key，即每个 task 就处理 10 条数据，那么自然每个 task 的执行时间都会变短了。

###### 4）双重聚合

方案适用场景：

对 RDD 执行 reduceByKey 等聚合类 shuffle 算子或者在 Spark SQL 中使用 group by 语句进行分组聚合时，比较适用这种方案。

方案实现思路：

这个方案的核心实现思路就是进行两阶段聚合。第一次是局部聚合，先给每个 key 都打上一个随机数，比如 10 以内的随机数，此时原先一样的 key就变成不一样的了，比如(hello, 1) (hello, 1) (hello, 1) (hello, 1)，就会变成(1_hello, 1) (1_hello, 1) (2_hello, 1) (2_hello, 1)。接着对打上随机数后的数据，执行 reduceByKey 等聚合操作，进行局部聚合，那么局部聚合结果，就会变成了(1_hello, 2) (2_hello, 2)。然后将各个 key 的前缀给去掉，就会变成(hello,2)(hello,2)，再次进行全局聚合操作，就可以得到最终结果了，比如(hello, 4)。

方案实现原理：

将原本相同的 key 通过附加随机前缀的方式，变成多个不同的 key，就可以让原本被一个 task 处理的数据分散到多个 task 上去做局部聚合，进而解决单个 task 处理数据量过多的问题。接着去除掉随机前缀，再次进行全局聚合，就可以得到最终的结果。

![双重聚合](.\img\双重聚合.png)

如果一个 RDD 中有一个 key 导致数据倾斜，同时还有其他的 key，那么一般先对数据集进行抽样，然后找出倾斜的 key,再使用 filter 对原始的RDD 进行分离为两个 RDD，一个是由倾斜的 key 组成的 RDD1，一个是由其他的 key 组成的 RDD2，那么对于 RDD1 可以使用加随机前缀进行多分区多 task 计算，对于另一个 RDD2 正常聚合计算，最后将结果再合并起来。

###### 5）将 reduce join 转为 map join

BroadCast+filter(或者 map)

方案适用场景：

在对 RDD 使用 join 类操作，或者是在 Spark SQL 中使用 join 语句时，而且 join 操作中的一个 RDD 或表的数据量比较小（比如几百 M 或者一两 G），比较适用此方案。

方案实现思路：

不使用 join 算子进行连接操作，而使用 Broadcast 变量与 map 类算子实现 join 操作，进而完全规避掉 shuffle 类的操作，彻底避免数据倾斜的发生和出现。将较小 RDD 中的数据直接通过 collect 算子拉取到 Driver端的内存中来，然后对其创建一个 Broadcast 变量；接着对另外一个 RDD执行 map 类算子，在算子函数内，从 Broadcast 变量中获取较小 RDD的全量数据，与当前 RDD 的每一条数据按照连接 key 进行比对，如果连接 key 相同的话，那么就将两个 RDD 的数据用你需要的方式连接起来。

方案实现原理：

普通的 join 是会走 shuffle 过程的，而一旦 shuffle，就相当于会将相同key的数据拉取到一个shuffle read task中再进行join，此时就是reducejoin。但是如果一个 RDD 是比较小的，则可以采用广播小 RDD 全量数据+map 算子来实现与 join 同样的效果，也就是 map join，此时就不会发生 shuffle 操作，也就不会发生数据倾斜。

###### 6）采样倾斜 key 并分拆 join 操作

方案适用场景：

两个 RDD/Hive 表进行 join 的时候，如果数据量都比较大，无法采用“解决方案五”，那么此时可以看一下两个 RDD/Hive 表中的 key 分布情况。如果出现数据倾斜，是因为其中某一个 RDD/Hive 表中的少数几个 key的数据量过大，而另一个 RDD/Hive 表中的所有 key 都分布比较均匀，那么采用这个解决方案是比较合适的。

方案实现思路：

对包含少数几个数据量过大的 key 的那个 RDD，通过 sample 算子采样出一份样本来，然后统计一下每个 key 的数量，计算出来数据量最大的是哪几个key。然后将这几个key对应的数据从原来的RDD中拆分出来，形成一个单独的 RDD，并给每个 key 都打上 n 以内的随机数作为前缀，而不会导致倾斜的大部分 key 形成另外一个 RDD。接着将需要 join 的另一个 RDD，也过滤出来那几个倾斜 key 对应的数据并形成一个单独的RDD，将每条数据膨胀成 n 条数据，这 n 条数据都按顺序附加一个 0~n的前缀，不会导致倾斜的大部分 key 也形成另外一个 RDD。再将附加了随机前缀的独立 RDD 与另一个膨胀 n 倍的独立 RDD 进行 join，此时就可以将原先相同的 key 打散成 n 份，分散到多个 task 中去进行 join 了。而另外两个普通的 RDD 就照常 join 即可。最后将两次 join 的结果使用union 算子合并起来即可，就是最终的 join 结果 。

![采样倾斜 key 并分拆 join 操作](.\img\采样倾斜 key 并分拆 join 操作.png)

###### 7）使用随机前缀和扩容 RDD 进行 join

方案适用场景：

如果在进行 join 操作时，RDD 中有大量的 key 导致数据倾斜，那么进行分拆 key 也没什么意义，此时就只能使用最后一种方案来解决问题了。

方案实现思路：

该方案的实现思路基本和“解决方案六”类似，首先查看 RDD/Hive 表中的数据分布情况，找到那个造成数据倾斜的 RDD/Hive 表，比如有多个 key 都对应了超过 1 万条数据。然后将该 RDD 的每条数据都打上一个n 以内的随机前缀。同时对另外一个正常的 RDD 进行扩容，将每条数据都扩容成 n 条数据，扩容出来的每条数据都依次打上一个 0~n 的前缀。最后将两个处理后的 RDD 进行 join 即可。

![用随机前缀和扩容 RDD 进行 join](.\img\用随机前缀和扩容 RDD 进行 join.png)

#### 9、Spark 故障解决（troubleshooting）

1. shuffle file cannot find：磁盘小文件找不到。

  1) connection timeout ----shuffle file cannot find

  提高建立连接的超时时间，或者降低 gc，降低 gc 了那么 spark 不能堆外提供服务的时间就少了，那么超时的可能就会降低。

  2) fetch data fail ---- shuffle file cannot find

  提高拉取数据的重试次数以及间隔时间

  3) OOM/executor lost ---- shuffle file cannot find

  提高堆外内存大小，提高堆内内存大小。

2. reduce OOM

  BlockManager 拉取的数据量大，reduce task 处理的数据量小

  解决方法：

  1) 降低每次拉取的数据量

  2) 提高 shuffle 聚合的内存比例

  3) 提高 Executor 的内存比例

3. 序列化问题

4. Null 值问题

  df.filter(df.col("type").isNotNull())