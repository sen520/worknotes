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
        self.companyInfo = pymongo.MongoClient('mongodb://localhost:27017').a.companyInfo03
        self.list = []

    def parse_page(self):
        try:
            self.wait.until(
                EC.presence_of_element_located((By.XPATH, '//*[@id="content"]/div/div/table[1]//tr[5]/td[2]'))).click()
            page = etree.HTML(self.browser.page_source)
            province = page.xpath('string(//*[@id="content"]/div/div/table[1]//tr[5]/td[2]/text())')
            name = page.xpath('string(//*[@id="content"]/div/div/table[1]//tr[6]/td[2]/text())')
            behalf = page.xpath('string(//*[@id="content"]/div/div/table[1]//tr[7]/td[2]/text())')
            cover = page.xpath('string(//*[@id="content"]/div/div/table[1]//tr[8]/td[2]/text())')
            addr = page.xpath('string(//*[@id="content"]/div/div/table[1]//tr[10]/td[2]/text())')
            range = page.xpath('string(//*[@id="content"]/div/div/table[1]//tr[12]/td[2]/text())')
            dict = {
                'id': uuid.uuid4().hex,
                'province': province,
                'name': name,
                'behalf': behalf,
                'cover': cover,
                'addr': addr,
                'range': range,
            }
            self.companyInfo.insert(dict)
        except Exception as e:
            print(e)

    def run(self):
        self.browser.get(self.first_url)
        time.sleep(2)
        i = 0
        while True:
            # try:
            i += 1
            for num in range(1, 30, 2):
                print(num)
                time.sleep(2)
                self.browser.find_element_by_xpath("//div[@id='content']//tr[" + str(num) + "]/td//p/a").click()
                self.parse_page()
                self.browser.find_element_by_xpath("//*[@id='content']/div/div/table[1]//tr[1]/td/div[2]/img").click()
            if i == 1:
                self.wait.until(
                    EC.presence_of_element_located((By.XPATH, '//*[@id="content"]/table[4]//tr/td[4]/img'))).click()
            else:
                self.wait.until(
                    EC.presence_of_element_located((By.XPATH, '//*[@id="content"]/table[4]//tr/td[5]/img'))).click()
            print('正在抓取第%d页' % i)
            # self.company_name.insert(list)
            time.sleep(1)
            # except Exception as e:
            #     print(e)
            #     time.sleep(5)
            #     print('==================================')

    def dataToJson(self, newDataList, name):
        print(len(newDataList))
        with io.open(name + '.json', 'w', encoding='utf-8') as fo:
            fo.write(json.dumps(newDataList, ensure_ascii=False, indent=2, separators=(',', ': ')))


if __name__ == '__main__':
    url = 'http://app1.sfda.gov.cn/datasearch/face3/base.jsp?tableId=34&tableName=TABLE34&title=%D2%A9%C6%B7%C9%FA%B2%FA%C6%F3%D2%B5&bcId=118103348874362715907884020353'
    spider = Sfda_spider(url)
    spider.run()
