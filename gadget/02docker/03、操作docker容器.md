## 操作docker容器

容器是docker的另一个核心概念，容器是一个镜像的运行实例。所不同的是，镜像是静态的只读文件，而容器带有运行时需要的可写的文件层，同时容器中的应用进程处于运行状态。

如果认为虚拟机是模拟运行的一套操作系统（包括内核，应用运行环境和其他系统环境）和跑在上面的应用。那么docker容器就是独立运行的一个（一组）应用，以及他们必须的运行环境。

#### 1、创建容器

###### ① 新建容器

docker [container] create

```
$ docker create -it ubuntu:latest
89a89ea8db487a4d266bf556ae9c3c06ca3ba49e533b9ab031bcfa70aab44e55

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                  PORTS               NAMES
89a89ea8db48        ubuntu:latest       "/bin/bash"         8 seconds ago       Created                                     optimistic_varahamihira

```

使用docker 【container】create 命令新建的容器处于停止状态，可以使用docker【container】start 命令来启动它

**create命令与容器运行模式相关的选项**

| 选项                                                 | 说明                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| `-a` , `--attach=[]`                                 | 是否绑定到标准输入、输出和错误                               |
| `-d`, `--detach=true|false`                          | 是否在后台运行容器，默认为否                                 |
| `--detach-keys=""`                                   | 从attach模式退出的快捷键                                     |
| `--entrypoint=""`                                    | 镜像存在入口命令时，覆盖为新的命令                           |
| `--expose=[]`                                        | 指定容器会暴露出来的端口或端口范围                           |
| `--group-add=[]`                                     | 运行容器的用户组                                             |
| `-i`,`--interactive=true|false`                      | 保持标准输入打开，默认为false                                |
| `--ipc=""`                                           | 容器IPC命名空间，可以其他容器或主机                          |
| `--isolation=default`                                | 容器使用的隔离机制                                           |
| `--log-driver="json-file"`                           | 指定容器的日志驱动类型，可以为：json-file、syslog、journald、gelf、fluentd、awslogs、splunk、etwlogs、gcplogs、none |
| `--log-opt=[]`                                       | 传递给日志驱动的选项                                         |
| `--net="bridge"`                                     | 指定容器的网络模式，包括bridge、none、其他容器内网络、host的网络或某个现有网络等 |
| `--net-alias=[]`                                     | 容器在网络中的别名                                           |
| `-p`,`--publish-all=true|false`                      | 通过NAT机制将容器标记暴露的端口自动映射到本地主机的临时端口  |
| `-p`,`--publish=[]`                                  | 指定如何映射到本地主机端口，例如-p 11234-12234:1234-2234     |
| `--pid=host`                                         | 容器的PID命名空间                                            |
| `--userns=""`                                        | 启用userns-remap时配置用户命名空间的模式                     |
| `-uts=host`                                          | 容器的UTS命名空间                                            |
| `-restart="no"`                                      | 容器的重启策略，包括no、on-failure[: max-retry]、always、unless-stopped等 |
| `--rm=true|false`                                    | 容器退出后是否自动删除，不能跟-d同时使用                     |
| `-t`,`--tty=true|false`                              | 是否分配一个伪终端，默认为false                              |
| `--tmpfs=[]`                                         | 挂载临时文件系统到容器                                       |
| `-v|--volume[=[[HOST-DIR:]COMTAONER-DIR[:OPTIONS]]]` | 挂载主机上的文件卷到容器内                                   |
| `--volunme-driver=""`                                | 挂载文件卷的驱动类型                                         |
| `--volume-from=[]`                                   | 从其他容器挂载卷                                             |
| `-w`,`--workdir=""`                                  | 容器内的默认工作目录                                         |

**create命令与容器环境和配置相关的选项**

