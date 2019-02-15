# python3.x
1. 下载
[python3.x](https://www.python.org/downloads/source/)
2. 在linux中解压 

        tar -zxvf Python-3.6.1
3. 准备编译环境

        yum install gcc
4. 准备安装依赖包 zlib，openssl,python的pip需要依赖这两个包

        yum install zlib* openssl*
5. 预编译：


    ./configure --prefix=/usr/python-3.6.1 --enable-optimizations
6. 安装

        make install
7. 配置环境变量PATH：
    - 配置的目的：让系统帮我自动找到命令执行文件路径。
    - path值：一堆目录，每个目录之间用:隔开。
    - vim  ~/.bashrc 在文件的最后一行新建一行

            PATH=$PATH:/usr/python-3.6.1/bin

    - 保存退出

    - 执行命令 `source ~/.bashrc`,为了加载~/.bashrc这个文件


错误演示：

zipimport.ZipImportError: can't decompress data; zlib not available
