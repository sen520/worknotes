## 一、docker 获取镜像：

```
docker pull ubuntu:18.04  获取ubuntu18.04系统的基础镜像
docker pull ubuntu  获取最新版ubuntu
docker pull hub.c.163.com/public/ubuntu:18.04  从网易蜂巢获取ubuntu 18.04系统镜像
```

pull 支持选项

- -a,  --all-tags=true | false: 是否获取仓库中所有镜像， 默认为否
- --disable-content-trust: 取消镜像的内容校验，默认为真

此外，可以在Docker服务启动配置中增加  `--registry-mirror=proxy_URL`来指定镜像代理服务地址（如：https://registry.docker-cn.com）

## 二、查看镜像信息

#### 1、images 命令列出镜像

`docker images` 或者  `docker image ls`

```
$ docker images
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
scrapinghub/splash   latest              3926e5aac017        11 months ago       1.22GB
```

**列出信息中，可以看到几个字段信息**

- REPOSITORY   来自哪个仓库
- TAG  镜像的标签信息，latest表示版本信息
  - 标签只是标记，并不能标识镜像内容
  - 用于标记来自同一仓库的不同镜像
- IMAGE ID  镜像ID（唯一标识镜像）
  - 如果两个镜像ID相同，说明他们实际上指向了同一个镜像，只是标签名称不同
  - 一般可以使用该ID的前若干个字符组成的可区分串来代替完整的ID
- CREATED  创建时间，说明镜像的最后更新时间
- SIZE  镜像大小
  - 优秀的镜像往往体积都较小
  - 表示的是镜像的逻辑体积大小，实际上由于相同的镜像层本地只会存储一份，物理上占用的存储空间会小于各镜像逻辑体积之和

**image子命令主要支持选项**：

- `-a `,  `-all=true | false`: 列出所有的（包括临时文件）镜像文件，默认为否

- `--digests=true | false`: 列出镜像的数字摘要值，默认为否

- `-f `, ` --filter=[]` : 过滤列出镜像，如dangling=true 只显示没有被使用的镜像， 也可指定带有特定标注的镜像等

- `--format="TEMPLATE"` : 控制输出格式，如`.ID`代表ID信息， `.Repository`代表仓库信息

- `--no-trunc=true|false` : 对输出结果中太长的部分是否进行截断，如ID， 默认是false

- `-q` ,`--quiet=true|false` :  仅输出ID信息，默认为false

  其中，还支持对输出结果进行控制的选项， 如 `-f`, `--filter=[]`, `--notrunc=true|false`, `-q`, `--quiet=true | false`

- 更多子命令还可以通过 `man docker -images` 查看

#### 2、使用tag命令添加镜像标签

​	实际上起到了类似链接的作用

```
$ docker tag ubuntu:latest myubuntu:latest

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker images
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
myubuntu             latest              20bb25d32758        3 days ago          87.5MB
ubuntu               latest              20bb25d32758        3 days ago          87.5MB
scrapinghub/splash   latest              3926e5aac017        11 months ago       1.22GB
```

#### 3、使用inspect命令查看详细信息

