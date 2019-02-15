## SparkStreaming

SparkStreaming 是流式处理框架，是 Spark API 的扩展，支持可扩展、高吞吐量、容错的实时数据流处理，实时数据的来源可以是：Kafka, Flume,Twitter, ZeroMQ 或者 TCP sockets，并且可以使用高级功能的复杂算子来
处理流数据。例如：map,reduce,join,window 。最终，处理后的数据可以存放在文件系统，数据库等，方便实时展现。

#### 和Storm的区别

1. Storm 是纯实时的流式处理框架，SparkStreaming 是准实时的处理框架（微批处理）。因为微批处理，SparkStreaming 的吞吐量比 Storm要高。
2. Storm 的事务机制要比 SparkStreaming 的要完善。
3. Storm 支持动态资源调度。(spark1.2 开始和之后也支持)
4. SparkStreaming 擅长复杂的业务处理，Storm 不擅长复杂的业务处理，擅长简单的汇总型计算。![SparkStreaming](.\img\SparkStreaming.png)

➢ receiver task 是 7*24 小时一直在执行，一直接受数据，将一段时间内接收来的数据保存到 batch 中。假设 batchInterval 为 5s,那么会将接收来的数据每隔 5 秒封装到一个 batch 中，batch 没有分布式计算特性，这一个 batch 的数据又被封装到一个 RDD 中，RDD 最终封装到一个 DStream 中。

例如：假设 batchInterval 为 5 秒，每隔 5 秒通过 SparkStreamin 将得到一个 DStream,在第 6 秒的时候计算这 5 秒的数据，假设执行任务的时间是 3 秒,那么第 6~9 秒一边在接收数据，一边在计算任务，9~10秒只是在接收数据。然后在第 11 秒的时候重复上面的操作。

➢ 如果 job 执行的时间大于 batchInterval 会有什么样的问题？

如果接受过来的数据设置的级别是仅内存，接收来的数据会越堆积越多，最后可能会导致 OOM（如果设置 StorageLevel 包含 disk, 则内存存放不下的数据会溢写至 disk, 加大延迟 ）。

#### SparkStreaming 代码

代码注意事项：

➢ 启动 socket server 服务器：nc –lk 9999

➢ receiver 模式下接受数据，local 的模拟线程必须大于等于 2，一个线程用来 receiver 用来接受数据，另一个线程用来执行 job。

➢ Durations 时间设置就是我们能接收的延迟度。这个需要根据集群的资源情况以及任务的执行情况来调节。

➢ 创建 JavaStreamingContext 有两种方式（SparkConf,SparkContext）

➢ 所有的代码逻辑完成后要有一个 output operation 类算子。

➢ JavaStreamingContext.start() Streaming 框架启动后不能再次添加业务逻辑。

➢ JavaStreamingContext.stop() 无参的 stop 方法将 SparkContext一同关闭，stop(false)，不会关闭 SparkContext。

➢ JavaStreamingContext.stop()停止之后不能再调用 start。

#### SparkStreaming 算子操作

1. foreachRDD

  ➢ output operation 算子,必须对抽取出来的 RDD 执行 action 类算子，代码才能执行。

2. transform

  ➢ transformation 类算子

  ➢ 可以通过 transform 算子，对 Dstream 做 RDD 到 RDD 的任意操作。

3. updateStateByKey

  ➢ transformation 算子

  ➢ updateStateByKey 作用：

  1) 为 SparkStreaming 中每一个 Key 维护一份 state 状态，state类型可以是任意类型的，可以是一个自定义的对象，更新函数也可以是自定义的。

  2) 通过更新函数对该 key 的状态不断更新，对于每个新的 batch 而言，SparkStreaming 会在使用 updateStateByKey 的时候为已经存在的 key 进行 state 的状态更新。

  ➢ 使用到 updateStateByKey 要开启 checkpoint 机制和功能。

  ➢ 多久会将内存中的数据写入到磁盘一份？

  如果 batchInterval 设置的时间小于 10 秒，那么 10 秒写入磁盘一份。如果 batchInterval 设置的时间大于 10 秒，那么就会batchInterval 时间间隔写入磁盘一份。

4.  窗口操作

➢ 窗口操作理解图：

![窗口操作理解图](.\img\窗口操作理解图.png)

假设每隔 5s 1 个 batch,上图中窗口长度为 15s，窗口滑动间隔 10s。

➢ 窗口长度和滑动间隔必须是 batchInterval 的整数倍。如果不是整数倍会检测报错。

➢ 优化后的 window 窗口操作示意图：

![窗口操作理解图优化](.\img\窗口操作理解图优化.png)

➢ 优化后的 window 操作要保存状态所以要设置 checkpoint 路径，没有优化的 window 操作可以不设置 checkpoint 路径。