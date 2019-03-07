## 1、基本结构

​	Dockerfile主体内容分为四部分：`基础镜像信息`，`维护者信息`，`镜像操作指令`，`容器启动时执行指令`

```
# escape=\ (backslash)
# This dockerfile uses 七he ubuntu:xeniel image
# VERS工ON 2 - EDITION 1
# Author: docker_user
# Command format: Ins七ruction [arguments / command]

# Base image to use, this must be set as the first line
FROM ubuntu:xeniel

＃ Maintainer: docker_user <docker_user at email.com> （ @docker_user ）
LABEL maintainer docker user<docker user@email.com>
# Commands to upda七e the image
RUN echo "deb http://archive.ubuntu.com/ubuntu/ xeniel main universe"
apt/sources.list
>> /etc/apt/sources.list

RUN apt-getupdate && apt-get install -y nginx
RUN echo "\ndaemon off;" >> /etc/nginx/nginx.conf
# Commands when creating a new container
CMD /usr/sbin/nginx
```

​	首行可以通过注释来指定解析器命令，后续通过注释说明镜像的相关信息。主体部分首先使用FROM指令说明所基于的镜像名称，接下来一般是使用LABEL指令说明维护者信息。后面则是镜像操作指令，例如RUN指令将对镜像执行跟随的命令。每运行一条RUN指令，镜像添加新的一层，并提交。最后是CMD指令，来指定运行容器时的操作命令。

例如：

```
FROM debain:jessie

LABEL maintainer docker_user<docker_user@email.com>

ENV NGINX_VERSION 1.10.1-1-jessie

RUN apt-key adv --keyserver hkp://pgp.mit.edu:80 --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62 \
        && echo "deb http://ngix.org/packages/debian/ jessie ngix" >> /etc/apt/sources.list \
        && apt-get update \
        && apt-get install --no-install-recommends --no-install-suggest -y \
        ca-certificates \
        nginx=${NGINX_VERSION} \
        nginx-module-xslt \
        nginx-module-geoip \
        nginx-module-image-filter \
        nginx-module-perl \
        nginx-module-njs \
        gettext-base \
        && rm -rf /var/lib/apt/lists/*

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
        && ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80 443
CMD ["nginx","-g","daemon off;"]

```

## 2、指令说明

#### 1、分类

###### ① 配置指令

- `ARG`			定义创建镜像过程中使用的变量
- `FROM`			指定所创建镜像的基础镜像
- `LABEL`			为生成的镜像添加元数据标签信息
- `EXPOSE`			声明镜像内服务监听的端口
- `ENV`			指定环境变量
- `ENTRYPOINT`		指定镜像的默认入口命令
- `VOLUME`			创建一个数据卷挂载点
- `USER`			指定运行容器时的用户名或UID
- `WORKDIR`		配置工作目录
- `ONBUILD`		创建子镜像时指定自动执行的操作指令
- `STOPSIGNAL`		指定退出的信号值
- `HEALTHCHECK`	配置所启动容器如何进行健康检查
- `SHELL`			指定默认shell类型

###### ② 操作指令

- `RUN`	运行指定命令
- `CMD`	启动容器时指定默认执行的命令
- `ADD`	添加内容到镜像
- `COPY`	复制内容到镜像

#### 2、配置指令

- ARG

  定义创建镜像过程中使用的变量。

  格式：`ARG <name>[=<default value>]`

  ​	在执行`docker build`时，可以通过`-build-arg[=]`来为变量赋值。当镜像编译成功后，ARG指令的变量将不再存在（ENV指定的变量将在镜像中保留）。

  ​	Docker内置了一些镜像创建变量，用户可以直接使用而无须声明，包括（不区分大小写）HTTP_PROXY、HTTPS_PROXY、FTP_PROXY、NO_PROXY。

- FROM

  指定所创建镜像的基础镜像。

  格式：`FROM <image> [AS <name>]` 或 `FROM <image>:<tag> [AS <name>]` 或 `FROM <image>@<digest> [AS <name>]`。

  ​	任何Dockerfile中的第一条指令必须为`FROM`指令。并且。如果在同一个Dockerfile中创建多个镜像时，可以使用多个`FROM`指令（每个镜像一次）

  ​	为了保证镜像精简，可以选用体积较小的镜像如`Alpine`或`Debian`作为基础镜像，例如：

  ```
  ARG	VERSION=9.3
  FROM debian:${VERSION}
  ```

-  LABEL

  LABEL指令可以为生成的镜像添加元数据标签信息。这些信息可以用来辅助过滤出特定镜像。

  格式：`LABEL <key>=<value> <key>=<value>...`。

  例如：

  ```
  LABEL version="1.0.0-rc3"
  LABEL author="yeasy@github" date="2020-01-01"
  LABEL description="This text illustrates\
  	that label-value can span multiple lines."
  ```

- EXPOSE

  声明镜像内服务监听的端口。

  格式为：`EXPOSE <port> [<port>/<protocol>...]`

  例如：

  ```
  EXPOSE 22 80 8443
  ```

  ​	注意该指令只是起到声明作用，并不会自动完成端口映射。

  ​	如果要映射端口出来，在启动容器时可以使用`-P`参数（Docker主机会自动分配一个宿主主机的临时端口）或`-p HOST_PORT:CONTAINER_PORT`参数（具体指定所映射的本地端口）。

- ENV

  指定环境变量，在镜像生成过程中会被后续RUN指令使用，在镜像启动的容器中也会存在。、

- ENTRYPOINT

- VOLUME

- USER

- WORKDIR

- ONBUILD

- STOPSIGNAL

- HEALTHCHECK

- SHELL

