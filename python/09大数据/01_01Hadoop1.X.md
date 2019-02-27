# Hadoop生态

分布式：将一个庞大、复杂的数据分发到不同计算机节点和服务器上运行和处理

Hadoop 来源：GFS\MapReduce\\Bigtable

Hadoop 1.0 :HDFS1.0

Hadoop 2.0 :HDFS2.0,   MapReduce,   Yarn 

![Hadoop2.0生态系统](.\img\Hadoop2.0生态系统.png)

## Hadoop1.x

### HDFS

###### 优点

- 适合大数据处理、百万级文件数量、适合批处理
- 方便、成本低：可构建在廉价的机器上
- 可靠性：其可设置副本数量，默认3个
- 容错：一个副本丢失后，可以通过其他副本进行自动恢复

###### 缺点

- 高吞吐会造成延迟的问题：可通过使用硬件(SSD)进行优化
  - 不支持毫秒
  - 延迟
- 寻道时间超过读取时间：可通过使用硬件(SSD)进行优化
- 不支持文件修改(并不是不能修改，而是因为修改会造成多次网络\io，低效率、低速度)

#### HDFS架构图

![HDFS架构图](.\img\HDFS架构图.png)

心跳机制、负载均衡、多负载策略

client客户端读写是通过NameNode读写，实际上是client客户端进行的读写



#### HDFS 数据存储模型

文件是通过线性切分成固定大小的数据块

​	hadoop 1 ：64M

​	hadoop 2 ：128M 

数据不足一个block最大大小，就单独放一个块，大小为其大小



文件的存储方式：

​按照大小被切分成若干block，存储到不同的节点上
	默认每个block会有两个副本，一共3个
  	副本数不会大于节点数
  	文件上传后，副本数可以改变，但是block的大小不能变



#### NameNode(NN)

NameNode 主要功能：
		接受客户端的读/写服务。
		接受 DN 汇报的 block 列表信息

NameNode 保存 metadate 信息。
		基于内存存储 ：不会和磁盘发生交换**(但会落地)**;只存在内存中不会持久化

metadate 元数据信息包括以下：

- 文件 owership(归属)、permissions(权限)、大小、时间
- Block 列表：即一个完整文件有哪些 block
- Block 每个副本保存在哪个 DataNode 中（由 DataNode 启动时上报给 NN，因为会随时变化,不保存在磁盘）

NameNode 的 metadate 信息在启动后会加载到内存

​	metadata 存储到磁盘文件名为”fsimage”的镜像文件
		Block 的位置信息不会保存到 fsimage
		edits 记录对 metadata 的操作日志

#### SecondaryNameNode （SNN）

它的主要工作是帮助 NN 合并 edits log 文件，减少 NN 启动时间, 它不是 NN的备份（但可以做备份) )。
	

SNN 执行合并时间和机制
		根据配置文件设置的时间间隔 fs.checkpoint.period 默认 3600 秒
		根据配置文件设置 edits log 大小 fs.checkpoint.size 规定 edits 文件的最大值默认是 64MB

#### DataNode （DN）

存储数据（Block）
		启动 DN 线程的时候会向 NameNode 汇报 block 信息
		通过向 NN 发送心跳保持与其联系（3 秒一次），如果 NN 10 分钟没有收到 DN的心跳，则认为其已经 lost，并 copy 其上的 block 到其它 DN

#### Block 的副本放置策略

第一个副本：放置在上传文件的 DN；如果是集群外提交，则随机挑选一台磁盘不太满，CPU 不太忙的节点

第二个副本：放置在于第一个副本不同的机架的节点上。

第三个副本：与第二个副本相同机架的不同节点。

更多副本：随机节点

![Block 的副本放置策略](.\img\Block 的副本放置策略.png)

 

#### HDFS读写流程（客户端）

###### 读文件

![读文件过程](.\img\读文件过程.png)

