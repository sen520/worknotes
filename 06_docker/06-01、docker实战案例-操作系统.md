#### 一、BusyBox

BusyBox是一个集成了一百多个最常用的Linux命令（如cat、echo、grep、mount、telnet等）的精简工具箱，只有2MB不到的大小。可用于多款POSIX环境的操作系统中。

###### 1、 获取官方镜像

```
[root@VM_0_9_centos ~]# docker pull busybox:latest
Trying to pull repository docker.io/library/busybox ... 
latest: Pulling from docker.io/library/busybox
Digest: sha256:061ca9704a714ee3e8b80523ec720c64f6209ad3f97c0ff7cb9ec7d19f15149f
Status: Image is up to date for docker.io/busybox:latest
[root@VM_0_9_centos ~]# docker images
docker.io/busybox              latest              d8233ab899d4        2 weeks ago         1.2 MB
```

2、运行busybox

启动一个busybox镜像，并在容器中执行grep命令：

```
[root@VM_0_9_centos ~]# docker run -it busybox
/ # grep
...
/ # mount
...
```

#### 二、Alpine

###### 1、简介

​	Alpine操作系统是一个面向安全的轻型linux发型版，关注安全，性能和资源效能。采用了musl  libc 和BusyBox以减小系统体积和运行时资源消耗，比BusyBox功能上更完善，在保持瘦身的同时，Alpine还提供了包管理工具apk查询和安装软件包。

​	Alpine Docker镜像继承了Alpine Linux发型版的这些优势。Docker官方推荐使用Alpine作为默认的基础镜像环境：镜像下载速度加快，镜像安全性提高，主机之间切换更方便，占用更少的磁盘空间

###### 2、获取并使用

```
docker.io/busybox              latest              d8233ab899d4        2 weeks ago         1.2 MB
docker.io/ubuntu               latest              47b19964fb50        3 weeks ago         88.1 MB
docker.io/alpine               latest              caf27325b298        4 weeks ago         5.53 MB
docker.io/centos               latest              1e1148e4cc2c        2 months ago        202 MB

```

3、迁移至Alpine基础镜像

安装软件包时，可以使用apk工具

$ apk add --no-cache \<package>

#### 三、ubuntu

#### 四、centos