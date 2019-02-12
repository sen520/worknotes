```python
from selenium import webdriver
import time

#   打开课工场网站主页【第一个窗口】
driver = webdriver.Chrome()
driver.get('http://www.kgc.cn/')
time.sleep(2)
#   点击全部课程，进入课程库【第二个窗口】
driver.find_element_by_xpath('//a').click()
time.sleep(3)

# 切换窗口前内容
from lxml import etree
html = etree.HTML(driver.page_source)
a = html.xpath('//span/text()')
print(a)
print('====================')

#   使用第一种方法切换浏览器【切换到第二个窗口】
windows = driver.window_handles
driver.switch_to.window(windows[-1])
time.sleep(3)

# 切换窗口后内容
html = etree.HTML(driver.page_source)
a = html.xpath('//span/text()')
print(a)
#   点击课程库中的某个课程，进入课程详情界面【在第二个窗口页面进行元素点击操作，来判断窗口是否切换成功】
# time.sleep(3)

#   关闭浏览器
driver.quit()
print('测试通过')
```

