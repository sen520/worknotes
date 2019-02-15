从本地添加文件到 HDFS

```sh
# 把本地文件 put 到 hdfs 空间  把本地的 zookeeper.out 文件，put 到 hdfs 的根目录下
hadoop fs -put /root/zookeeper.out /
```

创建文件夹

```sh
# 穿件文件夹，注意要斜杠
hadoop fs -mkdir /test
```

移动文件（重命名）

```sh
hadoop fs -mv /test/zookeeper.out /test/stefan.out
```

查看文件内容

```sh
hadoop fs -cat /test/stefan.out
```

删除文件、文件夹

```sh
# 删除文件
hadoop fs -rm /test/xx.out

# 删除文件夹
hadoop fs -rm -r /test
```

复制 ( 文件和文件夹 )

```sh
# 把 file.txt 复制到 /test 文件夹
hadoop fs -cp /file.txt /test
```

列出文件信息

```sh
hadoop fs -ls /
```

单独启动某个服务

```sh
hadoop-deamon.sh start namenode
```

