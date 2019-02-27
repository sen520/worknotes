# 常用的命令

## 1.Linux的基本原则：
1. 一切皆文件；
2. 配置文件保存为纯文本格式；


## 2.交互的方式(接口)
- GUI接口：

    - GUI: Graphic User Interface
	    - Windows
	    - X-Window
		- Gnome
		- KDE ： centos
		- Xface
- CLI接口：
    - CLI: Command Line Interface
    	- sh
    	- bash
    	- csh
    	- ksh
    	- zsh
    	- tcsh

	- 命令提示符、prompt、 bash(shell)
    	- #: root
    	- $: 普通用户
	- 命令：
        - 命令格式：
    
             >命令  选项  参数

		- 选项：
			- 短选项： -
		
				> 多个选项可以组合：-a -b = -ab
			
            - 长选项： --
                > --list

	    - 参数：命令的作用对象


## 3.常用命令
	
### 3.1 cd(change directory)

>cd:改变当前目录到指定目录

### 3.2 pwd(Printing Working directory)
>pwd:打印当前的工作目录
## 3.3 ls(list)
> ls 查看当前目录的内容
#### 3.3.1
- -l：长格式
	- 文件类型：
		- -：普通文件 (f)
		- d: 目录文件
		- b: 块（字节）设备文件 (block)
		- c: 字符 character)
		- l: 符号链接文件(symbolic link file)
		- p: 命令管道文件(pipe)
		- s: 套接字文件(socket)
	- 文件权限：9位，每3位一组，3组 权限（U,G,O）每一组：rwx(读，写，执行), r-- ，第一组：文件的属主用户权限。第二组：文件的属组用户权限，第三组：其他用户权限
	- 文件硬链接的次数
	- 文件的属主(owner)
	- 文件的属组(group)
	- 文件大小(size)，单位是字节
	- 时间戳(timestamp)：最近一次被修改的时间
		- 访问:access
		- 修改:modify，文件内容发生了改变
		- 改变:change，metadata，元数据
- -h：做单位转换
- -a: 显示以.开头的隐藏文件
	. 表示当前目录
	.. 表示父目录
- -A
- -d: 显示目录自身属性
- -i: index node, inode
- -r: 逆序显示
- -R: 递归(recursive)显示

![image](http://img.blog.csdn.net/20170820002015682?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvemh1b3lhXw==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)
### 3.4 type
>显示指定属于哪种类型
#### 3.4.1 命令类型
- 内置命令(shell内置)，内部，内建
- 外部命令：在文件系统的某个路径下有一个与命令名称相应的可执行文件

### 3.5 获得命令的使用帮助：
- 内部命令：

	   help COMMAND 比如：help cd
- 外部命令：

    	COMMAND --help 比如：date --help
	
- 命令手册：manual
        
        man COMMAND

    - whatis COMMAND
        - 1：用户命令(/bin, /usr/bin, /usr/local/bin)
        - 2：系统调用
        - 3：库用户
        - 4：特殊文件(设备文件)
        - 5：文件格式(配置文件的语法)
        - 6：游戏
        - 7：杂项(Miscellaneous)
        - 8：管理命令(/sbin, /usr/sbin, /usr/local/sbin)
    - MAN：
    	- NAME：命令名称及功能简要说明
    	- SYNOPSIS：用法说明，包括可用的选项
    	- DESCRIPTION：命令功能的详尽说明，可能包括每一个选项的意义
    	- OPTIONS：说明每一个选项的意义
    	- FILES：此命令相关的配置文件
    	- BUGS：
    	- EXAMPLES：使用示例
    	- SEE ALSO：另外参照
    - 翻屏：
    	- 向后翻一屏：SPACE
    	- 向前翻一屏：b
    	- 向后翻一行：J/ENTER
    	- 向前翻一行：k
    - 查找：
        - /KEYWORD: 向后
        - n: 下一个
        - N：前一个 

    - q: 退出
### 3.5 cp
### 3.6 mv

## 4. 文件系统：
rootfs: 根文件系统 /

- /etc：配置文件
- /home：用户的家目录，每一个用户的家目录通常默认为/home/USERNAME
- /root：管理员的家目录
- /bin: 可执行文件, 用户命令
- /sbin：管理命令
- /boot: 系统启动相关的文件，如内核、initrd，以及grub(bootloader)
- /dev: 设备文件
	- 设备文件：
		- 块设备：随机访问，数据块
		- 字符设备：线性访问，按字符为单位
		- 设备号：主设备号（major）和次设备号（minor）
- /lib：库文件
	- 静态库,  .a
	- 动态库， .dll, .so (shared object)
	- /lib/modules：内核模块文件
- /lib64
- /opt：可选目录，第三方程序的安装目录
- /usr： 系统级的目录
    - /usr/local：用户级的程序目录，用户自己编译的软件默认会安装到这个目录下
- /var: 存放需要随时改变的文件，如系统日志、脱机工作目录
---
- /media：挂载点目录，移动设备
- /mnt：挂载点目录，额外的临时文件系统
- /proc：伪文件系统，内核映射文件(不重启的情况下管理系统)
- /sys：伪文件系统，跟硬件设备相关的属性映射文件
- /tmp：临时文件, /var/tmp
- /lost+found: 存放一些系统检查结果，发现不合法的文件或数据都存放在这里;丢失的文件（比如异常断电）


## 5.路径
> 路径:从起点到达一个终点，中间所经过的节点列表

> 绝对路径：以跟目录为起点到目标的路径。
> 相对路径：以当前目录为起点到目标的路径

## 6. 练习
- 使用date单独获取系统当前的年份、月份、日、小时、分钟、秒
- echo是内部命令还是外部命令？ 其作用？
- 如何显示 echo “The year is 2013."  "Today is 26.”为两行？

