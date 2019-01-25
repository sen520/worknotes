import requests
import time, re
import pymongo
from lxml import etree

class Company_spider():
    def __init__(self):
        self.time = 2
        self.url_list = []
        self.client = pymongo.MongoClient('mongodb://localhost:27017')
        self.list = []

    def get_url(self):
        url_data = self.client.medicine.url
        obj_list = url_data.find()
        for obj in obj_list:
            self.url_list.append(obj['url'])

    def parse_page(self):
        for know_url in self.url_list:
            try:
                print("一共%d条数据， 正在获取第%d条数据" % (len(self.url_list), len(self.list) + 1))
                print(know_url)
                response = requests.get(know_url)
                time.sleep(1)
                url = know_url + '/show/'
                html = etree.HTML(response.text)
                product_url = html.xpath('string(//div[@class="menu"]//li[3]/a/@href)')
                product_list = []
                contact_list = []
                print(product_url)
                if re.search('^http', product_url):
                    response.encoding = 'gb2312'
                    html = etree.HTML(response.text)
                    company = html.xpath('string(//h1)')
                    product_url = html.xpath('string(//div[@class="menu"]//li[2]/a/@href)')
                    product_response = requests.get(product_url)
                    time.sleep(1)
                    product_response.encoding = 'gb2312'
                    product_page = etree.HTML(product_response.text)
                    page_url_list = []
                    while True:
                        try:
                            next_page_num = product_page.xpath('string(//dd[@class="ts"]/a[last()]/@href)')
                            if not next_page_num:
                                break
                            if next_page_num in page_url_list:
                                break
                            page_url_list.append(next_page_num)
                            next_response = requests.get(next_page_num)
                            next_response.encoding = 'gb2312'
                            product_page = etree.HTML(next_response.text)
                            product_list.extend(product_page.xpath('//li//h2/a[2]/text()'))
                        except Exception as e:
                            raise e
                    contact_list = html.xpath('//div[@class="jb"]/ul/li[@class="bgwhite"]/text()')

                else:
                    whole_product_url = url + product_url
                    product_response = requests.get(whole_product_url)
                    time.sleep(0.5)
                    product_page = etree.HTML(product_response.text)
                    company = html.xpath('string(//h1)')
                    page_url_list = []
                    while True:
                        try :
                            product_list = product_page.xpath('//dd[@class="m0"]//h3/a[1]/text()')
                            next_page_num = product_page.xpath('string(//h5/a[last()]/@href)')
                            print(next_page_num)
                            if not next_page_num:
                                break
                            if next_page_num in page_url_list:
                                break
                            page_url_list.append(next_page_num)
                            next_response = requests.get(url + next_page_num)
                            time.sleep(0.5)
                            product_page = etree.HTML(next_response.text)
                            product_list.extend(product_page.xpath('//dd[@class="m0"]//h3/a[1]/text()'))
                        except Exception as e:
                            print(e)

                    contact_url = html.xpath('string(//div[@class="menu"]//li[5]/a/@href)')
                    whole_contact_url = url + contact_url
                    contact_response = requests.get(whole_contact_url)
                    contact_response.encoding = 'gb2312'
                    contact_page = etree.HTML(contact_response.text)
                    contact_list = contact_page.xpath('//div[@class="lxfs"]//dd//li/text()')

                self.save_data({'name': company, 'product': product_list, 'contact': contact_list, 'url': know_url})
                # self.client.medicine.url.remove({'url': url})
                self.list.append(url)
            except Exception as e:
                print('======================')
                raise e
                pass


    def save_data(self, company_obj):
        self.client.medicine.data.insert(company_obj)

    def run(self):
        self.get_url()
        self.parse_page()

if __name__ == '__main__':
    spider = Company_spider()
    spider.run()