# 1.文件夹的操作

## 1.1 mkdir：(make directory)创建空目录
- -p:
- -v: verbose

### 举例
/root/x/y/z

mkdir -pv /mnt/test/x/m /mnt/test/y

mkdir -pv /mnt/test/{x/m,y}

## 1.2 tree：查看目录树
`yum -y install tree`
## 1.3 rmdir (remove directory)  删除目录
删除空目录
	-p
	
# 2. 文件创建和删除
## 2.1 touch 创建文件
- -a
- -m
- -c
## 2.2 stat 查看文件信息

### 文件有三种时间：
- 最后一次访问时间
- 最后一次修改时间：内容的改动叫修改
- 最后一次改变时间：文件（内容和元数据）的改动叫改变

### 一个文件有两种数据：元数据，内容数据
- 内容数据：文件内容本身
- 元数据：除了内容数据之外的。

## 2.3 文件编辑器

### 2.3.1 nano

### 2.3.2 vi(另外一个文件)

# 3 rm: 删除文件
- -i  删除之前确认
- -f  删除之前不确认
- -r  递归删除

**注意：**

rm -rf /    linux自杀

# 4 cp (copy) 文件的复制
## 4.1 普通复制
cp SRC DEST
- -r
- -i 存在覆盖前确认
- -f 

cp file1 file2 

可以做到以下操作：
- 一个文件到一个文件
- 多个文件到一个目录
    
cp /etc/{passwd,inittab,rc.d/rc.sysinit} /tmp/

## 4.2 scp 网络拷贝

- scp root@192.168.239.139:/home/x/1.txt .
- scp -r x/ root@192.168.239.139:/home

# 5 mv (move) 移动文件
- mv SRC DEST
- mv -t DEST SRC

# 6 小结命令

- 目录管理：
ls、cd、pwd、mkdir、rmdir、tree

- 文件管理：
touch、stat、file、rm、cp、mv、nano,vi,vim

- 日期时间：
date、clock、hwclock、cal ,ntpdate

- 查看文本：
cat、tac、more、less、head、tail ，find，grep