```
$ docker inspect ubuntu:18.04
[
    {
        "Id": "sha256:20bb25d32758db4f91b18a9581794cfaa6a8c5fbad80093e9a9e42211e131a48",
        "RepoTags": [
            "myubuntu:latest",
            "ubuntu:18.04",
            "ubuntu:latest"
        ],
        "RepoDigests": [
            "ubuntu@sha256:945039273a7b927869a07b375dc3148de16865de44dec8398672977e050a072e"
        ],
        "Parent": "",
        "Comment": "",
        "Created": "2019-01-22T22:41:28.350121367Z",
        "Container": "1777162cb05fa6d1d943be26346c8127a8ad2fa2df3ff0d53d5fa768714b2ecc",
        "ContainerConfig": {
            "Hostname": "1777162cb05f",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/sh",
                "-c",
                "#(nop) ",
                "CMD [\"/bin/bash\"]"
            ],
            "ArgsEscaped": true,
            "Image": "sha256:1497d63c8adfb96cfccfaba0eacc2d269d07cc49047d5e0ec8fe53e37d7e9d93",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": {}
        },
        "DockerVersion": "18.06.1-ce",
        "Author": "",
        "Config": {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/bash"
            ],
            "ArgsEscaped": true,
            "Image": "sha256:1497d63c8adfb96cfccfaba0eacc2d269d07cc49047d5e0ec8fe53e37d7e9d93",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": null
        },
        "Architecture": "amd64",
        "Os": "linux",
        "Size": 87475457,
        "VirtualSize": 87475457,
        "GraphDriver": {
            "Data": {
                "LowerDir": "/mnt/sda1/var/lib/docker/overlay2/adf7c930b8b440dcfb5c968145f57a3c7f8ec8fdfb6c3a559ad58a92fcdb3f42/diff:/mnt/sda1/var/lib/docker/overlay2/3a417e85881816cc6647326e8bb654634ae88e53f3c659499cc8d764ce113468/diff:/mnt/sda1/var/lib/docker/overlay2/9b924520253fbf5e4d9b8a4753bd414f4ce0dbcadcdeed11dcb746321cb170fa/diff",
                "MergedDir": "/mnt/sda1/var/lib/docker/overlay2/166872e0c7950e01acd0e3bc3ba663074f4701cb98ccabdef9365269424c823a/merged",
                "UpperDir": "/mnt/sda1/var/lib/docker/overlay2/166872e0c7950e01acd0e3bc3ba663074f4701cb98ccabdef9365269424c823a/diff",
                "WorkDir": "/mnt/sda1/var/lib/docker/overlay2/166872e0c7950e01acd0e3bc3ba663074f4701cb98ccabdef9365269424c823a/work"
            },
            "Name": "overlay2"
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:adcb570ae9ac70d0f46badf9ee0ecd49fbec2ae0bc26254653f99afa60046a4e",
                "sha256:7604c8714555c5c681ce97ab9114c24d5b128e248724bd3e8389f3ccbe1f09a4",
                "sha256:9e9d3c3a74581b0bb947e9621526ccec317d3cae000bc3c5d7b7f892bc1b4baa",
                "sha256:27a216ffe82565764e05e8e0166a2505242bbf4c359a2eaf737e0a4b9d3c3000"
            ]
        },
        "Metadata": {
            "LastTagTime": "2019-01-26T02:51:38.460681503Z"
        }
    }
]

```

#### 4、使用history命令查看镜像历史

该命令将列出各层的创建信息

```
$ docker history ubuntu:18.04
IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
20bb25d32758        3 days ago          /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B
<missing>           3 days ago          /bin/sh -c mkdir -p /run/systemd && echo 'do…   7B
<missing>           3 days ago          /bin/sh -c rm -rf /var/lib/apt/lists/*          0B
<missing>           3 days ago          /bin/sh -c set -xe   && echo '#!/bin/sh' > /…   745B
<missing>           3 days ago          /bin/sh -c #(nop) ADD file:38a199e521f5e9007…   87.5MB
```

注意：过长的信息被自动截断了，可以用 `--no-trunc`来输出完整信息



## 三、搜寻镜像

docker search [option] keyword

支持的选项

- `-f`, `--filter filter` : 过滤输出内容

- `--format string` : 格式化输出内容

- `--limit int` : 限制输出结果，默认25个

- `--no-trunc` : 不截断输出结果

  

搜索官方提供的带Nginx关键字的镜像

```
$ docker search --filter=is-official=true nginx
NAME                DESCRIPTION                STARS               OFFICIAL            AUTOMATED
nginx               Official build of Nginx.   10785               [OK]
```

搜索所有收藏数超过4的关键词包括TensorFlow的镜像

```
$ docker search --filter=stars=4 tensorflow
NAME                             DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
tensorflow/tensorflow            Official Docker images for the machine learn…   1273                                  
jupyter/tensorflow-notebook      Jupyter Notebook Scientific Python Stack w/ …   109                                   
xblaster/tensorflow-jupyter      Dockerized Jupyter with tensorflow              52                                      [OK]
tensorflow/serving               Official images for TensorFlow Serving (http…   35                                    
floydhub/tensorflow              tensorflow                                      15                                      [OK]
bitnami/tensorflow-serving       Bitnami Docker Image for TensorFlow Serving     13                                      [OK]
opensciencegrid/tensorflow-gpu   TensorFlow GPU set up for OSG                   7                                      
tensorflow/tf_grpc_server        Server for TensorFlow GRPC Distributed Runti…   7                                     
```