| 选项                          | 说明                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| `--add-host=[]`               | 在容器内添加一个主机名到IP地址的映射关系（通过/etc/hosts文件） |
| `--device=[]`                 | 映射物理机上的设备到容器内                                   |
| `--dns-search=[]`             | DNS搜索域                                                    |
| `--dns-opt=[]`                | 自定义的DNS选项                                              |
| `--dns`                       | 自定义的DNS服务器                                            |
| `-e`、`--env=[]`              | 指定容器内的环境变量                                         |
| `--env-file=[]`               | 从文件中读取环境变量到容器内                                 |
| `-h`, `--hostname=""`         | 指定容器内主机名                                             |
| `--ip=""`                     | 指定容器内的主机IPv4地址                                     |
| `--ip6=""`                    | 指定容器内的主机IPv6地址                                     |
| `--link=[<name or id>:alias]` | 链接到其他容器                                               |
| `--link-local-ip=[]`          | 容器的本地链接地址列表                                       |
| `--mac-address=""`            | 指定容器的Mac地址                                            |
| `--name=""`                   | 指定容器的别名                                               |

**create命令与容器资源限制和安全保护相关的选项**

| 选项                                         | 说明                                                         |
| -------------------------------------------- | ------------------------------------------------------------ |
| `-blkio-weight=10~1000`                      | 容器读写块设备的I/O性能权重，默认为0                         |
| `--blkio-weight-device=[DEVICE_NAME:WEIGHT]` | 指定各个块设备I/O性能权重                                    |
| `--cpu-shares=0`                             | 允许容器使用CPU资源的相对权重，默认一个容器能用满一个核的CPU |
| `--cap-add=[]`                               | 增加容器的Linux指定安全能力                                  |
| `--cap-drop=[]`                              | 移除容器的Linux指定安全能力                                  |
| `--cgroup-parent=""`                         | 容器cgroups限制的创建路径                                    |
| `--cidfile=""`                               | 指定容器的进程ID号写到文件                                   |
| `--cpu-period=0`                             | 限制容器在CFS调度器下的CPU占用时间片                         |
| `--cpuset-cpus=""`                           | 限制容器能使用哪些CPU核心                                    |
| `--cpuset-mems=""`                           | NUMA架构下使用哪些核心的内存                                 |
| `--cpu-quota=0`                              | 限制容器在CFS调度器下的CPU配额                               |
| `--device-read-bps=[]`                       | 挂载设备的读吞率（以bps为单位）限制                          |
| `--device-write-bps=[]`                      | 挂载设备的写吞率（以bps为单位）限制                          |
| `--device-read-iops=[]`                      | 挂载设备的读速率（以每秒i/o次数为单位）限制                  |
| `--device-write-iops=[]`                     | 挂载设备的写速率（以每秒i/o次数为单位）限制                  |
| `--health-cmd=""`                            | 指定检查容器健康状态的命令                                   |
| `--health-interval=0s`                       | 执行健康检查的间隔时间，单位可以为ms、s、m或h                |
| `--health-retries=int`                       | 健康检查失败重试次数，超过则认为不健康                       |
| `--health-start-period=0s`                   | 容器启动后进行健康检查的等待时间，单位可以为ms、s、m或h      |
| `--health-timeout=0s`                        | 健康检查的执行超时，单位可以为ms、s、m或h                    |
| `--no-healthcheck=true|false`                | 是否禁用健康检查                                             |
| `--init`                                     | 在容器中执行一个init进程，来负责响应信号和处理僵尸状态子进程 |
| `--kernel-memory=""`                         | 限制容器使用内核的内存大小，单位可以是b、k、m或g             |
| `-m`, `--memory=""`                          | 限制容器内应用使用的内存，单位可以是b、k、m或g               |
| `--memory-reservation=""`                    | 当系统中内存过低时，容器会被强制限制内存到给定值，默认情况下等于内存限制值 |
| `--memory-swap="LIMIT"`                      | 限制容器使用内存和交换区的总大小                             |
| `--oom-score-adj=""`                         | 调整容器的内存耗尽参数                                       |
| `--pids-limit=""`                            | 限制容器的pid个数                                            |
| `--privileged=true|false`                    | 是否给容器高权限，这意味着容器内应用将不受权限的限制，一般不推荐 |
| `--read-only=true|false`                     | 是否让容器内的文件系统只读                                   |
| `--security-opt=[]`                          | 指定一些安全参数，包括权限、安全能力、apparmor等             |
| `--stop-signal=SIGTERM`                      | 指定停止容器的系统信号                                       |
| `--shm-size=""`                              | /dev/shm的大小                                               |
| `--sig-proxy=true|false`                     | 是否代理收到的信号给应用，默认为true，不能代理SIGCHLD、SIGSTOP和SIGKILL信号 |
| `--memory-swappiness="0~100"`                | 调整容器的内存交换区参数                                     |
| `-u`,`--user=""`                             | 指定在容器内执行命令的用户信息                               |
| `--userns=""`                                | 指定用户命名空间                                             |
| `--ulimit=[]`                                | 通过ulimit来限制最大文件数、最大进程数等                     |

