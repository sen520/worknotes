## kafka

kafka是一个分布式的、可分区的、可复制的消息发布和订阅系统，具备高性能和高吞吐率。



### kafka 消息队列的特点

A、消费者和生产者模式

B、FIFO(先进先出)的有序性

C、是分布式的

​	Kafaka是分布式的，其所有的构件borker(服务端集群)、producer(消息生产)、consumer(消息消费者)都可以是分布式的。所以kafka可扩展性好和数据的高可靠性；可做到负载均衡和副本冗余

![kafka分布式](.\img\kafka分布式.png)

D、高吞吐率的

​	kafka可同时为发布和订阅提供高吞吐量。单节点支持上千个客户端，百兆/S吞吐。

E、消息被处理的状态是在consumer端维护，而不是由server端维护。当失败时，能自动平衡。

F、持久性：持久化到**磁盘**且性能好

​	kafka本身采用零拷贝技术不受速度限制（理论上网络最大的速度），顺序读取线程跑持久化到磁盘

​	内存是随机的且有JVM 会有GC

### kafka消息队列的常用场景

系统间的解耦合

峰值压力缓冲

异步（并行）通信

一些常规的消息系统

![系统间的解耦合](.\img\系统间的解耦合.png)



一个节点可以连接多个客户端

![kafka应用场景](.\img\kafka应用场景.png)



注意：对于一些常规的消息系统,kafka是个不错的选择，partitons/replication和容错,可以使kafka具有良好的扩展性和性能优势。不过到目前为止，我们应该很清楚认识到，kafka并没有提供JMS中的"事务性""消息传输担保(消息确认机制)""消息分组"等企业级特性;
	kafka只能使用作为"常规"的消息系统,在一定程度上,尚未确保消息的发送与接收绝对可靠(比如：消息重发，消息发送丢失等)， 总之**根据业务需求进行技术选型**

### MQ（消息队列）

##### RabbitMQ

RabbitMQ是使用Erlang编写的一个开源的消息队列，本身支持很多的协议：AMQP，XMPP, SMTP, STOMP，
也正因如此，它**非常重量级，更适合于企业级的开发**。同时**实现了Broker构架**，这意味着消息在发送给客户
端时先在中心队列排队。对路由，负载均衡或者数据持久化都有很好的支持。

##### Redis

Redis是一个基于**Key-Value**对的NoSQL数据库，开发维护很活跃。虽然它是一个Key-Value数据库存储系统，但它本身支持MQ功能，所以完全可以当做一个**轻量级的队列服务**来使用。对于RabbitMQ和Redis的入队和
出队操作，各执行100万次，每10万次记录一次执行时间。测试数据分为128Bytes、512Bytes、1K和10K四个
不同大小的数据。实验表明：入队时，**当数据比较小时Redis的性能要高于RabbitMQ**，而如果数据大小超过
了10K，Redis则慢的无法忍受；出队时，无论数据大小，Redis都表现出非常好的性能，而RabbitMQ的出队
性能则远低于Redis。

##### ZeroMQ

ZeroMQ号称**最快的消息队列系统**，尤其针对大吞吐量的需求场景。ZeroMQ能够实现RabbitMQ不擅长的高级/复杂的队列，但是开发人员**需要自己组合多种技术框架**，**技术上的复杂度**是对这MQ能够应用成功的挑战。ZeroMQ具有一个独特的非中间件的模式，你不需要安装和运行一个消息服务器或中间件，因为你的应用程序将扮演这个服务器角色。你只需要简单的引用ZeroMQ程序库，可以使用NuGet安装，然后你就可以愉快的在应用程序之间发送消息了。但是ZeroMQ仅提供非持久性的队列，也就是说如果宕机，数据将会丢失。其中，Twitter的Storm 0.9.0以前的版本中默认使用ZeroMQ作为数据流的传输（Storm从0.9版本开始同时支持ZeroMQ和Netty作为传输模块）。

##### ActiveMQ

ActiveMQ是Apache下的一个子项目。 类似于ZeroMQ，它能够以**代理人**和**点对点**的技术实现队列。同时类似于RabbitMQ，它少量代码就可以高效地实现高级应用场景。

### kafka架构

##### producers

producers：消息的生产者。它自己**决定往哪个partition写消息**，可以是**轮询的负载均衡**，或者**基于hash的partition策略**。

##### consumers