## 四、删除和清理镜像

#### 1、使用标签删除镜像

`docker rmi` 或 `docker image rm`

- 当镜像有两个或以上的标签时，只仅仅删除标签本身，不影响镜像
- 当镜像只有一个镜像的时候， 就会删除这个镜像所有文件层

```
$ docker images
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
myubuntu             latest              20bb25d32758        3 days ago          87.5MB
ubuntu               18.04               20bb25d32758        3 days ago          87.5MB
ubuntu               latest              20bb25d32758        3 days ago          87.5MB
scrapinghub/splash   latest              3926e5aac017        11 months ago       1.22GB

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker rmi myubuntu:latest
Untagged: myubuntu:latest

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker images
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
ubuntu               18.04               20bb25d32758        3 days ago          87.5MB
ubuntu               latest              20bb25d32758        3 days ago          87.5MB
scrapinghub/splash   latest              3926e5aac017        11 months ago       1.22GB
```

支持选项

- `-f` , `-force` : 强制删除镜像，即便有容器依赖它
- `-no-prne` : 不要清理未带标签的父镜像

#### 2、使用镜像ID来删除镜像

docker rmi 后面跟上镜像的ID（也可以是区分的部分ID串前缀），会尝试先删除所有指向该镜像的标签，然后删除该镜像文件本身。

但，有该镜像创建的容器存在时，镜像文件默认是无法被删除的。

`docker ps -a` 可以查看本机上存在的所有容器

使用`-f` 可以强行删除（不推荐）

应该是先删除容器，在删除镜像

```
sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker rm 506537568a78
506537568a78

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker rmi 20bb25d32758
Untagged: ubuntu:latest
Untagged: ubuntu@sha256:945039273a7b927869a07b375dc3148de16865de44dec8398672977e050a072e
Deleted: sha256:20bb25d32758db4f91b18a9581794cfaa6a8c5fbad80093e9a9e42211e131a48
Deleted: sha256:7b2bffd1a66cacd8cd989f06cee49a1fba28c1d149806a0f7b536229270ddfd2
Deleted: sha256:80f6e37bc2041d00cbd950851c20f0f16b81b8f323290f354279a8a7b62bb985
Deleted: sha256:2069390c92947b82f9333ac82a40e3eeaa6662ae84600a9b425dd296af105469
Deleted: sha256:adcb570ae9ac70d0f46badf9ee0ecd49fbec2ae0bc26254653f99afa60046a4e

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker images
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
scrapinghub/splash   latest              3926e5aac017        11 months ago       1.22GB
```

#### 3、清理镜像

`docker image prune`清理临时镜像文件

- `-a` , `-all` : 删除所有无用镜像，不光是临时镜像
- `-filter filter` :  只清理符合给定过滤器的镜像
- `-f` , `-force` ：强行删除镜像，而不进行提示确认 

清理临时的遗留镜像文件层，，最后会提示释放的存储空间

```
$ docker image prune -f
Total reclaimed space: 0B
```

## 五、创建镜像

#### 1、基于已有的容器创建

`docker [container] commit [options] CONTAINER  [REPOSITORY[:TAG]]`

- `-a` ,  `--author=""`  :  作者信息；
- `-c` ,  `--change=[]`  :  提交的时候执行Dockerfile 指令，包括`CMD|ENTRYPOINT|ENV|EXPOSE|LABEL|ONBULLD|USER|VOLUME|WORKDIR `等；
- `-m` ,  `--message=""` :  提交信息；
- `-p` , `--pause=true`  :  提交时暂停容器运行

启动一个镜像，并在其中进行修改操作

​	创建一个test文件

