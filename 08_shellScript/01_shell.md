- `#! /bin/bash`是一行特殊的脚本声明，表示此行以后的语句通过`/bin/bash`程序来解释执行。
- 其他情况下的`#`开头的语句表示注释信息。
- 直接通过`./*.sh`的方式执行脚本，要求文件本身具有x权限；可以通过`sh first.sh` 或`. first.sh`来执行脚本语句。

#### 1、echo

用来输出字符串，以使脚本的输出信息更容易读懂。

#### 2、管道

提取磁盘的使用率

```shell
root@senUbuntu:~/alpha# df -hT
Filesystem     Type      Size  Used Avail Use% Mounted on
udev           devtmpfs  976M     0  976M   0% /dev
tmpfs          tmpfs     200M  2.7M  197M   2% /run
/dev/vda1      ext4       40G   13G   25G  35% /
tmpfs          tmpfs     997M     0  997M   0% /dev/shm
tmpfs          tmpfs     5.0M     0  5.0M   0% /run/lock
tmpfs          tmpfs     997M     0  997M   0% /sys/fs/cgroup
tmpfs          tmpfs     200M     0  200M   0% /run/user/0
root@senUbuntu:~/alpha# df -hT | grep "/$" | awk '{print $6}'
36%

```

#### 3、变量

定义变量`变量名=变量值`，等号左右没有空格，变量名需要以字母或者下划线开头，名称中不要包含特殊字符。

```shell
root@senUbuntu:~/alpha# name=zs
root@senUbuntu:~/alpha# age=12
root@senUbuntu:~/alpha# echo $name $age
zs 12
root@senUbuntu:~/alpha# echo $name12

root@senUbuntu:~/alpha# echo $name1.2
.2
root@senUbuntu:~/alpha# echo ${name}1.2
zs1.2
```

###### 1、双引号(")

双引号主要起界定字符串的作用，特别是当要赋值的内容中包含空格时，必须以双引号括起来；其他情况下双引号通常可以省略。

在双引号的范围内，使用`$`符号可以引用其他变量的值(变量引用)，从而能够直接调用现有变量的值来赋给新的变量。

```shell
root@senUbuntu:~/alpha# wi=weixin 5.0
5.0: command not found
root@senUbuntu:~/alpha# wi="weixin 5.0"
root@senUbuntu:~/alpha# echo $wi
weixin 5.0

root@senUbuntu:~/alpha# Version="8.0"
root@senUbuntu:~/alpha# QQ="QQ$Version"
root@senUbuntu:~/alpha# echo $QQ
QQ8.0

```

###### 2、单引号(')

当要赋值的内容中包含`$` `”` `\` 等具有特殊含义的字符时，应使用单引号括起来。在单引号的范围内，将无法引用其他变量的值，任何字符均作为普通字符看待，但赋值内容中包含单引号时，需要使用`\'`符号进行转义。

```bash
root@senUbuntu:~/alpha# QQ='QQ$Version'
root@senUbuntu:~/alpha# echo $QQ
QQ$Version

```

###### 3、反撇号(`)

反撇号主要用于命令替换，允许将执行某个命令的屏幕输出结果赋值给变量，反撇号括起来的范围内必须是能够执行的命令行，否则将会出错。

例如：

```shell
root@senUbuntu:~/alpha# ls -lh `which useradd`
-rwxr-xr-x 1 root root 124K Mar 23 03:05 /usr/sbin/useradd
```

需要注意的是，使用反撇号难以在一行命令中实现嵌套命令替换操作，这时可以改用`$()`来代替反撇号操作，以解决嵌套问题，例如查询提供`useradd`命令程序的软件包所安装的配置文件位置

```shell
root@senUbuntu:~/alpha# rpm -qc $(rpm -qf $(which useradd))
package file is not installed
package /usr/sbin/useradd is not installed
package is is not installed
package not is not installed
package owned is not installed
package by is not installed
package any is not installed
package package is not installed
```

上述操作相当于连续执行了两条命令：先通过`which useradd`命令查找useradd命令的程序位置，然后根据查找结果列出文件属性，执行过程中，会用`which useradd`命令的输出结果替换整个反撇号范围。

###### 4、read命令

read命令用来提示用户输入信息，从而实现简单的交互过程。执行时将从标准输入设备读入一行内容，并以空格为分隔符，将读入的个字段挨个赋值给指定的变量。若指定的变量只有一个，则将整行内容赋值给此变量。

