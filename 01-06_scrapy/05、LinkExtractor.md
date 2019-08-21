提取页面链接

```python
from scrapy.http import HtmlResponse
from scrapy.linkextractors import LinkExtractor
import requests
res = requests.get('http://www.xbiquge.la/')
response = HtmlResponse(url='http://www.xbiquge.la/', body=res.text, encoding='utf-8')
le = LinkExtractor()
links = le.extract_links(response)
for link in links:
    print(link)
```

LinkExtractor构造器的参数

- allow（站内）

  接受一个正则表达式或一个正则表达式列表，提取绝对url与正则表达式匹配的链接，如果参数为空，就提取全部链接

- deny（站外）

  接收一个正则表达式或一个正则表达式列表，与allow相反，排除绝对url与正则表达式匹配的链接

- allow_domains

  接收一个域名或一个域名列表，提取到指定域的链接

- deny_domains

  接收一个域名或一个域名列表，与allow_domains想反，排除到指定域的链接

- restrict_xpaths

  接收一个XPath表达式或一个XPath表达式列表，提取XPath表达式选中区域下的链接

- restrict_css

  接收一个CSS选择器或一个CSS选择器列表，提取CSS选择器选中区域下的链接

- tags

  接收一个标签（字符串）或一个标签列表，提取指定标签内的链接

- attrs

  接收一个属性（字符串）或一个属性列表，提取指定属性内的链接，默认为['href']

- process_value

  接收一个形如`func(value)`的回调函数。如果传递了该参数，LinkExtractor将调用该回调函数对提取的每一个链接进行处理，回调函数正常情况下应返回一个字符串(处理结果)，想要抛弃所处理的链接时，返回None

  