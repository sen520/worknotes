# 软件安装和管理
## 软件包
1.  bin文件.bin (适合所有Linux发行版) ，bin是可以执行文件。
2. rpm包 ，yum（redhat系列）
3. 源码压缩包 （适合所有的Linux发行版）
4. 官方已经编译好的，下载软件包直接可以使用（绿色软件）

## 1. bin的安装与卸载
### 1.1 安装

1. 首先要赋予可执行权限
        
        chmod u+x 文件名
2. 直接执行
        
        ./文件名
3. 配置相应的环境变量
    
### 1.2 卸载
1. 删除安装的文件夹
2. 删除环境变量

## 2. rpm的安装与卸载
> rpm 包，已经编译之后的应用程序
### 2.1 安装
1. 检查是否已经安装

          rpm -qa | grep 文件名
2. 下载软件包
3. 安装
	依赖

        rpm -i /PATH/TO/PACKAGE_FILE
        	-h: 以#显示进度；每个#表示2%; 
        	-v: 显示详细过程
        	-vv: 更详细的过程
        	
        rpm -ivh /PATH/TO/PACKAGE_FILE
        
        	--nodeps: 忽略依赖关系；
        	--replacepkgs: 重新安装，替换原有安装；
        	--force: 强行安装，可以实现重装或降级；


### 2.2 卸载
1. 检查是否已经安装

          rpm -qa | grep 文件名
2. 如果有

        rpm -e 文件名
    如果没有
        直接去usr下删除文件
3. 删除环境变量



### 2.3 注意
> 安装过程中不需要你去指定安装路径。rpm文件在制作的时候已经确定了安装路径。

	
### 2.4 rpm 查询
- rpm -q PACKAGE_NAME： 查询指定的包是否已经安装
- rpm -qa : 查询已经安装的所有包

- rpm -qi PACKAGE_NAME: 查询指定包的说明信息；
- rpm -ql PACKAGE_NAME: 查询指定包安装后生成的文件列表；
- rpm -qc PACEAGE_NEME：查询指定包安装的配置文件；
- rpm -qd PACKAGE_NAME: 查询指定包安装的帮助文件；

- rpm -q --scripts PACKAGE_NAME: 查询指定包中包含的脚本
	
- rpm -qf /path/to/somefile: 查询指定的文件是由哪个rpm包安装生成的；
	
> 如果某rpm包尚未安装，我们需查询其说明信息、安装以后会生成的文件；
- rpm -qpi /PATH/TO/PACKAGE_FILE
- rpm -qpl 

### 2.5 rpm 升级
> 如果装有老版本的，则升级；否则，则安装
- rpm -Uvh /PATH/TO/NEW_PACKAGE_FILE
> 如果装有老版本的，则升级；否则，退出
- rpm -Fvh /PATH/TO/NEW_PACKAGE_FILE：
	- --oldpackage: 降级

	
### 2.6 rpm 安装特点
1. 无法指定安装目录。
2. 存在依赖关系。（jar之间的依赖）
3. rpm下载
	
## 3 yum安装
> 本地yum源配置: 管理rpm软件包
1. 解决rpm下载问题
2. 解决rpm文件的查询
3. 解决rpm安装问题
4. 解决了rpm的依赖

使用yum的前提：

要让本机可以联网，如果联不网可以修改文件/etc/resolv.conf

增加 nameserver 192.168.1.1

### 3.1 安装
1. 确定yum 源里是否有要安装的包

        yum search 包名
2. 安装软件
        
        yum install 包名
### 3.2 卸载
    yum remove 包名

### 3.3 其他命令
#### 3.3.1 list
    list: 列表 
        available：可用的，仓库中有但尚未安装的
        installed: 已经安装的
        updates: 可用的升级
#### 3.3.2 执行命令时参数
    yum [options] [command] [package ...]
    
    -y: 自动回答为yes
    --nogpgcheck
#### 3.3.4 清里缓存
    yum clean 

clean: 清理缓存
    	[ packages | headers | metadata | dbcache | all ]
#### 3.3.5  makecache  构建缓存
    yum makecache
#### 其它
- repolist: 显示repo列表及其简要信息

    	all
    	enabled： 默认
    	disabled

- update: 升级
- update_to: 升级为指定版本


- info: 
- search:
- provides| whatprovides:
> 查看指定的文件或特性是由哪个包安装生成的; 
- groupinfo
- grouplist
- groupinstall
- groupremove
- groupupdate

### 3.4 yum源的配置
#### 3.4.1 位置

    /etc/yum.repos.d
    
#### 3.4.2 文件含义

    	[local base]
         name=localbase
         baseurl=file:///mnt/
         enabled=1
         gpgcheck=0
         gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-6
- name 库名称
- baseurl 包所放的位置 
    - 网络地址：http://
    - 本地地址：file://
- enabled 是否开启
    - 1 开启
    - 0 关闭
- gpgcheck 是否检查
    - 1 是
    - 0 否
- gpgkey 检查的位置

#### 3.4.3 获取源的方法
1. 光盘
    1. 插入光盘（rpm文件）
    2. 挂载光驱到/mnt/目录中  mount /dev/cdrom /mnt
    3. 修改yum的配置文件，只留下一个配置文件即可
2. 网络
    1. [网易](http://mirrors.163.com/)  http://mirrors.163.com/
    2. [阿里云](http://mirrors.aliyun.com/)  http://mirrors.aliyun.com/

#####  在yum上下载到本地
1. 配置好yum源（配置要在哪下的位置）
2. 下载
3. 
        reposync -r 下载哪一个库[base] -p 下载到哪
        reposync -r base -p /var/repo
**注意**
如果上面的命令不能识别命令：
`yum install createrepo yum-utils -y`


## 4 手动编译安装

### 4.1 源码安装步骤：
1. 下载
2. 查看源码
3. 准备编译环境
    
    
4. 检查（依赖，兼容），预编译
5. 编译
6. 安装

gcc: GNU C Complier, C
g++: 





## 安装步骤
### 1.bin安装
1. 将安装文件放到linux下，在这我们以`/home`为目录
2. 给文件的可执行权限 `chmod u+x 软件名`
3. 执行安装 `./软件名`
4. 将文件移动到`/opt`文件夹下

        mv   安装好的文件夹名   /opt
5. 配置环境变量,修改PATH
    
        vi ~/.bashrc
        #在.bashrc下输入
        PATH=$PATH：软件的目录/bin
        
** 注意** 软件名是 文件的全名

### 2.rpm安装

1. 将安装文件放到linux下，在这我们以`/home`为目录
2. 执行安装命令
        `rpm -ivh 软件名`
3. 配置环境变量,修改PATH
    
        vi ~/.bashrc
        #在.bashrc下输入
        PATH=$PATH：软件的目录/bin

### 3.yum安装

`yum install 软件名`