```shell
root@senUbuntu:~/alpha# read ToDir1
/opt/backup/
root@senUbuntu:~/alpha# echo $ToDir1
/opt/backup/
```

read命令可以结合`-p`和`-t`选项来设置提示信息和等待时间(单位为秒)，如提示用户输入备份文件路径

```shell
root@senUbuntu:~/alpha# read -p "请指定备份文件存放目录" ToDir2
请指定备份文件存放目录/opt/backup
root@senUbuntu:~/alpha# echo $ToDir2
/opt/backup
```

###### 5、设置变量的作用范围

默认情况下，新定义的变量只在当前Shell环境中有效，因此成为局部变量。当进入**子程序**或者新的**子shell**环境时，局部变量将无法使用。

为了使用户定义的变量在所有子Shell环境中能够继续使用，减少重复设置工作，可以通过内部命令`Export`将指定的变量导出为全局变量。

使用export导出全局变量的同时，也可以为变量进行赋值，这样在新定义全局变量时就不需要提前进行赋值了

```shell
root@senUbuntu:~/alpha# echo $name
zs
root@senUbuntu:~/alpha# bash
root@senUbuntu:~/alpha# echo $name

root@senUbuntu:~/alpha# exit
exit
root@senUbuntu:~/alpha# export name
root@senUbuntu:~/alpha# bash
root@senUbuntu:~/alpha# echo $name
zs
```

###### 6、数值变量的运算

在Bash Shell环境中，只能进行简单的整数运算，不支持小数运算。

整数值的运算主要通过内部命令expr进行，基本格式如下。需要注意，运算符与变量之间必须有至少一个空格

`expr 变量1 运算符 变量2 运算符`

**注意：**乘法不能用*， 需要转义。

其中，变量1、变量2对应为需要计算的数值变量(需要以“$”符号调用)。

![运算符](.\img\运算符.png)

```shell
root@senUbuntu:~/alpha# x=35
root@senUbuntu:~/alpha# y=42
root@senUbuntu:~/alpha# expr $x + $y
77
root@senUbuntu:~/alpha# expr $x \* $y
1470
root@senUbuntu:~/alpha# expr $x - $y
-7
root@senUbuntu:~/alpha# expr $x / $y
0
root@senUbuntu:~/alpha# expr $x % $y
35
```

若要将运算结果赋值给其他变量，可以结合命令替换操作(使用反撇号)。例如：

```shell
root@senUbuntu:~/alpha# Ycube=`expr $y \* $y \* $y`
root@senUbuntu:~/alpha# echo $Ycube
74088
```

使用`expr`进行计算时，变量必须是整数，不能是字符串，也不能含小数，否则会出错。

除了`expr`命令外，变量数值常见的命令还包括：(())、let等。如果要执行简单的整数运算，只需要将指定特定对的算术表达式用`$((`和`))`括起来即可。

```shell
root@senUbuntu:~/alpha# bb=$((1+2**3-4))
root@senUbuntu:~/alpha# echo $bb
5
```

同样的，所涉及的参数变量必须为整数，不能是小数或是字符串。

#### 4、特殊变量

- 环境变量
- 位置变量
- 预定义变量

###### 1、环境变量

环境变量指的是处于运行需要而由Linux系统提前创建的一类变量，主要用于设置用户的工作环境，包括用户宿主目录、命令查找路径、用户当前目录、登录终端等。

使用`env`命令可以查看到当前工作环境下的环境变量，对于常见的一些环境变量，应了解其各自的用途。

例如：

- `USER`表示用户名称
- `HOME`表示用户的宿主目录
- `LANG`表示语言和字符集
- `PWD`表示当前所在的工作目录
- `PATH`表示命令搜索路径等。

PATH变量用于设置可执行程序的默认搜索路径，当仅指定文件名称来执行命令程序时，Linux系统将在PATH变量指定的目录范围查找对应的可执行文件

在Linux系统中，环境变量的全局配置文件为/etc/profile，在此文件中定义的变量作用于所有用户。除此之外，每个用户还有自己的独立配置文件(~/.profile)。若要长期变更或设置某个环境变量，应在上述文件中进行设置。

###### 2、位置变量

为了在使用shell脚本程序时，方便通过命令行为程序提供操作参数，Bash引入了位置变量的概念。当执行命令行操作时，第一个字段表示命令名或脚本程序名，其余的字符串参数按照从左到右的顺序依次赋值给位置变量。

位置变量也称位置参数，使用``