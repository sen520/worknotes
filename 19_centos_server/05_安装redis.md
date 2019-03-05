## 下载安装包

```
wget http://download.redis.io/releases/redis-4.0.2.tar.gz
```

## 解压安装包并安装

```
tar xzf redis-4.0.2.tar.gz
cd redis-4.0.2
make
make install
```

## 启动和停止Redis

### 启动Redis

#### 直接启动

> 直接运行redis-server即可启动Redis

```
[root@localhost bin]# redis-server
```

### 停止Redis

> 考虑到 Redis 有可能正在将内存中的数据同步到硬盘中，强行终止 Redis 进程可能会导致数据丢失。正确停止Redis的方式应该是向Redis发送SHUTDOWN命令，方法为：

```
redis-cli SHUTDOWN
```

## 配置外网链接

```
Ctrl +c关闭连接
vim /root/redis-4.0.2/redis.conf
找到bind 127.0.0.1并注释掉
修改 protected-mode 属性值为no （或者 127.0.0.1:6379> config set protected-mode "no" ）
注：redis默认是只能本地访问，注释掉并叫保护模式禁用以后可以IP访问
修改daemonize属性将no 改为yes
注：该属性是将redis后台运行

 如果iptables 没有开启6379端口，用这个方法开启端口
/sbin/iptables -I INPUT -p tcp --dport 6379 -j ACCEPT  
/etc/rc.d/init.d/iptables save
重启服务
redis-server/etc/redis.conf
```

