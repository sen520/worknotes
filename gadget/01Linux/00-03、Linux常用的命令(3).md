
## 1 文件的内容显示
- cat 显示全部
- more: 分屏幕显示，只能向后翻
- less: 分屏幕显示，可以向上翻

- head:查看前n行  默认10行
- tail:查看后n行
	- -n 
    - -f: 查看文件尾部，不退出，等待显示后续追加至此文件的新内容；
## 2 管道 |
> 管道符左边命令的输出就会作为管道符右边命令的输入
head -2 文件名 | tail -1 

## 2 find 查找文件命令 
- find pass *在当前目录下查找以pass 开头的文件
- find /etc/pass* 在/etc目录中查找以 pass开头的文件

## 3 grep 在文件内容中查找关键字
grep “rpm” /etc/passwd 在/etc/passwd文件中查找关键字 rpm

## 4 文本处理
cut、sort、join、sed、awk

### 4.1 cut
- -d: 指定字段分隔符，默认是空格
- -f: 指定要显示的字段
	- -f 1,3
	- -f 1-3
	
            aaabbcaaa
          aa bbc aaa
          bb bbc bbb
          asgodssgoodsssagodssgood
          asgodssgoodsssagoodssgod
          sdlkjflskdjf3slkdjfdksl
          slkdjf2lskdjfkldsjl
**举例**

`cut -d ':' -f1 文件名`
### 4.2 sort
- -n：数值排序
- -r: 降序
- -t: 自定义分隔符
- -k: 以哪个字段为关键字进行排序
- -u: 排序后相同的行只显示一次
- -f: 排序时忽略字符大小写

        banana 12
      apple 1
      orange 8

### 4.3 wc (word count) 文本统计
- -l
- -w
- -c
- -L


## 5 sed：行编辑器

`sed [options] 'AddressCommand' file ...`
- options
    - -n: 静默模式，不再默认显示模式空间中的内容
    - -i: 直接修改原文件
    - -e SCRIPT -e SCRIPT:可以同时执行多个脚本
    - -r: 表示使用扩展正则表达式

- Command
    - d: 删除符合条件的行；
    - a \string: 在指定的行后面追加新行，内容为string
    	\n：可以用于换行
    - i \string: 在指定的行前面添加新行，内容为string
    - r FILE: 将指定的文件的内容添加至符合条件的行处
    - w FILE: 将地址指定的范围内的行另存至指定的文件中; 
    - s/pattern/string/修饰符: 查找并替换，默认只替换每行中第一次被模式匹配到的字符串
    - g: 行内全局替换
    - i: 忽略字符大小写





## 5 练习
1. 统计/usr/bin/目录下的文件个数；

        # ls /usr/bin | wc -l

2. 判断 /home目录是否有文件

3. 取出当前系统上所有用户的shell，要求，每种shell只显示一次，并且按顺序进行显示；

         # cut -d: -f7 /etc/passwd | sort -u
4. 取出/etc/inittab文件的第6行；

         # head -6 /etc/inittab | tail -1
5. 取出/etc/passwd文件中倒数第9个用户的用户名和shell，显示到屏幕上并将其保存至/tmp/users文件中；

         # tail -9 /etc/passwd | head -1 | cut -d: -f1,7 | tee /tmp/users
6. 显示/etc目录下所有以pa开头的文件，并统计其个数；

         # ls -d /etc/pa* | wc -l

