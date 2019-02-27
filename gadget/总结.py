django
django-admin startproject name
python manage.py runserver + 端口号
python manage.py startapp name
python manage.py makemigrations name
python manage.py migrate name
python manage.py inspectdb>movie/models.py
python manage.py shell
python manage.py createsuperuser
第一步：浏览器发起请求并携带参数
第二步：控制层接收到参数，并将结果返回到视图层
第三步：视图层获取控制层的结果后转化成浏览器能识别的
		HTML 代码并返回给控制层
第四步：控制层将视图层的 HTML 代码返回给浏览器，浏览
		器再进行展示。


SQL与ORM的优缺点
    相对来说，ORM的缺点就是SQL的优势地方，而优点也是SQL的劣势地方。
        优点：
            方便的使用面向对象，语句清晰
            防注入『这个其实不算ORM的核心，因为比如Phalcon的SQL形式写法也可以防注入』
            方便动态构造语句，对于不同的表的相同操作采用多态实现更优雅
            一定程度方便重构数据层『比如改表名，字段名等』
            设置钩子函数
        缺点：
            不太容易处理复杂查询语句
            性能较直接用SQL差


model unique 唯一性
	  blank、null  空


models对象.objects.filter
					get
request.POST.get
request.GET.get

分页功能
def get_moves_ByNum(num,size=20):
    #查询当前页面的数据
    movies= Movie.objects.all()[((num-1)*size):(num*size)]
    return movies

def get_preNum(currentNum):
    if (currentNum-1)<=0:
        return 1
    return currentNum-1

def get_nextNum(currentNum):
    return currentNum+1

def index_view(request):
    #获取当前页码数
    num = request.GET.get('num','1')
    #转换数据类型
    currentNum = int(num)
    #获取上一页页码数
    pre_num = get_preNum(currentNum)
    #获取下一页页码数
    next_num = get_nextNum(currentNum)
    #查询数据库中的所有电影信息
    movies= get_moves_ByNum(currentNum)
    return render(request,'movie/index.html', {'movies':movies,'pre_num':pre_num,'next_num':next_num})


  conn=MySQLdb.connect(host='xxxxx',user='xxxx',passwd='xxxx',db='xxxx',port=xxxx)  
    cur=conn.cursor()  
    i = 0  
    md5 = f1.readline()  
    sql = "SELECT file_md5 FROM `v_scanresult_all` where cert_md5='%s'"%md5.split('\n')[0]#数据库查询语句，可根据实际需求修改  
    cur.execute(sql)#执行数据库查询语句  
    result = cur.fetchall()#获取查询结果  


from random import randint
print(randint(1,100))




spider
引擎从调度器中取出一个链接(URL)用于接下来的抓取
引擎把URL封装成一个请求(Request)传给下载器
下载器把资源下载下来，并封装成应答包(Response)
爬虫解析Response
解析出实体（Item）,则交给实体管道进行进一步的处理
解析出的是链接（URL）,则把URL交给调度器等待抓取
scrapy startproject name
scrapy genspider name URL
scrapy crawl name
scrapy genspider -t crawl name URL
scrapy shell URL

分布式爬虫 继承 rediscrawlspider
rediskey
客户机 scrapy runspider name
主机   redis 中 lpush（rediskey） URL

普通爬虫   继承	scrapy.spider

splash docker 
docker run -p 8050:8050 scrapinghub/splash
redis 6379 
mongodb 27017
mysql 3306

class FilmPipeline(object):
    def open_spider(self,spider):
        self.client = pymongo.MongoClient('localhost',27017)
        self.film = self.client.film
    def process_item(self, item, spider):
        self.film.film_info.insert_one(dict(item))
        return item

    def close_spider(self,spider):
        self.client.close()

class MysqlPipeline(object):
    def open_spider(self,spider):
        self.client = pymysql.connect(host='127.0.0.1', port=3306, user='root', password='123456', db='film',
                                      charset='utf8')
        self.cursor = self.client.cursor()
    def process_item(self, item, spider):
        sql = 'insert into t_film values (0,%s,%s,%s,%s,%s,%s)'
        self.cursor.execute(sql,[item['name'],item['perform'],item['director'],item['classification'],item['time'],item['introduce'],])
        self.client.commit()
        return item

    def close_spider(self,spider):
        self.cursor.close()
        self.client.close()

class ImageDownLoadPipeline(ImagesPipeline):
    def get_media_requests(self, item, info):
        yield scrapy.Request(item['img_url'], meta={'item': item})

    def file_path(self, request, response=None, info=None):
        item = request.meta['item']
        file_name = item['img_name']

        return file_name


udp
	--- User Data Protocol，用户数据报协议， 
	是一个无连接的简单的面向数据报的传输层协议。 
	UDP不提供可靠性， 它只是把应用程序传给IP层的数据报发送出去， 
	但是并不能保证它们能到达目的地。 由于UDP在传输数据报前不用在客户
	和服务器之间建立一个连接， 且没有超时重发等机制， 故而传输速度很快 
	UDP一般用于多点通信和实时的数据业务
 