其他选项还包括：

- `-l`, `--label=[]`：以键值对方式指定容器的标签信息；
- `--label-file=[]`：从文件中读取标签信息。

###### ② 启动容器

`docker 【container】 start`启动一个已经创建的容器(89为id开头两位)

`docker ps` 查看一个运行中的容器

```
$ docker start 89
89

sen@TR-PC MINGW64 /d/Program Files/Docker Toolbox
$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
89a89ea8db48        ubuntu:latest       "/bin/bash"         30 hours ago        Up 7 seconds                            optimistic_varahamihira
```

###### ③ 新建并启动容器

`docker [container]  run`  等价于先执行docker [container] create  ， 再执行docker [container]  start

例如：下面的命令输出一个“hello world”，之后容器自动停止

```
$ docker run ubuntu /bin/echo "hello world"
hello world
```

这和本地直接执行`/bin/echo 'hello world'`相比几乎感觉不出任何区别

docker [container] run  来创建并启动容器时，Docker在后台运行的标准包括：

- 检查本地是否存在指定的镜像，不存在就从共有仓库下载；
- 利用镜像创建一个容器，并启动该容器；
- 分配一个文件系统给容器，并在只读的镜像层外面挂载一层可写层；
- 从宿主主机配置的网桥接口中桥接一个虚拟接口到容器中去；
- 从网桥的地址池配置一个IP地址给容器；
- 执行用户指定的应用程序；
- 执行完毕后容器被自动终止。

下面的命令启动一个bash终端，允许用户进行交互：

```
$ docker run -it ubuntu:18.04 /bin/bash
root@....:/#
```

其中，`-t` 选项让Docker分配一个伪终端并绑定到容器的标准输出上，`-i` 则让容器的标准输入保持打开。更多的命令选项可以通过 `man docker-run` 命令来查看。

对于所创建的bash容器，当用户使用exit命令退出bash进程后，容器也会自动退出。这是因为对于容器来说，当其中的应用退出后，容器的使命完成，也就没有继续运行的必要了。

可以通过docker container  wait  CONTAINER [CONTAINER...] 子命令来等待容器退出，并打印退出返回结果。

某些时候，执行`docker [container] run`  时候因为命令无法正常执行，容器会出错直接退出，此时可以查看退出的错误代码。

默认情况下，错误代码包括：

- 125：Docker deamon 执行出错，例如指定了不支持的Docker命令参数；
- 126：所指定命令无法执行，例如权限出错；
- 127：容器内命令无法找到。

命令执行后出错，会默认返回命令的退出错误码。

###### ④ 守护态运行

更多时候，需要让Docker容器在后台以守护态形式运行。此时，可以通过添加`-d`参数来实现。

容器启动后会返回一个唯一的id，也可以通过`docker ps` 或 `docker  container ls`  命令来查看容器信息

###### ⑤ 查看容器输出

要获取容器的输出信息，可以通过`docker [container] logs`  命令。

该命令支持的选项包括：

- `-details`：打印详细信息；
- `-f`，`-follow`：持续保持输出；
- `-since string`：输出从某个时间开始的日志；
- `-tail string`：输出最近的若干日志；
- `-t`，`-timestamps`：显示时间戳信息；
- `-until string`：输出某个时间之前的日志。

例如，查看某容器的输出可以使用如下命令：

```
$ docker logs ......
```

#### 2、停止容器