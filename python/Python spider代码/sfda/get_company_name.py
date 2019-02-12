from lxml import etree
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
import json, io, uuid, time, re, pymongo

class Sfda_spider(object):
    def __init__(self, first_url):
        self.first_url = first_url
        self.option = webdriver.FirefoxOptions()
        self.option.add_argument('-disable-infobars')
        self.browser = webdriver.Firefox(firefox_options=self.option)
        self.wait = WebDriverWait(self.browser, 10)
        self.cookie = None
        self.company_name = pymongo.MongoClient('mongodb://localhost:27017').a.companyName
        self.list = []


    def parse_page(self):
        pass

    def run(self):
        self.browser.get(self.first_url)
        time.sleep(2)
        i = 0
        while True:
            try:
                list = []
                i += 1
                a = etree.HTML(self.browser.page_source)
                name_list = a.xpath('//div[@id="content"]//tr/td/p/a/text()')
                for nameStr in name_list:
                    name = re.sub(r'^\d+\.', '', nameStr)
                    self.list.append({'name': name})
                    list.append({'id': uuid.uuid4().hex ,'name': name})
                print(len(self.list))
                self.browser.delete_cookie('JSESSIONID')
                self.browser.delete_cookie('security_session_verify')
                if i == 1:
                    self.wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="content"]//table[4]//tr/td[4]/img'))).click()
                else:
                    self.wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="content"]//table[4]//tr/td[5]/img'))).click()
                print('正在抓取第%d页'%i)
                print(self.company_name)
                self.company_name.insert(list)
                time.sleep(1)
            except Exception as e:
                print(e)
                time.sleep(5)
                print('==================================')


    def dataToJson(self, newDataList, name):
        print(len(newDataList))
        with io.open(name + '.json', 'w', encoding='utf-8') as fo:
            fo.write(json.dumps(newDataList, ensure_ascii=False, indent=2, separators=(',', ': ')))


if __name__ == '__main__':
    url = 'http://app1.sfda.gov.cn/datasearch/face3/base.jsp?tableId=34&tableName=TABLE34&title=%D2%A9%C6%B7%C9%FA%B2%FA%C6%F3%D2%B5&bcId=118103348874362715907884020353'
    spider = Sfda_spider(url)
    spider.run()