TCP
面向连接的协议，也就是说，在收发数据前，必须和对方建立可靠的连接
一个TCP连接必须要经过三次“对话”才能建立起来（三次握手）
tcp服务器流程如下：1. socket创建一个套接字  2. bind绑定ip和port
3. listen使套接字变为可以被动链接    4. accept等待客户端的链接
5. recv/send接收发送数据

TCP与UDP的区别： 
1.基于连接与无连接
2.对系统资源的要求（TCP较多，UDP少）
3.UDP程序结构较简单
4.流模式与数据报模式 
5.TCP保证数据正确性， 保证数据顺序，相对于udp而言，要慢一些  
web服务器都是使用TCP协议
 UDP可能丢包，不保证数据顺序
listen()   把主动套接字编程被动套接字



HTTP请求方式：
	GET 获取数据		POST修改数据
	PUT 保存数据		DELETE 删除
	OPTION 询问服务器的某种支持特性
	HEAD  返回报文头 


mysql 模糊查询
匹配单个字符：_
	SELECT * FROM t_bookinfo WHERE book_name LIKE 'Python_';
匹配多个字符：%
SELECT * FROM t_bookinfo WHERE book_name LIKE 'Python%';
更新数据
update 表名 set 列1=值1,... where 条件

MongoDB 查询语句
db.集合名.find({条件文档})





 NoSQL和关系数据库的区别？
a. SQL数据存在特定结构的表中；而NoSQL则更加灵活和可扩展，
	存储方式可以省是JSON文档、哈希表或者其他方式。

b. 在SQL中，必须定义好表和字段结构后才能添加数据，例如定
	义表的主键(primary key)，索引(index),触发器(trigger),
	存储过程(stored procedure)等。表结构可以在被定义之后
	更新，但是如果有比较大的结构变更的话就会变得比较复杂。
	在NoSQL中，数据可以在任何时候任何地方添加，不需要先定义表。

c. SQL中如果需要增加外部关联数据的话，规范化做法是在原表
	中增加一个外键，关联外部数据表。而在NoSQL中除了这种规范
	化的外部数据表做法以外，我们还能用其他的非规范化方式把外
	部数据直接放到原数据集中，以提高查询效率。缺点也比较明显，
	更新审核人数据的时候将会比较麻烦。


d. SQL中可以使用JOIN表链接方式将多个关系数据表中的数据用
	一条简单的查询语句查询出来。NoSQL暂未提供类似JOIN的查询
	方式对多个数据集中的数据做查询。所以大部分NoSQL使用非规
	范化的数据存储方式存储数据。

e. SQL中不允许删除已经被使用的外部数据，而NoSQL中则没有
	这种强耦合的概念，可以随时删除任何数据。

f. SQL中如果多张表数据需要同批次被更新，即如果其中一张表
	更新失败的话其他表也不能更新成功。这种场景可以通过事务来
	控制，可以在所有命令完成后再统一提交事务。而NoSQL中没有
	事务这个概念，每一个数据集的操作都是原子级的。
g. 在相同水平的系统设计的前提下，因为NoSQL中省略了JOIN
	查询的消耗，故理论上性能上是优于SQL的。

# 一个列表中，只有一个数字只出现了1次，其余均为2次，要求输出这个只出现一次的数字
# 用一次遍历实现
# 例如：列表[1,1,2,2,45,45,3] 输出3
def num(l):
    a = ''
    for i in range(0,len(l)):
        if l[i] != a:
            if l[i] in l[i+1:]:
                # print(l[i])
                a = l[i] 
                continue
            else:
                print("-----%s"%l[i])

l = [1,1,4,2,2,45,45,3]
num(l)



# 例如：字符串 abcde  abedea 输出 4

def num(str1,str2):
    count = 0
    if len(str1) < len(str2):
        for i in range(0,len(str1)-1):
            if str1[i] == str2[i]:
                count += 1
        print(count)
    else:
        for i in range(0,len(str2)-1):
            if str1[i] == str2[i]:
                count += 1
        print(count)
str1 = 'abcde'
str2 = 'abedea'
num(str1,str2)
num(str2,str1)




Cookie 和 Session的区别
	(a) 存放位置：session 存放于服务器，cookie 存放在客
	户端；
	(b) 安全性：cookie 不安全，session 安全，因此 session
	在服务端，cookie 在客户端；
	(c) 大小限制：cookie 会由客户端浏览器控制，单个
	cookie 保存的数据不能超过 4K，很多浏览器都限制一个站
	点最多保存 20 个 cookie。而 session 在在服务端，理论上
	没有大小限制。
	(d) 系统性能影响：session 存在服务端，当 session 比
	较多的情况下，服务端会受其影响，而 cookie 在客户端，
	不会影响服务器性能