#### 一、安装和卸载

###### 安装

1、apt-get install software-properties-common
2、add-apt-repository ppa:nginx/stable 
3、apt-get update
4、apt-get install nginx

###### 卸载

1、**卸载方法一**

apt-get remove nginx  # 删除nginx，保留配置文件
rm -rf /etc/nginx  #删除配置文件

2、**卸载方法二**

删除nginx连带配置文件

apt-get purge nginx

####其他操作

###### **寻找安装目录**

安装完时，界面会给予提示安装在哪的，如果不小心关了，或者刷屏了，可以搜索一下

- 方法一

`whereis nginx`

- 方法二

`find / -name nginx`

###### 启动nginx

寻找到安装目录后（我的是/usr/sbin/nginx），通过cd切换到nginx安装目录下，然后键入命令回车，执行瞬间完成（我这发现看不到任何提示信息）

`nginx`

启动nginx可能发生的错误：
1.nginx.conf配置异常，此时会提示你配置文件哪一行发生错误
2.nginx侦听的端口被其他应用占用了，一般是安装时就已经启动Nginx，可以使用`killall -9 nginx`杀掉进程

###### 检查nginx状态

输入以下指令

nginx -t  #检测配置文件是否正确 
默认安装完应该是正常的，如果状态正常提示：

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```


如果发生状态错误，会进行相应提示，常见的配置错误：
1.增加配置信息时候，忘记在结尾加分号
2.端口冲突，在配置文件中增加了两个server{}配置信息，listen 相同的端口

- 修改nginx.conf
  使用vim进行修改，修改完后记得使用上面的nginx -t命令进行检查是否ok，如果状态ok后进行重启nginx

  vim nginx.conf

  键入如下命令进行停止

  nginx -s stop 
  以上操作可以顺利帮你在ubuntu上安装或卸载nginx，最后，可以在浏览器中访问域名或地址来验证是否安装，如果你看到网页上返回：Welcome to nginx! 恭喜你！