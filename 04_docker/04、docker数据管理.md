## Docker数据管理

Docker容器中的管理数据主要有两种方式：

- 数据卷：容器内数据直接映射到本地主机环境。
- 数据卷容器：使用特定容器维护数据卷。

#### 1、数据卷

数据卷是一个可供容器使用的特殊目录，它将主机操作系统目录直接映射进容器，类似于Linux的mount行为。

数据卷可以提供很多有用的特性：

- 数据卷可以在容器之间共享和重用，容器间传递数据将变得高效与方便；
- 对数据卷内数据的修改会立马生效，无论是容器内操作 还是本地操作；
- 对数据卷的更新不会影响镜像，解耦开应用和数据；
- 卷会一直存在，直到没有容器使用，可以安全地卸载它。

###### ① 创建数据卷

```
[root@VM_0_9_centos ~]# docker volume create -d local test
test
```

此时，查看`/var/lib/docker/volumes`路径下，会发现所创建的数据卷位置：

```
[root@VM_0_9_centos ~]# ls -l /var/lib/docker/volumes/
drwxr-xr-x 3 root root  4096 Mar  5 10:34 test
```

###### ② 绑定数据卷

除了使用`volume`子命令来管理数据卷外，还可以在创建容器时将主机本地的任意路径挂载到容器内作为数据卷，这种形式创建的数据卷称为绑定数据卷。

使用`docker [container] run`时，可以使用`-mount`选项来使用数据卷。

`-mount`选项支持三种数据类型的数据卷：

- `volume`：普通数据卷，映射到主机`/var/lib/docker/volumes`路径下；
- `bind`：绑定数据卷，映射到主机指定路径下；
- `tmpfs`：临时数据卷，只存在于内存中。

下面使用training/webapp镜像创建一个Web容器，并创建一个数据卷挂载到容器的/opt/webapp目录中：

```
$ docker run -d -P --name web --mount type=bind,source=/webapp,destination=/opt/webapp traning/webapp python app.py
```

上述命令等同于使用旧的`-v`标记可以在容器内创建一个数据卷：

```
[root@VM_0_9_centos ~]# docker run -d -P --name web -v /webapp:/opt/webapp training/webapp python app.py
691ea9aa7132bc0c7ed1f0e8f88cd075bbd96406c8ab5661d73db2a1a1f50553
```

用户可以放置一些程序或数据到本地目录中实时进行更新，然后在容器内运行和使用。

**本地目录的路径必须是绝对路径**，容器内路径可以为相对路径。如果目录不存在，Docker会自动创建。

Docker挂载数据卷的默认权限是读写(rw)，用户也可以通过ro指定为只读：

```
[root@VM_0_9_centos ~]# docker run -d -P --name webs -v /webapp:/opt/webapp:ro training/webapp python app.py
9c3618466bbfdf3962a007420312bf41a0c5b788d74e8f79e223998212305763
```

加了`:ro`之后，容器内对所挂载的数据卷内的数据就无法修改了。

如果直接挂载一个文件到容器，使用文件编辑工具，包括`vi`或者`sed --in-place`的时候，可能会造成文件inode的改变。从Docker1.1.0起，这会导致报错误信息。所以推荐的方式是直接挂载文件所在的目录到容器内。

#### 2、数据卷容器

如果用户需要再多个容器之间共享一些持续更新的数据，最简单的方式是使用数据卷容器。数据卷容器也是一个容器，但是它的目的是专门提供数据卷给其他容器挂载。

首先，创建一个数据卷容器`dbdata`，并在其中创建一个数据卷挂载到/dbdata：