```
1.首先调用FileSystem对象的open方法，其实是一个DistributedFileSystem的实例。

2.DistributedFileSystem通过rpc协议获得文件的第一批block的locations地址，（同一个block按照重复数会返回多个locations，因为同一文件的block分布式存储在不同节点上），这些locations按照hadoop拓扑结构排序，距离客户端近的排在前面（就近原则选择）。

3.前两步会返回一个FSDataInputStream对象，该对象会被封装DFSInputStream对象，DFSInputStream可以方便的管理datanode和namenode数据流。客户端调用read方法，DFSInputStream最会找出离客户端最近的datanode并连接。

4.数据从datanode源源不断的流向客户端。

5.如果第一文件的数据读完了，就会关闭指向第一块的datanode连接，接着读取下一文件。这些操作对客户端来说是透明的，客户端的角度看来只是读一个持续不断的流。

6.如果第一批block都读完了， DFSInputStream就会去namenode拿下一批block的locations，然后继续读，如果所有的块都读完，这时就会关闭掉所有的流。 

如果在读数据的时候， DFSInputStream和datanode的通讯发生异常，就会尝试正在读的block的排序第二近的datanode,并且会记录哪个datanode发生错误，剩余的blocks读的时候就会直接跳过该datanode。 DFSInputStream也会检查block数据校验和，如果发现一个坏的block,就会先报告到namenode节点，然后DFSInputStream在其他的datanode上读该block的镜像。

该设计就是客户端直接连接datanode来检索数据并且namenode来负责为每一个block提供最优的datanode， namenode仅仅处理block location的请求，这些信息都加载在namenode的内存中，hdfs通过datanode集群可以承受大量客户端的并发访问。

```

自己理解

```
HDFS会open的方式打开分布式文件存储系统的实例（Didtributed FileSystem）
Didtributed FileSystem会找到ND获取block的位置信息
通过流的方式（FSDataInputStream）去并行的读取DataNode上的数据信息，并将block上的信息拼接在一起
当这一批DataNode数据读取完毕之后，最后close

如果在读取过程中有DataNode挂掉之后，会把当前的管道关闭，重新找另外离客户端第二近的正常的数据节点进行读操作
```



###### 写文件：

 ![写文件过程a](.\img\写文件过程a.png)



```
   1.客户端通过调用DistributedFileSystem的create方法创建新文件。

    2.DistributedFileSystem通过RPC调用namenode去创建一个没有blocks关联的新文件，创建前， namenode会做各种校验，比如文件是否存在，客户端有无权限去创建等。如果校验通过， namenode就会记录下新文件，否则就会抛出IO异常。

    3.前两步结束后，会返回FSDataOutputStream的对象，与读文件的时候相似，FSDataOutputStream被封装成DFSOutputStream。

DFSOutputStream可以协调namenode和datanode。客户端开始写数据到DFSOutputStream，DFSOutputStream会把数据切成一个个小的packet，然后排成队列data quene。

    4.DataStreamer会去处理接受data quene，它先询问namenode这个新的block最适合存储的在哪几个datanode里（比如重复数是3，那么就找到3个最适合的datanode），把他们排成一个管道pipeline输出。DataStreamer把packet按队列输出到管道的第一个datanode中，第一个datanode又把packet输出到第二个datanode中，以此类推。

    5.DFSOutputStream还有一个对列叫ack quene，也是由packet组成等待datanode的收到响应，当pipeline中的datanode都表示已经收到数据的时候，这时ack quene才会把对应的packet包移除掉。 如果在写的过程中某个datanode发生错误，会采取以下几步： 

        1) pipeline被关闭掉；  
        2)为了防止防止丢包ack quene里的packet会同步到data quene里;创建新的pipeline管道怼到其他正常DN上
        3)block剩下的部分被写到剩下的两个正常的datanode中； 
        4)namenode找到另外的datanode去创建这个块的复制。当然，这些操作对客户端来说是无感知的。
        5)客户端完成写数据后调用close方法关闭写入流。

```

