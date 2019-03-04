安装前注意: 此教程是通过yum安装的.仅限64位centos系统

安装步骤:

###### 1、创建仓库文件: 

`vi /etc/yum.repos.d/mongodb-org-3.4.repo`

 然后复制下面配置,保存退出

`[mongodb-org-3.4]``name=MongoDB Repository``baseurl=https:``//repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.4/x86_64/``gpgcheck=1``enabled=1``gpgkey=https:``//www.mongodb.org/static/pgp/server-3.4.asc`

######  2、yum安装

```
`yum install -y mongodb-org`
```

 没有权限就在前面加:   sudo

安装完毕后修改配置文件:

```
vi /etc/mongod.conf
```

修改配置文件的 `bind_ip,` 默认是 `127.0.0.1 只限于本机连接`。所以安装完成后必须把这个修改为 0.0.0.0 ,否则通过别的机器是没法连接的!

###### 3、启动、停止、重启

MongoDB默认将数据文件存储在`/var/lib/mongo`目录，默认日志文件在`/var/log/mongodb`中。如果要修改,可以在 `/etc/mongod.conf` 配置中指定备用日志和数据文件目录。

启动命令:

`service mongod start`

 停止命令:

`service mongod stop`

 重启命令:

`service mongod stop`

查看mongoDB是否启动成功:

可以通过查看日志文件

`cat /``var``/log/mongodb/mongod.log`

 日志文件应该会出现如下一句说明

```
[initandlisten] waiting for connections on port <port>
```

<port> 是mongodb运行端口

也可以通过下面命令检查是否启动成功

`chkconfig mongod ``on`

######  4、使用

`[root@instance-d0nk2r2c ~]# mongo` `## 查看数据库``> show dbs;` `## 查看数据库版本``> db.version();` `## 常用命令帮助``> db.help();`

######  5、卸载移除mongo

`yum erase $(rpm -qa | grep mongodb-org)`

######  6、移除数据库文件和日志文件

`rm -r /``var``/log/mongodb``rm -r /``var``/lib/mongo`

###### 7、通过外部访问mongodb

vim /etc/mongod.conf 

```
net:
  port: 27017
  bindIp: 0.0.0.0   # Listen to local interface only, comment to listen on all interfaces.


```

