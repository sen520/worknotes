## sqoop

将关系数据库（oracle、mysql、postgresql等）数hadoop数据进行转换的工具

版本：（**两个版本完全不兼容**，sqoop1使用最多）
		sqoop1：1.4.x
		sqoop2：1.99.x版本



sqoop1由client端直接进入hadoop，任务通过解析生成对应的MapReduce执行

![Sqoop](.\img\Sqoop.png)

## 环境搭建

在hadoop03上搭建

1、tar -zxvf sqoop-1.4.6.bin__hadoop-2.0.4-alpha.tar.gz

2、mv sqoop-1.4.6.bin__hadoop-2.0.4-alpha sqoop-1.4.6

3、cd  /home/sqoop-1.4.6/lib   拷贝mysql-connector-java-5.1.32-bin.jar到当前目录下

4、cd  /home/sqoop-1.4.6/conf   mv sqoop-env-template.sh sqoop-env.sh 

5、cd /home/sqoop-1.4.6/bin    vim configure-sqoop

/Moved to be a runtime check in sqoop 查找

注释掉

```
## Moved to be a runtime check in sqoop.
#if [ ! -d "${HBASE_HOME}" ]; then
#  echo "Warning: $HBASE_HOME does not exist! HBase imports will fail."
#  echo 'Please set $HBASE_HOME to the root of your HBase installation.'
#fi

#if [ ! -d "${HCAT_HOME}" ]; then
#  echo "Warning: $HCAT_HOME does not exist! HCatalog jobs will fail."
#  echo 'Please set $HCAT_HOME to the root of your HCatalog installation.'
#fi

#if [ ! -d "${ACCUMULO_HOME}" ]; then
#  echo "Warning: $ACCUMULO_HOME does not exist! Accumulo imports will fail."
#  echo 'Please set $ACCUMULO_HOME to the root of your Accumulo installation.'
#fi
```

6、配置环境变量

```
export SQOOP_HOME=/home/sqoop-1.4.6
export PATH=$PATH:$SQOOP_HOME/bin
```

7、环境变量生效

source ~/.bash_profile 

8、测试  sqoop version

## 启动sqoop

1、关闭防火墙

​	service iptables stop

2、启动mysql

​	service mysqld start

3、测试连接MySQL

查看数据库

sqoop list-databases -connect jdbc:mysql://hadoop01:3306/ -username root -password 123456

查看表

sqoop list-tables -connect jdbc:mysql://hadoop01:3306/mysql -username root -password 123456



#### 将MySQL中的数据 导入 到 HDFS

sqoop import -- connect jdbc:mysql ://hadoop01:3306/test -- username root -- password 123456 -- table myuser - - m1 - - target- -r dir hdfs://zs/my

#### 将MySQL中的数据 导入 到 Hive：

sqoop import --connect jdbc:mysql://hadoop01:306/test --username root --password 123456--table myuser  --hive-import -m 1

(-m 1  一个MapReduce运行)

![Sqoop import01](.\img\Sqoop import01.png)

![Sqoop import02](.\img\Sqoop import02.png)

 将 HDFS /Hive 中的数据导出到 MySQL 

sqoop export --connect jdbc:mysql://hadoop01:3306/test --username root --password 123456 --table myuser--export-dir /root/my



 sqoop export --connect jdbc:mysql://hadoop01:3306/test --username root --password 123456--table myuser--export-dir /my--input-fields-terminated-by '\001’

('\001'表示按默认hive字段分割)

