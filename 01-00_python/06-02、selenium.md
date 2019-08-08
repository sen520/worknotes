## 1、selenium被识别

相关网址：

- https://stackoverflow.com/questions/33225947/can-a-website-detect-when-you-are-using-selenium-with-chromedriver
- https://stackoverflow.com/questions/3614472/is-there-a-way-to-detect-that-im-in-a-selenium-webdriver-page-from-javascript
- https://www.zhihu.com/question/50738719

#### 1、selenium 暴露的问题

selenium在运行的时候会暴露出一些预定义的Javascript变量（特征字符串），例如"window.navigator.webdriver"，在非selenium环境下其值为undefined，而在selenium环境下，其值为true

![img](./img/JSwebdriver.png)

除此之外，还有一些其它的标志性字符串(不同的浏览器可能会有所不同):

1. webdriver  
2. __driver_evaluate  
3. __webdriver_evaluate  
4. __selenium_evaluate  
5. __fxdriver_evaluate  
6. __driver_unwrapped  
7. __webdriver_unwrapped  
8. __selenium_unwrapped  
9. __fxdriver_unwrapped  
10. _Selenium_IDE_Recorder  
11. _selenium  
12. calledSelenium  
13. _WEBDRIVER_ELEM_CACHE  
14. ChromeDriverw  
15. driver-evaluate  
16. webdriver-evaluate  
17. selenium-evaluate  
18. webdriverCommand  
19. webdriver-evaluate-response  
20. __webdriverFunc  
21. __webdriver_script_fn  
22. __$webdriverAsyncExecutor  
23. __lastWatirAlert  
24. __lastWatirConfirm  
25. __lastWatirPrompt  
26. $chrome_asyncScriptInfo  
27. $cdc_asdjflasutopfhvcZLmcfl_  



#### 2、解决方案

```
option = webdriver.FirefoxOptions()
option.add_argument('-disable-infobars')
```

###### option参数

```python
   about:version - 显示当前版本
　　about:memory - 显示本机浏览器内存使用状况
　　about:plugins - 显示已安装插件
　　about:histograms - 显示历史记录
　　about:dns - 显示DNS状态
　　about:cache - 显示缓存页面
　　about:gpu -是否有硬件加速
　　about:flags -开启一些插件 //使用后弹出这么些东西：“请小心，这些实验可能有风险”，不知会不会搞乱俺的配置啊！
　　chrome://extensions/ - 查看已经安装的扩展
　　其他的一些关于Chrome的实用参数及简要的中文说明（使用方法同上，当然也可以在shell中使用）
　　–user-data-dir=”[PATH]” 指定用户文件夹User Data路径，可以把书签这样的用户数据保存在系统分区以外的分区。
　　–disk-cache-dir=”[PATH]“ 指定缓存Cache路径
　　–disk-cache-size= 指定Cache大小，单位Byte
　　–first run 重置到初始状态，第一次运行
　　–incognito 隐身模式启动
　　–disable-javascript 禁用Javascript
　　--omnibox-popup-count="num" 将地址栏弹出的提示菜单数量改为num个。我都改为15个了。
　　--user-agent="xxxxxxxx" 修改HTTP请求头部的Agent字符串，可以通过about:version页面查看修改效果
　　--disable-plugins 禁止加载所有插件，可以增加速度。可以通过about:plugins页面查看效果
　　--disable-javascript 禁用JavaScript，如果觉得速度慢在加上这个
　　--disable-java 禁用java
　　--start-maximized 启动就最大化
　　--no-sandbox 取消沙盒模式
　　--single-process 单进程运行
　　--process-per-tab 每个标签使用单独进程
　　--process-per-site 每个站点使用单独进程
　　--in-process-plugins 插件不启用单独进程
　　--disable-popup-blocking 禁用弹出拦截
　　--disable-plugins 禁用插件
　　--disable-images 禁用图像
　　--incognito 启动进入隐身模式
　　--enable-udd-profiles 启用账户切换菜单
　　--proxy-pac-url 使用pac代理 [via 1/2]
　　--lang=zh-CN 设置语言为简体中文
　　--disk-cache-dir 自定义缓存目录
　　--disk-cache-size 自定义缓存最大值（单位byte）
　　--media-cache-size 自定义多媒体缓存最大值（单位byte）
　　--bookmark-menu 在工具 栏增加一个书签按钮
　　--enable-sync 启用书签同步
```

## 2、切换窗口

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

## 3、指定下载位置

```python
option = webdriver.ChromeOptions()

option.add_argument('-disable-infobars')

prefs = {'profile.default_content_settings.popups': 0,         'download.default_directory': 'F:\\data\\check\\excel\\pdf'}

option.add_experimental_option('prefs', prefs)

driver = webdriver.Chrome(options=self.option)
```

## 4、设置页面加载超时时间，并终止加载

在使用的时候发现有时候会有页面加载很慢的情况，因为selenium是在页面完全加载完毕才会停止，然而这个在很多时候是没有必要的，这个时候可以自己手动设置超时时间。方法如下：

```python

from selenium import webdriver
from selenium.common.exceptions import TimeoutException

driver = webdriver.Firefox()
# 设定页面加载限制时间
driver.set_page_load_timeout(5)
driver.maximize_window()

try:
    driver.get('http://www.icourse163.org/')
except TimeoutException:  
    driver.execute_script('window.stop()') #当页面加载时间超过设定时间，通过执行Javascript来stop加载，即可执行后续动作
```



