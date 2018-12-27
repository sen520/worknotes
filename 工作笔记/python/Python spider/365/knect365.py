from lxml import etree
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
import json, io, uuid, time, re, pymongo


class Knect(object):
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.url = 'https://partneringone.knect365.com/sign-in'
        self.full_url_list = []
        self.projectList = []
        self.productList = []
        # 去除浏览器警告
        self.option = webdriver.ChromeOptions()
        self.option.add_argument('-disable-infobars')
        self.browser = webdriver.Chrome(chrome_options=self.option)

        self.wait = WebDriverWait(self.browser, 20)
        self.webWait = WebDriverWait(self.browser, 8)
        self.client = pymongo.MongoClient('mongodb://127.0.0.1:27017')
        self.data = self.client.data

    def login(self):
        self.browser.get(url=self.url)
        self.wait.until(EC.presence_of_element_located((By.XPATH, '//input[@type="email"]'))).send_keys(self.username)
        self.wait.until(EC.presence_of_element_located((By.XPATH, '//input[@type="password"]'))).send_keys(
            self.password)
        self.wait.until(EC.presence_of_element_located((By.XPATH, '//button[@type="submit"]'))).click()

    def run(self):
        # 登录
        self.login()
        # 点击跳转到指定页面
        self.wait.until(EC.presence_of_element_located((By.XPATH, '//div[@class="event__logo"]'))).click()
        self.wait.until(EC.presence_of_element_located((By.XPATH, '//a[@href="/event/620/search"]'))).click()
        self.wait.until(EC.presence_of_element_located(
            (By.XPATH, '//a[@href="/event/620/search/alphabetical-list?doctypes[0]=company&size=20&start=0"]'))).click()
        sort_elements = self.wait.until(EC.presence_of_all_elements_located(
            (By.XPATH, '//div[@class="search__alphabet-list"]/div[@class="link-container"]')))
        # 如果为中断解析，下面的循环不需要执行
        for index, sort in enumerate(sort_elements):
            self.wait.until(EC.presence_of_element_located((By.XPATH, '//ul[@class="Tabs Tabs--panel"]')))
            sort.click()
            while True:
                time.sleep(8)
                total = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, '//span[@class="search__list-results-count"]'))).text
                total_num = int(re.search('\d+', total).group())
                now = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, '//span[@class="search__list-results-count"][2]'))).text
                now_num = int(re.search('\d+$', now).group())
                print('total', total_num, 'now', now_num)
                self.get_url()
                print('========================================')
                if now_num >= total_num:
                    break
                self.wait.until(EC.presence_of_element_located((By.XPATH, '//li[@class="next"][1]'))).click()
        self.save()
        self.parse()

    def get_url(self):
        self.wait.until(
            EC.presence_of_all_elements_located(
                (By.XPATH, '//div[@class="search__list col"]/div[@class="search__item row row--no-gutter"]')))
        html = etree.HTML(self.browser.page_source)
        projects = html.xpath('//div[@class="search__item row row--no-gutter"]')
        for project in projects:
            url = project.xpath('string(.//div[@class="col"]//a/@href)')
            full_url = 'https://partneringone.knect365.com' + url
            self.full_url_list.append({'url': full_url})
            print(len(self.full_url_list))

    def save(self):
        self.data.url.insert_many(self.full_url_list)

    def parse(self):
        # 此处为中断之后，解析所用
        # full_url = self.data.url.find()
        # for o in full_url:
        #     self.full_url_list.append(o['url'])
        for url in self.full_url_list:
            try:
                self.browser.get(url)
            except:
                continue
            try:
                self.wait.until(
                    EC.presence_of_element_located((By.XPATH, '//div[@class="alpaca"]')))
            except:
                continue
            projectDict = {
                "id": uuid.uuid4().hex,
                "name": "",
                "address": "",
                "keyword": [],
                "creatorId": "",
                "referral": "",
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
            html = etree.HTML(self.browser.page_source)
            name = html.xpath('string(//h2)')
            address = ''
            try:
                address1 = html.xpath('//div[@class="define-layout"]//span/span')[1].text
                address2 = html.xpath('//div[@class="define-layout"]//span/span')[2].text
                if address1:
                    address = address1
                if address2:
                    address += ' ' + address2
            except:
                pass
            address3 = html.xpath('string(//div[@class="define-layout"]//div[@class="state-field"])')
            if address3:
                address += ' ' + address3
            projectDict['address'] = address
            try:
                phone = html.xpath('//div[@class="define-layout"]//span/span')[3].text
                keyword = html.xpath('//div[@class="interlinked-view-mode"]/div[2]/text()')[0]
                projectDict['phone'] = phone
                projectDict['keyword'] = keyword
            except:
                pass
            abstract = html.xpath(
                'string(//div[@class="alpaca"][3]//div[@class="richtext-box"]//div[@class="DraftEditor-editorContainer"])')
            website = html.xpath('string(//div[@class="define-layout"]//a)')
            introduction = html.xpath('string(//div[@class="alpaca"][1]//div[@class="public-DraftEditor-content"])')

            projectDict['name'] = name
            projectDict['website'] = website
            projectDict['abstract'] = abstract
            projectDict['detail']['introduction'] = introduction
            print('projectDict', projectDict)
            print('========================================')
            self.projectList.append(projectDict)
            try:
                self.wait.until(
                    EC.presence_of_element_located((By.XPATH, '//div[@class="NavTabs "]/a[2]'))).click()
                assets = self.wait.until(EC.presence_of_all_elements_located(
                    (By.XPATH, '//div[@class="assets-container"]//div[@class="NavTabs "]/a')))
                for asset in assets:
                    asset.click()
                    try:
                        products = self.webWait.until(EC.presence_of_all_elements_located(
                            (By.XPATH, '//div[@class="asset-block__title-wrapper"]')))
                        for index, product in enumerate(products):
                            product.click()
                            time.sleep(2)
                            productDict = {
                                "id": uuid.uuid4().hex,
                                "projectId": projectDict['id'],
                                "name": "",
                                "logo": "https://buttondata.oss-cn-shanghai.aliyuncs.com/product.png",
                                "abstract": "",
                                "detail": {
                                    "market": "",
                                    "introduction": "",
                                    "technique": ""
                                },
                                "time": 0,
                                "price": {
                                    "cost": 0.0,
                                    "exw": 0.0,
                                    "market": 0.0
                                },
                                "type": [],
                                "status": "",
                                "license": [],
                                "credit": 0
                            }
                            productHtml = etree.HTML(self.browser.page_source)
                            name = productHtml.xpath('//div[@class="asset-block__asset-title"]/text()')
                            abstract = productHtml.xpath('string(//div[@class="public-DraftEditor-content"]/div/div)')
                            introduction = productHtml.xpath(
                                'string(//div[@class="public-DraftEditor-content"]/div/ul)')
                            market = productHtml.xpath(
                                'string(//div[@class="profile-field profile-field--dropdown web-display-additional-other-panel"][2]/div/div/div[2])')
                            technique = productHtml.xpath(
                                'string(//div[@class="profile-field profile-field--dropdown web-display-additional-other-panel"][3]/div/div/div[2])')
                            productDict['name'] = name[index]
                            productDict['abstract'] = abstract
                            productDict['detail']['introduction'] = introduction
                            productDict['detail']['market'] = market
                            productDict['detail']['technique'] = technique
                            product.click()
                            print(productDict)
                            self.productList.append(productDict)
                    except:
                        pass
                print(url)
            except Exception as e:
                print(e)
            self.data.url.delete_one({'url': url})
            self.dataToJson(self.projectList, '365projectData')
            self.dataToJson(self.productList, '365productData')

    def dataToJson(self, newDataList, name):
        print(len(newDataList))
        with io.open(name + '.json', 'w', encoding='utf-8') as fo:
            fo.write(json.dumps(newDataList, ensure_ascii=False, indent=2, separators=(',', ': ')))


if __name__ == '__main__':
    knect365 = Knect('xi.fang@buttoninvest.com', 'Button2018')
    knect365.run()
