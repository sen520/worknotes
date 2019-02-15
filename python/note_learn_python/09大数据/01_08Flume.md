## Flume

Flume是一个**分布式**、可扩展、可靠、高可用的海量日志有效聚合及移动的框架。

​	   日志的收集工具，具有可靠性和容错可调机制、许多故障转移和恢复机制。

Flume 1.0X版本 ======Flume NG（与0.9版本OG比 **去中心化**）![Flume](.\img\Flume.png)

source数据的输入源把数据源源不断的放到内部的存储池channel中，之后放到sink中，等待消费、落地（HDFS）



#### Agent

​	体现了dataFlow（数据流）

​	将数据源的数据发送给collector（0.9版本）

​	由source 、channel、sink三大组件组成（1.0版本）

###### source:

​	从Client收集数据，传递给Channel。可以接收外部源发送过来的数据。
		不同的 source，可以接受不同的数据格式。

​	AVIO、exec、netcat

​	比如有目录池(spooling directory)数据源，可以**监控指定文件夹中的新文件变化**，如果目录中有文件产生，就会立刻读取其内容。

###### Channel

​	是一个存储地，接收source的输出，直到有sink消费掉channel中的数据Channel中的数据直到进入到下一个channel中或者进入终端才会被删除；**当sink写入失败后，可以自动重启，不会造成数据丢失**，因此很可靠。

###### Sink

​	用于输出

![Flume_](.\img\Agent串并行.png)

数据

Agent1、2、3并行与4串行，四者连接传输中的**数据格式**、端口号必须相同![Agent内部](.\img\Agent内部.png)

可以有多个source、channel、sink



#### Flume特性

###### 数据可靠性（内部实现）

当节点出现故障时，日志能够被传送到其他节点上而不会丢失。
	Flume提供了三种级别的可靠性保障,从强到弱依次分别为：
		1、end-to-end：收到数据agent首先将event写到磁盘上，当数据传送成功后，再删除；如果数据发送失败，可以重新发送。
		2、Store on failure：数据接收方crash（拿到数据，有可能会造成数据丢失）。
		3、Best effort：数据发送到接收方后，不会确认有没有收到。(udp)

###### 自身可扩展性

Flume采用了三层架构，分别为agent，collector和storage，每一层均可以水平扩展。所有agent和 collector由master统一管理，使得系统容易监控和维护。master允许有多个（使用ZooKeeper进行管理和负载均衡），避免单点故障问题。【1.0自身agent实现扩展，减轻负载】

###### 功能可扩展性

用户可以根据需要添加自己的agent。（根据业务自由组合）

Flume自带了很多组件，包括各种agent（file，syslog，HDFS等）



#### 环境搭建

hadoop03

tar -zxvf apache-flume-1.6.0-bin.tar.gz 

###### 1、修改配置文件

mv apache-flume-1.6.0-bin flume-1.6.0

cd /home/flume-1.6.0/conf

mv flume-env.sh.template flume-env.sh

vim flume-env.sh 

```
export JAVA_HOME=/usr/java/jdk1.7.0_67
```

###### 2、配置环境变量

vim ~/.bash_profile

```
export FLUME_HOME=/home/flume-1.6.0
export PATH=$PATH:$FLUME_HOME/bin
```

source ~/.bash_profile

###### 3、检查是否安装成功

flume-ng version

###### 4、安装telnet

yum list telnet* 查看安装列表

yum -y install telnet 安装telnet

yum -y install telnet-server 安装telnet服务

yum -y install telnet-client 安装telnet客户端(大部分系统默认安装)         



#### 启动flume

##### netcat

根目录下mkdir flumecont	

cd flumecont/

vim avro-log

```
# example.conf: A single-node Flume configuration

===================指定名称=====================
# Name the components on this agent  
a1.sources = r1
a1.sinks = k1
a1.channels = c1

===================资源配置描述=====================
# Describe/configure the source
a1.sources.r1.type = netcat   		网络传递数据的类型
a1.sources.r1.bind = localhost		绑定的ip（hadoop03）
a1.sources.r1.port = 44444			端口

===================sink=====================
# Describe the sink
a1.sinks.k1.type = logger

===================channel=====================
# Use a channel which buffers events in memory
a1.channels.c1.type = memory		类型：内存
a1.channels.c1.capacity = 1000		默认通道中最大可以存储的event数量是1000
a1.channels.c1.transactionCapacity = 100	
每次最大可以从source中拿到或者送到sink中的event数量是100

===================三者之间进行绑定=====================
# Bind the source and sink to the channel
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1       
```

###### 执行

```
日志文件下
flume-ng agent --conf conf --conf-file /root/flumecont/netcat_logger --name a1 Dflume.root.logger=INFO,console

任意目录下
flume-ng agent --conf-file /root/flumecont/netcat_logger --name a1 Dflume.root.logger=INFO,console
```

另开启个hadoop03

启动

telnet localhost （hadoop03）44444

```
{ headers:{} body: 68 65 6C 6C 6F 0D                               hello. }
数字代表解析字段
```

scp -r flume-1.6.0  hadoop01:/home/

##### exec