consumers：消息的消费者。它需要**保存消费消息的offset**,对于offset的保存和使用,有消费者consumer来控制;当consumer正常消费消息时,offset将会**"线性"的向前驱动**，即消息将依次顺序被消费.事实上consumer可以使用**任意顺序消费消息**,它只需要将offset重置为任意值..【**不建议**】(offset将会保存在zookeeper中)。因此producer和consumer的客户端实现非常轻量级,它们**可以随意离开**,而**不会对集群造成额外的影响**。**非常灵活**。

【每条信息由 offset来表示它在这个partition中的偏移量，这个offset不是该Message在partition数据文件中的实际存储位置，而是逻辑上一个值，它唯一确定了partition中的一条Message。因此，可以认为offset是partition中Message的**id**】。

数据保存在Partition中。

![kafka架构](.\img\kafka架构.png)



![kafka-consumer](.\img\kafka-consumer.png)

当前kafka集群中有两个节点，每个节点中有两个partition（p0,p1	p2,p3），Group代表一个系统、程序，而其中的consumer相当于系统、程序中的一个进程、线程。

publish-subscribe   订阅和发布

##### broker

broker：Kafka集群的server服务（一个broker就有一个kafka）。负责处理消息的读、写请求，存储消息。

##### topic

topic ：一个Topic可以认为是**一类消息**（相当于一个业务需求），每个topic将被分成多个partition(区),每个partition在存储层面是append log文件（源源不断的进行追加）。任何发布到此partition的消息都会被直接追加到log文件的尾部，每条消息在文件中的位置称为offset（偏移量），offset为一个long型数字，它是唯一标记一条消息。它唯一的标记一条消息（相当于id，但不指定实际的物理地址）。kafka并没有提供其他额外的索引机制来存储offset，因为**在kafka中几乎不允许对消息进行“随机读写”**。
一个topic分成多个partition。
每个**partition内部消息强有序**，其中每个消息都有一个序号叫offset。
一个partition之对应一个broker，一个broker可以有多个partition。
消息不经过内存缓冲，直接写入文件。根据时间策略（默认7天）删除，而不是消费完就删除。



partitions的设计目的有多个. **最根本原因是kafka基于文件存储**。通过分区，可以将日志内容分散到多个server上，来避免文件尺寸达到单机磁盘的上限，每个partiton都会被当前server(kafka实例)保存（在哪个节点上部署了kafka就在那个对应的节点上进行存储）；可以将一个topic切分多任意多个partitions，来消息保存/消费的效率。此外**越多的partitions意味着可以容纳更多的consumer，有效提升并发消费的能力**（大大的提高消费的效率和速度，相当与对程序的优化）。

**读取时是无序的，但是在一个partition中是强有序的**，多个partition进行读取是无序的。

### 安装和部署

tar -zxvf kafka_2.10-0.9.0.1.tgz

cd  /home/kafka_2.10-0.9.0.1/config

vim server.properties 

```
zookeeper.connect=hadoop01:2181,hadoop02:2181,hadoop03:2181
```

cd /home/kafka_2.10-0.9.0.1

vim  startkafka.sh

```
nohup bin/kafka-server-start.sh config/server.properties > kafka.log 2>&1 &
```

scp -r kafka_2.10-0.9.0.1 hadoop02:/home/

scp -r kafka_2.10-0.9.0.1 hadoop03:/home/



hadoop02    cd  /home/kafka_2.10-0.9.0.1/config

vim server.properties 

```
broker.id=1
```



hadoop03  

vim /home/kafka_2.10-0.9.0.1/config/server.properties 

```
broker.id=2
```

启动

（三台机器）

```
zkServer.sh start
cd  /home/kafka_2.10-0.9.0.1
bash startkafka.sh 
```

创建topic

```
./bin/kafka-topics.sh -zookeeper hadoop01:2181,hadoop02:2181,hadoop03:2181 -topic test -replication-factor 2 -partitions 5 --create   # 5个分区，2个副本
```

查看topic

```
./bin/kafka-topics.sh -zookeeper hadoop01:2181,hadoop02:2181,hadoop03:2181 –list
```

创建produce

```
./kafka-console-producer.sh --broker-list hadoop01:9092,hadoop02:9092,hadoop03:9092 --topic test
```

另外的节点上创建consumer

