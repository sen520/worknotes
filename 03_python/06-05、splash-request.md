```python
import requests, json
from urllib.parse import quote
from lxml import etree

url = 'https://www.toutiao.com/'
lua = """
function main(splash, args)
  assert(splash:go('"""+url+"""'))
  assert(splash:wait(0.5))
  return {
    html = splash:html(),
    png = splash:png(),
    har = splash:har(),
  }
end
"""
url = 'http://192.168.99.100:8050/execute?lua_source=' + quote(lua)
response = requests.get(url)
dict = json.loads(response.text)
html = etree.HTML(dict['html'])
title = html.xpath('//li//div[@ga_event="article_title_click"]//text()')
print(title)
```

