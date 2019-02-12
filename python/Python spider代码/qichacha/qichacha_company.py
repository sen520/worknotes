from lxml import etree
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
import json, io, uuid, time, re, pymongo


class SpiderQiChaCha(object):
    def __init__(self, url):
        self.host = 'https://www.qichacha.com'
        self.url = url
        self.option = webdriver.ChromeOptions()
        self.option.add_argument('-disable-infobars')
        self.browser = webdriver.Chrome(chrome_options=self.option)
        self.wait = WebDriverWait(self.browser, 5)
        self.data = pymongo.MongoClient('mongodb://localhost:27017').a.url
        self.full_url_list = []
        self.project_list = []
        self.user_list = []

    def get_url(self):
        result = self.data.find_one()
        if result:
            results = self.data.find()
            for data in results:
                self.full_url_list.append(data)
        if (len(self.full_url_list) == 0):
            self.browser.get(self.url)
            self.wait.until(EC.presence_of_element_located((By.XPATH, '//div[@class="col-md-3"]')))
            html = etree.HTML(self.browser.page_source)
            urlList = html.xpath('//div[@class="col-md-3"]/a/@href')
            for url in urlList:
                fullUrl = {'url': self.host + url}
                print(fullUrl)
                self.full_url_list.append(fullUrl)

    def save_url(self):
        result = self.data.find_one()
        if not result:
            self.data.insert_many(self.full_url_list)

    def parse(self, url_object):
        print(url_object['url'])
        try:
            self.browser.get(url_object['url'])
        except:
            return
        print(url_object['url'])
        try:
            self.wait.until(
                EC.presence_of_element_located((By.XPATH, '//div[@class="company-action pull-right"]'))).click()
            self.wait.until(EC.presence_of_element_located((By.XPATH, '//section[@id="Cominfo"]')))
            html = etree.HTML(self.browser.page_source)
            project_dict = {
                "id": uuid.uuid4().hex,
                "name": "",
                "address": "",
                "keyword": [],
                "creatorId": "",
                "referral": "00000000000000000000000000000000",
                "logo": "",
                "banner": "",
                "abstract": "",
                "detail": {
                    "market": "",
                    "introduction": "",
                    "team": "",
                    "product": "",
                    "business": "",
                    "grant": ""
                },
                "stage": 11,
                "website": "",
                "evaluation": 0.0,
                "phone": "",
                "askFor": 0.0,
                "email": "",
                "share": 0.0,
                "time": 0,
                "credit": 0
            }
            name = html.xpath('string(//div[@class="row title"]/text())')
            phone = html.xpath('string(//div[@class="content"]//div[@class="row"][1]/span[@class="cvlu"]/text())')
            email = html.xpath('string(//div[@class="content"]//div[@class="row"][2]/span[@class="cvlu"][1]/text())')
            website = html.xpath('string(//div[@class="content"]//div[@class="row"][2]/span[@class="cvlu"][2]/text())')
            address = html.xpath('string(//a[@data-original-title="查看地址"]/text())')
            timeString = html.xpath('string(//tr[2]/td[4]/text())')
            nameOther = html.xpath('string(//h1/text())')
            project_dict['name'] = nameOther.strip() if name.strip() == '' else name.strip()
            project_dict['phone'] = '' if phone.strip() == '暂无' else phone.strip()
            project_dict['email'] = '' if email.strip() == '暂无' else email.strip()
            project_dict['website'] = '' if website.strip() == '暂无' else website.strip()
            project_dict['address'] = '' if address.strip() == '暂无' else address.strip()
            try:
                timeObject = time.strptime(timeString.strip(), "%Y-%m-%d")
                unixTime = time.mktime(timeObject)
                project_dict['time'] = unixTime
            except:
                pass

            creator = html.xpath('string(//div[@class="pull-left"]//h2/text())')
            user_dict = {
                "id": uuid.uuid4().hex,
                "password": "",
                "name": creator,
                "abstract": "",
                "keyword": [],
                "detail": "",
                "title": "",
                "company": "",
                "education": "",
                "website": "",
                "email": "",
                "phone": "",
                "address": "",
                "type": 0,
                "capital": 0.0,
                "netCapital": 0.0,
                "credit": 0,
                "refer": "00000000000000000000000000000000",
                "legal": "",
                "logo": "https://buttondata.oss-cn-shanghai.aliyuncs.com/user.png",
                "authority": {
                    "wechat": "",
                    "linkedin": "",
                    "google": "",
                    "facebook": ""
                }
            }
            user_dict['name'] = creator.strip()
            user_dict['company'] = name.strip()
            project_dict['creatorId'] = user_dict['id']
            if project_dict['name'] != '':
                self.project_list.append(project_dict)
                self.user_list.append(user_dict)
                self.dataToJson(self.project_list, 'project')
                self.dataToJson(self.user_list, 'user')
                self.data.remove({'url': url_object['url']})

            print(project_dict)
            print(user_dict)
            print('==============================================')
        except Exception as e:
            print(e)

    def run(self):
        self.get_url()
        self.save_url()
        for url_object in self.full_url_list:
            self.parse(url_object)
            time.sleep(2)
        self.browser.close()

    def dataToJson(self, newDataList, name):
        print(len(newDataList))
        with io.open(name + '.json', 'w', encoding='utf-8') as fo:
            fo.write(json.dumps(newDataList, ensure_ascii=False, indent=2, separators=(',', ': ')))


if __name__ == '__main__':
    url = 'https://www.qichacha.com/yellowpage'
    spider = SpiderQiChaCha(url)
    spider.run()
