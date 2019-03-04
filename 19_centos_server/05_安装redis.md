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