| 注意：                                                       |
| ------------------------------------------------------------ |
| 客户端执行 write 操作后，写完的 block 才是可见的，正在写的 block对客户端是不可见的，只有调用 sync 方法，客户端才确保该文件的写操作已经全部完成，当客户端调用 close 方法时，会默认调用 sync 方法。是否需要手动调用取决你根据程序需要在数据健壮性和吞吐率之间的权衡。 |

自己理解

```
HDFS 会通过create的方法打开实例，去调用NameNode创建一个没有blocks关联的新文件,创建前， namenode会做各种校验，比如文件是否存在，客户端有无权限去创建等。如果校验通过， namenode就会记录下新文件，否则就会抛出IO异常(java)。
调用write方法通过FSDataOutputStream流去给单一的DataNode用管道把数据封装成packet数据包（默认512M）通过数据队列发送给DataNode写数据，然后这个含有数据的DataNode会把数据传输给第二个DataNode，以此类推，为的就是提高效率，降低不必要的网络开销。
之后会返回一个ack状态，告诉是否成功

DFSOutputStream还有一个对列叫ack quene，也是由packet组成等待datanode的收到响应，当pipeline中的datanode都表示已经收到数据的时候，这时ack quene才会把对应的packet包移除掉。 如果在写的过程中某个datanode发生错误，会关闭当前管道，把备份的ack packet（监管者的身份）给数据队列通过创建新的管道，写入其他正常的DN上（并且记住坏掉的管道），都写完之后，返回一个成功的状态值，把ack packet队列对应额packet包移除。
如果复制的过程中出现问题，会多试几次，如果不行，会记录错误的节点，并把数据复制给其他的节点。

客户端完成写数据后调用close方法关闭写入流
```



###### 深入DFSOutputStream内部原理

​     ![写文件过程b](.\img\写文件过程b.png)

```
打开一个DFSOutputStream流，Client会写数据到流内部的一个缓冲区中，然后数据被分解成多个Packet，每个Packet大小为64k字节，每个Packet又由一组chunk和这组chunk对应的checksum数据组成，默认chunk大小为512字节，每个checksum是对512字节数据计算的校验和数据。

 ===》当Client写入的字节流数据达到一个Packet的长度，这个Packet会被构建出来，然后会被放到队列dataQueue中，接着DataStreamer线程会不断地从dataQueue队列中取出Packet，发送到复制Pipeline中的第一个DataNode上，并将该Packet从dataQueue队列中移到ackQueue队列中。ResponseProcessor线程接收从Datanode发送过来的ack，如果是一个成功的ack，表示复制Pipeline中的所有Datanode都已经接收到这个Packet，ResponseProcessor线程将packet从队列ackQueue中删除。
====》 在发送过程中，如果发生错误，错误的数据节点会被移除掉，ackqueue数据块同步到dataqueue中，然后重新创建一个新的Pipeline，排除掉出错的那些DataNode节点，接着DataStreamer线程继续从dataQueue队列中发送Packet。

```

### Hadoop1.0环境搭建

##### 准备:

​	克隆三台，确保ping通，JDK，HOSTS,HOSTNAME，免秘钥登录

​	安装JDK：rpm  -ivh  jdk-7u67-linux-x64.rpm

​	Ø  配置JAVA_HOME环境变量：

​	 vi  ~/.bash_profile

```
export JAVA_HOME=/usr/java/jdk1.7.0_67
export PATH=$PATH:$JAVA_HOME/bin
```

​	Ø  HOSTS：vi /etc/hosts

​	Ø  HOSTNAME：vi /etc/sysconfig/network

​	Ø  免密钥登录：

```
A、B
A 生成一对公钥和密钥  ssh-keygen -t rsa
将A ~/.ssh 目录下id_rsa.pub 拷到B ~/.ssh authorized_keys
B再执行上述命令即可
```



##### 开始：

###### 	1、下载并解压缩Hadoop

​		tar -zxvf hadoop-2.6.5.tar.gz

###### 	2、在Hadoop中配置JDK环境

​		/home/hadoop-2.6.5/etc/hadoop/hadoop-env.sh

