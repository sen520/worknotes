
```

#coding=utf-8

#引入需要的模块包
import tornado.web
import tornado.ioloop


#定义处理类
class IndexHandler(tornado.web.RequestHandler):
    #接收GET方式处理
    def get(self, *args, **kwargs):
        self.write('hello world')

#设置路由
app = tornado.web.Application([
    (r'/',IndexHandler)
])
#绑定端口
app.listen(8000)

#启动监听
tornado.ioloop.IOLoop.instance().start()
```



1、在启动程序阶段，第一步，获取配置文件然后生成url映射（即：一个url对应一个XXRequestHandler，从而让XXRequestHandler来处理指定url发送的请求）；第二步，创建服务器socket对象并添加到epoll中；第三步，创建无限循环去监听epoll。

2、在接收并处理请求阶段，第一步，接收客户端socket发送的请求（socket.accept）；第二步，从请求中获取请求头信息，再然后根据请求头中的请求url去匹配某个XXRequestHandler；第三步，匹配成功的XXRequestHandler处理请求；第四步，将处理后的请求发送给客户端；第五步，关闭客户端socket。