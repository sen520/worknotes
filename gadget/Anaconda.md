###### 环境配置

Anaconda安装之后的环境变量配置：`D:\Anaconda3\Scripts`（安装目录下的Scripts）

可以通过命令行的方式打开anaconda，也可以通过图形化界面

###### 常用命令

```
conda list  列出所有的已安装的 packages

conda install name 	name 是需要安装 packages 的名字

activate py35 	激活环境

# 创建一个名为 python34 的环境，指定 Python 版本是 3.4（不用管是 3.4.x，conda 会为
我们自动寻找 3.4.x 中的最新版本）
conda create --name python34 python=3.4

# 安装好后，使用 activate 激活某个环境
activate python34 # for Windows
source activate python34 # for Linux & Mac

# 激活后，会发现 terminal 输入的地方多了 python34 的字样，实际上，此时系统做的事情
就是把默认 2.7 环境从 PATH 中去除，再把 3.4 对应的命令加入 PATH
# 此时，再次输入
python --version
# 可以得到`Python 3.4.5 :: Anaconda 4.1.1 (64-bit)`，即系统已经切换到了 3.4 的环
境

# 如果想返回默认的 python 2.7 环境，运行
deactivate python34 # for Windows
source deactivate python34 # for Linux & Mac

# 删除一个已有的环境
conda remove --name python34 --all

# 查看某个指定环境的已安装包
conda list -n python3

# 查找 package 信息
conda search numpy

# 安装 package
conda install -n python34 numpy
# 如果不用-n 指定环境名称，则被安装在当前活跃环境
# 也可以通过-c 指定通过某个 channel 安装

# 更新 package
conda update -n python34 numpy

# 删除 package
conda remove -n python34 numpy

前面已经提到，conda 将 conda、python 等都视为 package，因此，完全可以使用 conda 来
管理 conda 和 python 的版本，例如
# 更新 conda，保持 conda 最新
conda update conda

# 更新 anaconda
conda update anaconda

# 更新 python
conda update python

# 假设当前环境是 python 3.4, conda 会将 python 升级为 3.4.x 系列的当前最新版本
# 更新 conda，保持 conda 最新
conda update conda

# 假设当前环境是 python 3.4, conda 会将 python 升级为 3.4.x 系列的当前最新版本
补充：如果创建新的python环境，比如3.4，运行 conda create -n python34 python=3.4
之后，conda 仅安装 python 3.4 相关的必须项，如 python, pip 等，如果希望该环境像默
认环境那样，安装 anaconda 集合包，只需要：
# 在当前环境下安装 anaconda 包集合
conda install anaconda
# 结合创建环境的命令，以上操作可以合并为
conda create -n python34 python=3.4 anaconda
# 也可以不用全部安装，根据需求安装自己需要的 package 即可
# 在当前环境下安装 anaconda 包集合
conda install anaconda
# 结合创建环境的命令，以上操作可以合并为
conda create -n python34 python=3.4 anaconda
# 也可以不用全部安装，根据需求安装自己需要的 package 即可


# 添加 Anaconda 的 TUNA 镜像
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
# TUNA 的 help 中镜像地址加有引号，需要去掉

# 设置搜索时显示通道地址
conda config --set show_channel_urls yes

# 查看配置信息，可以查看镜像源
conda info 
```





