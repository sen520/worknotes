 #### Selenium 处理滚动条
 
 > selenium并不是万能的，有时候页面上操作无法实现的，这时候就需要借助JS来完成了

　　当页面上的元素超过一屏后，想操作屏幕下方的元素，是不能直接定位到，会报元素不可见的。这时候需要借助滚动条来拖动屏幕，使被操作的元素显示在当前的屏幕上。滚动条是无法直接用定位工具来定位的。selenium里面也没有直接的方法去控制滚动条，这时候只能借助J了，还好selenium提供了一个操作js的方法:execute_script()，可以直接执行js的脚本

##### 一. 控制滚动条高度

###### 1.1滚动条回到顶部：

    js="var q=document.getElementById('id').scrollTop=0"
    driver.execute_script(js)
　　　　
###### 1.2滚动条拉到底部

    js="var q=document.documentElement.scrollTop=10000"
    driver.execute_script(js)

可以修改scrollTop 的值，来定位右侧滚动条的位置，0是最上面，10000是最底部


以上方法在Firefox和IE浏览器上上是可以的，但是用Chrome浏览器，发现不管用。Chrome浏览器解决办法：

    js = "var q=document.body.scrollTop=0"
    driver.execute_script(js)

 

##### 二.横向滚动条
###### 2.1 有时候浏览器页面需要左右滚动（一般屏幕最大化后，左右滚动的情况已经很少见了)

###### 2.2 通过左边控制横向和纵向滚动条scrollTo(x, y)
        
    js = "window.scrollTo(100,400)"
    driver.execute_script(js)

##### 三.元素聚焦

虽然用上面的方法可以解决拖动滚动条的位置问题，但是有时候无法确定我需要操作的元素在什么位置，有可能每次打开的页面不一样，元素所在的位置也不一样，怎么办呢？这个时候我们可以先让页面直接跳到元素出现的位置，然后就可以操作了

同样需要借助JS去实现。 具体如下：

    target = driver.find_element_by_xxxx()
    driver.execute_script("arguments[0].scrollIntoView();", target)

##### 四. 参考代码

```
from selenium import webdriver
from lxml import etree
import time

url = "https://search.jd.com/Search?keyword=%E7%AC%94%E8%AE%B0%E6%9C%AC&enc=utf-8&wq=%E7%AC%94%E8%AE%B0%E6%9C%AC&pvid=845d019c94f6476ca5c4ffc24df6865a"
# 加载浏览器
wd = webdriver.Firefox()
# 发送请求
wd.get(url)
# 要执行的js
js = "var q = document.documentElement.scrollTop=10000"
# 执行js
wd.execute_script(js)

time.sleep(3)
# 解析数据
e = etree.HTML(wd.page_source)
# 提取数据的xpath
price_xpath = '//ul[@class="gl-warp clearfix"]//div[@class="p-price"]/strong/i/text()'
# 提取数据的
infos = e.xpath(price_xpath)

print(len(infos))
# 关闭浏览器
wd.quit()


```