​		export JAVA_HOME=/usr/java/jdk1.7.0_67

###### 	3、/home/hadoop-2.6.5/etc/hadoop/cor-site.xml

```
<configuration>
	<property>
		<name>fs.defaultFS</name>
		<value>hdfs://node01:9000</value>
	</property>
	<property>
		<name>hadoop.tmp.dir</name>
		<value>/opt/hadoop-2.6.5</value>
	</property>
</configuration
```

###### 	4、/home/hadoop-2.6.5/etc/hadoop/hdfs-site.xml

```
<configuration>
	<property>
		<name>dfs.replication</name>
		<value>3</value>
	</property>
	<property>
		<name>dfs.namenode.secondary.http-address</name>
		<value>node02:50090</value>
	</property>
	<property>
		<name>dfs.namenode.secondary.https-address</name>
		<value>node02:50091</value>
	</property>
</configuration>
```

###### 	5、/home/hadoop-2.6.5/etc/hadoop/

​		新建 masters 文件 写上 SNN 节点名： node2

###### 	6、在/home/hadoop-2.5.1/etc/hadoop/slaves 

​		文件中填写 DN 节点名：node01 node2 node3 

###### 	7、vi ~/.bash_profile 配置系统局部环境变量

```
export PATH
export JAVA_HOME=/usr/java/jdk1.7.0_67
export PATH=$PATH:$JAVA_HOME/bin
export HADOOP_HOME=/home/hadoop-2.6.5
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin                                           
```

###### 	8、将配置好的文件发送到DN节点机器上

​		scp -r ~/.bash_profile node02:/root/

​		scp -r hadoop-2.6.5/ node03:/home/

###### 	9、环境变量生效

​		source ~/.bash_profile

###### 	10、回到根目录下对 **NN** 进行格式化 

​		hdfs namenode -format

###### 	11、关闭防火墙

​		service iptables stop

根目录下，start-dfs.sh 开启集群	网页输入node01: 50070



### API

```
import pyhdfs
# https://pypi.org/project/PyHDFS/
# 读取 hdfs 上文件的文件内容
def read_hdfs_file():
    fs = pyhdfs.HdfsClient(hosts='node01')
    f = fs.open('/Jackie/in/qq.txt')
    lines = f.readline()
    print(lines.decode("utf-8", 'ignore'))	
	f.close
'''在 pyhdfs 中 删除了 upload（）的方法'''
def upload():
    fs=pyhdfs.HdfsClient(hosts='node01')
    f =fs.copy_from_local('D://PycharmProjects//TestPy//temp//text1','/Jackie/text')
    print('----------------------')
'''在 pyhdfs 中 删除了 download（）的方法'''
def download():
    fs = pyhdfs.HdfsClient(hosts='node01')
    fs.copy_to_local('/Jackie/text','D://PycharmProjects//TestPy//temp//text2')
    print('=============')
# 创建文件夹目录
def mkdir_hdfs_dir(mk):
    fs = pyhdfs.HdfsClient(hosts='node01')
    fs.mkdirs(mk)
    print('创建文件夹目录成功')
# 删除文件夹操作
def dele_hdfs_dir(mk):
    fs = pyhdfs.HdfsClient(hosts='node01')
    ex = fs.exists(mk)
    print('文件目录是否存在： ',ex)
    if ex == True:
    fs.delete(mk)
    print('删除文件夹目录成功')
    else:
    fs.mkdirs(mk)
    print('文件夹目录不存在 ，创建成功')
# 查看详细信息
def liststatus(mk):
    fs = pyhdfs.HdfsClient(hosts='node01')
    status = fs.get_file_status(mk)
    print(status)
    print(status.owner)
    print(status.get('accessTime'),status.get('blockSize'),status.get('group'))
    # 查看目录
    print(fs.listdir('/Jackie'))

read_hdfs_file()
# mkdir_hdfs_dir('/jj/jackie')
# dele_hdfs_dir('/jj/jackie')
# liststatus('/Jackie/in/qq.txt')
# upload()
# download()
```