```
# example.conf: A single-node Flume configuration

# Name the components on this agent
a1.sources = r1
a1.sinks = k1
a1.channels = c1

# Describe/configure the source
a1.sources.r1.type = exec
a1.sources.r1.command = tail -F /home/logs/flume.log

# Describe the sink
a1.sinks.k1.type = logger

# Use a channel which buffers events in memory
a1.channels.c1.type = memory
a1.channels.c1.capacity = 1000
a1.channels.c1.transactionCapacity = 100

# Bind the source and sink to the channel
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1
```

###### 执行

```
flume-ng agent --conf-file /root/flumecont/exec_logger --name a1 Dflume.root.logger=INFO,console
```

cd /home

mkdir logs

cd logs

vim flume.log  随便写点东西

echo 123123qwe >> flume.log

##### avro

```
#test avro sources
##使用avro方式在某节点上将文件发送到本服务器上[hadoop01]且通过logger方式显示
##当前flume节点执行：
#flume-ng agent --conf ./ --conf-file avro_loggers --name a1 -Dflume.root.logger=INFO,console

##在本节点/其他flume节点执行：flume-ng avro-client --conf ./ -H hadoop01 -p 55555 -F ./logs

#当前配置是做什么用的？     --> 读取文件（序列化） 。
#启动该脚本（配置）lume-ng agent --conf ./ --conf-file avro_loggers --name a1 -Dflume.root.logger=INFO,console 
#在hadoop01指定数据源为AVRO格式 绑定IP 端口,
#所以可以通在本服务器或者其他服务器通过：flume-ng avro-client --conf ./ -H hadoop01 -p 55555 -F ./logs
#将当前目录下的log文件发给指定的IP 端口， 
#node01的source源 可以接受发送过来的文件 在本服务器打印输出！

 


# Name the components on this agent
a1.sources=r1
a1.channels=c1
a1.sinks=k1

# Describe/configure the source
a1.sources.r1.type = avro
a1.sources.r1.bind=hadoop01
a1.sources.r1.port=55555

#sink
a1.sinks.k1.type=logger


#Use a channel which buffers events in memory
a1.channels.c1.type = memory
a1.channels.c1.capacity=1000
a1.channels.c1.transactionCapacity = 100

# Bind the source and sink to the channel
a1.sources.r1.channels=c1
a1.sinks.k1.channel=c1

```

scp -r ~/.bash_profile hadoop01:/root/

scp -r flume-1.6.0/ hadoop01:/home/



hadoop01:

```
mkdir flumecont
cd flumecont
vim avro_logger
将上面配置写入其中
flume-ng agent --conf ./  --conf-file /root/flumecont/avro_logger --name a1-Dflume.root.logger=INFO,console
```

hadoop03：

​	flume-ng avro-client --conf ./ -H hadoop01 -p 55555 -F ./netcat_logger

##### 多agent

hadoop01

/root/flumecont

vim netcat2_avro

```
# example.conf: A single-node Flume configuration
#flume-ng agent --conf ./ --conf-file netcat2_logger --name a1 -Dflume.root.logger=INFO,console
#flume-ng --conf conf --conf-file /root/flume_test/netcat_hdfs -n a1 -Dflume.root.logger=INFO,console
#telnet 192.168.235.15 44444


# Name the components on this agent
 a1.sources = r1
 a1.sinks = k1
 a1.channels = c1

 # Describe/configure the source
 a1.sources.r1.type = netcat
 a1.sources.r1.bind = hadoop01
 a1.sources.r1.port = 44444

 # Describe the sink
 a1.sinks.k1.type = avro
 a1.sinks.k1.hostname = hadoop03
 a1.sinks.k1.port = 60000


 # Use a channel which buffers events in memory
 a1.channels.c1.type = memory
 a1.channels.c1.capacity = 1000
 a1.channels.c1.transactionCapacity = 100

 # Bind the source and sink to the channel
 a1.sources.r1.channels = c1
 a1.sinks.k1.channel = c1


```

hadoop03

/root/flumecont

vim avro2_logger

```
#flume-ng agent --conf ./ --conf-file avro2 -n a1
a1.sources = r1
a1.sinks = k1
a1.channels = c1

a1.sources.r1.type = avro
a1.sources.r1.bind = hadoop03
a1.sources.r1.port = 60000

a1.sinks.k1.type = logger

# Use a channel which buffers events in memory
a1.channels.c1.type = memory
a1.channels.c1.capacity = 1000
a1.channels.c1.transactionCapacity = 100

# Bind the source and sink to the channel
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1

```



###### 启动

hadoop03

flume-ng agent --conf ./ --conf-file avro2_logger -n a1



hadoop01

flume-ng agent --conf ./ --conf-file netcat2_avro --name a1 -Dflume.root.logger=INFO,console



hadoop01

telnet hadoop01 44444



#### 连接hdfs

hadoop01:

vim netcat_hdfs

```
# a1 which ones we want to activate.
a1.sources = r1
a1.sinks = k1
a1.channels = c1

a1.sources.r1.type = netcat
a1.sources.r1.bind = hadoop01
a1.sources.r1.port = 41414

# Define a memory channel called c1 on a1
a1.channels.c1.type = memory


a1.sinks.k1.type = hdfs
a1.sinks.k1.hdfs.path = hdfs://home/data/


# Define an Avro source called r1 on a1 and tell it
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1

```

flume-ng agent --conf ./ --conf-file netcat_hdfs --name a1 -Dflume.root.logger=INFO,consolejps

telnet hadoop01 41414

####  [Flume-og和Flume-ng的变化](https://blog.csdn.net/u012689336/article/details/52672231) 

