from lxml import etree
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
import json, io, uuid, time, re, pymongo, xlrd


def read_excel(collection):
    result = collection.find_one()
    if result:
        return
    # 读取文件
    workbook = xlrd.open_workbook(r'company.xlsx')

    # 获取所有sheet
    sheet = workbook.sheet_by_name('规上企业初筛')
    company_names = sheet.col_values(0)
    company_names.remove('企业名称')
    for company_name in company_names:
        collection.insert_one({'name': company_name})


class Spider(object):
    def __init__(self, url, db):
        self.host = 'https://www.qichacha.com'
        self.url = url
        self.option = webdriver.ChromeOptions()
        self.option.add_argument('-disable-infobars')
        self.browser = webdriver.Chrome(chrome_options=self.option)


        self.wait = WebDriverWait(self.browser, 5)
        self.db = db
        self.name = []
        self.url_list = []
        self.parse_url_list = []
        self.project_list = []

    def search(self):
        self.browser.get(self.url)
        # 手动登录
        time.sleep(20)
        for name in self.name:
            try:
                result = self.db.companyUrl.find_one({'name': name})
                if result:
                    print('123')
                    self.db.test.remove({"name": name})
                    continue
                print('qwe')
                self.wait.until(EC.presence_of_element_located((By.XPATH, '//input[@id="searchkey"]'))).send_keys(name)
                self.wait.until(EC.presence_of_element_located((By.XPATH, '//input[@value="查一下"]'))).click()
                html = etree.HTML(self.browser.page_source)
                url = html.xpath('string(//table[@class="m_srchList"]//tr//a[@class="ma_h1"]/@href)')
                companyname = html.xpath('string(//table[@class="m_srchList"]//tr//a[@class="ma_h1"])')
                full_url = 'https://www.qichacha.com' + url
                if companyname == '':
                    if html.xpath('string(//div[@class="noresult  no-search"])') == '':
                        time.sleep(10)
                    else:
                        self.db.test.remove({"name": name})
                else:
                    self.url_list.append(full_url)
                    self.db.companyUrl.insert({"name": companyname, "url": full_url})
                    self.db.test.remove({"name": name})
                self.browser.get(self.url)
                print('总计：', len(self.name))
                print('目前抓取数目：', len(self.url_list))
            except:
                pass

    def run(self):
        names = self.db.test.find()
        for i in names:
            self.name.append(i['name'])
        self.search()

    def parse(self):
        urls = self.db.companyUrl.find()
        for i in urls:
            # print(i)
            self.parse_url_list.append(i['url'])
        self.parse_url_list = set(self.parse_url_list)
        for url in self.parse_url_list:
            try:
                self.browser.get(url)
                self.wait.until(EC.presence_of_element_located((By.XPATH, '//table[@class="ntable"]')))
                html = etree.HTML(self.browser.page_source)
                name = html.xpath('string(//h1/text())').strip()
                website = html.xpath('string(//span[@class="cvlu webauth"]/a/@href)').strip()
                # 所属行业
                industry = html.xpath('string(//table[2]//tr[5]/td[4]/text())').strip()
                # 人员规模
                team = html.xpath('string(//table[2]//tr[9]/td[2]/text())').strip()
                # 法人代表
                creator = html.xpath('string(//h2[@class="seo font-20"])').strip()

                # 所属地区
                area = html.xpath('string(//table[2]//tr[7]/td[2]/text())').strip()
                # 登记机关
                registration = html.xpath('string(//table[2]//tr[6]/td[4]/text())').strip()
                # 企业类型
                type = html.xpath('string(//table[2]//tr[5]/td[2]/text())').strip()

                # 经营范围
                around = html.xpath('string(//table[2]//tr[last()]/td[2])').strip()
                # 注册地址
                addr = html.xpath('string(//table[2]//tr[last()-1]/td[2]/text())').strip()

                dict = {
                    'id': uuid.uuid4().hex,
                    'name': name,
                    "industry": industry,
                    "website": website,
                    "team": team,
                    "creator": creator,
                    "addr1": area,
                    "addr2": addr,
                    "around": around,
                    "type": type,
                    "registration": registration
                }


                self.project_list.append(dict)
                self.dataToJson('company-info')
                self.db.companyUrl.remove({"url": url})
            except:
                continue
        self.browser.close()

    def dataToJson(self, name):
        print(len(self.project_list))
        with io.open(name + '.json', 'w', encoding='utf-8') as fo:
            fo.write(json.dumps(self.project_list, ensure_ascii=False, indent=2, separators=(',', ': ')))



if __name__ == '__main__':
    client = pymongo.MongoClient('mongodb://localhost:27017')
    db = client.company
    # read_excel(db.test)
    url = 'https://www.qichacha.com/'

    spider = Spider(url, db)
    # spider.run()
    spider.parse()