```
$ docker run -it ubuntu /bin/bash
root@632d42bede53:/# touch test
root@632d42bede53:/# exit
exit
```

此时该容器和原ubuntu镜像相比，已经发生了改变。可以用docker commit 命令来提交一个新的镜像。提交时，可以使用ID或名称来指定容器。

顺利的话，可以返回新创建镜像的ID信息

```
$ docker commit -m "Added a new file" -a "Docker Newbee" 632d42bede53 test:0.1
sha256:eb34cf66ffd8bde3e275853fab4c9840ac3c06d5a8d0472e9d32f82b7c4a6a1f

$ docker images
REPOSITORY                     TAG                 IMAGE ID            CREATED             SIZE
test                           0.1                 eb34cf66ffd8        7 seconds ago       120MB
```

#### 2、基于本地模板导入

用户也可以直接从一个操作系统模板文件导入一个镜像，主要使用`docker [container] import`命令。

命令格式为`docker [image] import [OPTIONS] file|URL|-[REPOSITORY[:TAG]]`

要直接导入一个镜像，可以使用`OpenVZ`提供的模板来创建， 或者用其他已导出的镜像模板来创建。OPENVZ模板下载地址为 `http://openvz.org/Download/templates/precreated`

```
sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ cat ubuntu.tar | docker import - ubuntu:18.04
sha256:5c7b00783d07192ea2af11f83b6847d2826cbdbc7eafd79c7e3693bef43b8858

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker images
REPOSITORY                     TAG                 IMAGE ID            CREATED             SIZE
ubuntu                         18.04               5c7b00783d07        5 seconds ago       124MB
ubuntu                         latest              5b1075c8fe30        38 seconds ago      124MB
test                           0.1                 eb34cf66ffd8        37 minutes ago      120MB
scrapinghub/splash             latest              3926e5aac017        11 months ago       1.22GB
hub.c.163.com/library/ubuntu   latest              ccc7a11d65b1        17 months ago       120MB
```

#### *3、基于Dockerfile创建（后面会介绍）

Dockerfile是一个文本文件，利用给定的指令描述基于某个父镜像创建新镜像的过程

**实例**：

​	基于debian:stretch-slim镜像安装python3环境，构成一个python3的镜像

    FROM debian:stretch-slim
    LABEL version="1.0" maintainer="docker user <docker_user@github>"
    
    RUN apt-get update && \
    	apt-get install -y install python3 && \
    	apt-get clean && \
    	rm -rf /var/lib/apt/lists/*

创建镜像的过程可以使用 `docker [image] build`命令，编译成功后本地将多出一个python：3的镜像

```
$ docker [image] bulid -t python:3
...
Successfully built 4b10f46eacc8
Successfully tagged python:3
$ docker images|grep python
python 3 4b10f46eacc8 About a minute ago    95.01MB
```

## 六、存出和载入镜像

`docker [image] save` 和 `docker [image] load`

#### 1、存出镜像

`docker [image] save` 支持`-o` ,  `-output string`参数，导出镜像到指定的文件中

```
$ docker save -o ubuntu.tar ubuntu
```

#### 2、载入镜像

`docker [image] load` 将导出的tar文件再导入本地镜像库。 支持`-i` , `-input string`选项，从指定的文件中读入镜像内容 。

```
$ docker load -i ubuntu.tar
The image ubuntu:latest already exists, renaming the old one with ID sha256:5b1075c8fe309f0318d81b3365050afe10773df73425f8c1a8ef965190d195b4 to empty string
Loaded image: ubuntu:latest

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker load < ubuntu.tar
Loaded image: ubuntu:latest
```

## 七、上传镜像

`docker [image] push`上传镜像到仓库， 默认上传到docker hub（需要登录），命令格式：`docker [image] push NAME[:TAG] | [REGISTRY_HOST[:REGISTRY_PORT]/]NAME[:TAG]`

**例如**：

​	用户user上传本地test: latest镜像，可以先添加新的标签 user/test:latest，然后用`docker [image] push`命令上传镜像：

```
$ docker tag ubuntu:latest user/test:latest

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker push user/test:latest
The push refers to repository [docker.io/user/test]
```

