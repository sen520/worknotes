```python
option = webdriver.ChromeOptions()

option.add_argument('-disable-infobars')

prefs = {'profile.default_content_settings.popups': 0,         'download.default_directory': 'F:\\data\\check\\excel\\pdf'}

option.add_experimental_option('prefs', prefs)

driver = webdriver.Chrome(options=self.option)
```



