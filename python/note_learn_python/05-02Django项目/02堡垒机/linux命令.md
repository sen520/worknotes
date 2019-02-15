vi /etc/sysconfig/network  配置主机名

vi /etc/sysconfig/network-scripts/ifcfg-eth0  配置ip

vi /etc/host ip和主机名绑定

history 历史命令

history -c 删除历史命令

id, whoami  查看当前用户

su - 用户名   切换用户

chmod 777 -r xxx 更改权限

cat xx > xxx 读出xx的内容，并写入到xxx（覆盖）



centos修改pip镜像源

```
[root@localhost ~]# cd 
[root@localhost ~]# mkdir .pip
[root@localhost ~]# cd .pip
[root@localhost .pip]# vim pip.conf

写入如下内容
[global]
index-url=http://pypi.douban.com/simple
trusted-host = pypi.douban.com
```



centos01  无秘钥登录  centos02

需要centos01生成秘钥，把公钥拷贝到centos02

​	生成秘钥命令`ssh-keygen`     

​		.ssh/.id_rsa 私钥

​		.ssh/.id_rsa.pub 公钥

​	把公钥拷贝到centos02  /root/.ssh/（如果没有这个文件夹，说明没有登陆过别人）,改名为`authorized_keys`

​	apt-cache search openssl搜索可用包