```
[root@VM_0_9_centos ~]# docker run -it -v /dbdata --name dbdata ubuntu
Unable to find image 'ubuntu:latest' locally
Trying to pull repository docker.io/library/ubuntu ... 
latest: Pulling from docker.io/library/ubuntu
6cf436f81810: Pull complete 
987088a85b96: Pull complete 
b4624b3efe06: Pull complete 
d42beb8ded59: Pull complete 
Digest: sha256:7a47ccc3bbe8a451b500d2b53104868b46d60ee8f5b35a24b41a86077c650210
Status: Downloaded newer image for docker.io/ubuntu:latest
root@b376cd800aba:/# ls         
bin   dbdata  etc   lib    media  opt   root  sbin  sys  usr
boot  dev     home  lib64  mnt    proc  run   srv   tmp  var
root@b376cd800aba:/# 
```

然后，可以在其他容器中使用`--volumes-from`来挂载dbdata容器中的数据卷。

例如：创建db1和db2两个容器，并从dbdata容器挂载数据卷：

```
[root@VM_0_9_centos ~]# docker run -it --volumes-from dbdata --name db1 ubuntu
root@3c141ef76ccd:/# 



[root@VM_0_9_centos ~]# docker run -it --volumes-from dbdata --name db2 ubuntu
root@7e023043e5c5:/# 
```

此时，容器db1和db2都挂载同一个数据卷到相同的/dbdata目录，三个容器任何一方在该目录下的写入，其他容器都可以看到。

可以多次使用`--volumes-from`参数来从多个容器挂载多个数据卷，还可以从其他已经挂载了容器卷的容器来挂载数据卷：

```
[root@VM_0_9_centos ~]# docker run -d --name db3 --volumes-from db1 training/postgres
Unable to find image 'training/postgres:latest' locally
Trying to pull repository docker.io/training/postgres ... 
latest: Pulling from docker.io/training/postgres
a3ed95caeb02: Pull complete 
6e71c809542e: Pull complete 
2978d9af87ba: Pull complete 
e1bca35b062f: Pull complete 
500b6decf741: Pull complete 
74b14ef2151f: Pull complete 
7afd5ed3826e: Pull complete 
3c69bb244f5e: Pull complete 
d86f9ec5aedf: Pull complete 
010fabf20157: Pull complete 
Digest: sha256:a945dc6dcfbc8d009c3d972931608344b76c2870ce796da00a827bd50791907e
Status: Downloaded newer image for docker.io/training/postgres:latest
66a1e7696aca5d051186832b1b5e3f081efd4a84f8e5ae2d7228544ca0269101

```

**注意：使用`--volumes-from`参数所挂载数据卷的容器自身并不需要保持在运行状态。**

如果删除了挂载的容器（包括dbdata、db1和db2），数据卷并不会被自动删除。如果要删除一个数据卷，必须在删除最后一个还挂载这它的容器时显式使用`docker rm -v`命令来指定同时删除关联的容器。

#### 3、利用数据卷容器来迁移数据

可以利用数据卷容器对其中的数据卷进行备份、恢复，以实现数据的迁移。

###### ① 备份

使用下面命令来备份dbdata数据卷容器内的数据卷：

```
[root@VM_0_9_centos ~]# docker run --volumes-from dbdata -v $(pwd):/backup --name worker ubuntu tar cvf /backup/backup.tar /dbdata
tar: Removing leading `/' from member names
/dbdata/
```

具体分析：

​	首先利用ubuntu镜像创建了一个容器worker。使用`--volumes-from dbdata`参数来让worker容器挂载dbdata容器的数据卷(即dbdata数据卷)；使用`-v $(pwd):/backup`参数来挂载本地的当前目录到worker容器的/backup目录

​	worker容器启动后，使用`tar cvf /backup/backup.tar /dbdata命令将/dbdata下内容备份为容器内的/backup/backup.tar`，即宿主主机当前目录下的backup.tar。

###### ② 恢复

如果要恢复数据到一个容器，可以按照下面的操作。

首先创建一个带有数据卷的容器dbdata2，然后创建另一个新的容器，挂载dbdata2的容器，并使用untar解压备份文件到所挂载的容器卷中：

```
$ docker run --volumes-from dbdata2 -v $(pwd):/backup busybox tar xvf
```

