使用`FormRequest`的`from_response`方法，调用时传入一个Response对象作为第一个参数，该方法会解析Response对象所包含页面中的\<form>元素，帮助用户创建FormRequest对象，并将隐藏的input中的信息自动填入表单数据



```python
import scrapy
from scrapy.http import Request, FormRequest
class LoginSpider(scrapy.Spider):
    name = "login"
    allowed_domains = ["example.webscraping.com"]
    start_urls = ['http://example.webscraping.com/user/profile']
    
    def parse(self, response):
    	# 解析登录后下载的页面，此例中为用户个人信息页面
        keys = response.css('table label::text').re('(.+):')
        values = response.css('table td.w2p_fw::text').extract()
        yield dict(zip(keys, values))
    # ----------------------------登录---------------------------------
    # 登录页面的url
    login_url = 'http://example.webscraping.com/user/login'
    def start_requests(self):
    	yield Request(self.login_url, callback=self.login)
    
    def login(self, response):
    # 登录页面的解析函数，构造FormRequest对象提交表单
        fd = {'email': 'liushuo@webscraping.com', 'password': '12345678'}
        yield FormRequest.from_response(response, formdata=fd,callback=self.parse_login)
    def parse_login(self, response):
        # 登录成功后，继续爬取start_urls 中的页面
        if 'Welcome Liu' in response.text:
        	yield from super().start_requests() # Python 3语法
```