```
./kafka-console-consumer.sh --zookeeper hadoop01:2181,hadoop02:2181,hadoop03:2181 --topic test --from-beginning  # 前面的数据也会获取到

./kafka-console-consumer.sh --zookeeper hadoop01:2181,hadoop02:2181,hadoop03:2181 --topic test
# 仅仅获取当前产生的数据
```

zkCli.sh		启动zookeeper客户端

ls  /consumers     =======查看启动过的消费者

ls  /brokers    ========查看topics

### API

##### 生产者

```python
from pykafka import KafkaClient

host = 'node01:9092,node02:9092,node03:9092'
client = KafkaClient(hosts=host)

# print(client.topics)

# 生产者
topicdocu = client.topics[b'my-topic00']
producer = topicdocu.get_producer()

# topice = client.topics
# topice = 'my-topic'
# producer = topice.get_sync_producer()

for i in range(20):
    print(i)
    sendmsg = producer.produce(b'test message ' + bytes(i ** 2))
    print(sendmsg)
producer.stop()

```

##### 消费者

```python
from pykafka import KafkaClient

host = 'node01:9092,node02:9092,node03:9092'
client = KafkaClient(hosts=host)

# print(client.topics)
# print(client.brokers)
# print(client.cluster)

topice = client.topics[b'my-topic00']
consumer = topice.get_simple_consumer(consumer_group=b'test1', auto_commit_enable=True, auto_commit_interval_ms=1,
                                     consumer_id=b'test1')
for messages in consumer:
    if messages is not None:
        offset = messages.offset
        value = messages.value
        print(offset,value.decode('utf-8'))
```

### KafkaOffsetMonitor(监控系统)

功能：

1. 对Consumer的消费监控，并列出每个Consumer的Offset数据
2. 保护消费者组列表信息
3. 每个Topic的所有Partition列表包含：Topic、Pid、Offset、LogSize、Lag以及Owner等等
4. 浏览查阅Topic的历史消费信息

开启之前执行

在hadoop02上执行

```
java -cp KafkaOffsetMonitor-assembly-0.2.0.jar \
 com.quantifind.kafka.offsetapp.OffsetGetterWeb \
 --zk hadoop01:2181,hadoop02:2181,hadoop03:2181 \
 --port 8089 \
 --refresh 5.seconds \
 --retain 1.days
```

浏览器查看：hadoop02:8089（查看当前目录下   KafkaOffsetMonitor.docx）



Topic：创建Topic名称

Partition：分区编号

Offset：表示该Parition已经消费了多少Message

LogSize：表示该Partition生产了多少Message

Lag：表示有多少条Message未被消费

Owner：表示消费者

Created：表示该Partition创建时间

Last Seen：表示消费状态刷新最新时间

### 彻底删除kafka数据信息（topic）

[彻底删除Kafka中的topic](http://www.cnblogs.com/felixzh/p/5992745.html)

1、删除kafka存储目录（server.properties文件log.dirs配置，默认为"/tmp/kafka-logs"）相关topic目录

2、Kafka 删除topic的命令是：

   ./bin/kafka-topics.sh  --delete --zookeeper 【zookeeper server】  --topic 【topic name】

   如果kafaka启动时加载的配置文件中server.properties没有配置delete.topic.enable=true，那么此时的删除并不是真正的删除，而是把topic标记为：marked for deletion

   你可以通过命令：./bin/kafka-topics.sh --zookeeper 【zookeeper server】 --list 来查看所有topic

  此时你若想真正删除它，可以登录zookeeper客户端：

  命令：./bin/zookeeper-client

  找到topic所在的目录：ls /brokers/topics

  找到要删除的topic，执行命令：rmr /brokers/topics/【topic name】即可，此时topic被彻底删除。

 另外被标记为marked for deletion的topic你可以在zookeeper客户端中通过命令获得：ls /admin/delete_topics/【topic name】，

如果你删除了此处的topic，那么./kafka-topics.sh --list --zookeeper node01:2181 --topic 【topic name】 , marked for deletion 标记消失

zookeeper 的config中也有有关topic的信息： ls /config/topics/【topic name】暂时不知道有什么用

 

总结：

彻底删除topic：

 1、删除kafka存储数据目录（server.properties文件log.dirs配置，默认为"/tmp/kafka-logs"）相关topic目录

  2、如果配置了delete.topic.enable=true直接通过命令删除，如果命令删除不掉，直接通过zookeeper-client 删除掉broker下的topic即可。

rmr /brokers/topics/【topic name】