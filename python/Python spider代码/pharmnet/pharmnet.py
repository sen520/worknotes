import requests
import time
import pymongo
from lxml import etree

def send_request(url):
    response = requests.get(url)
    html = etree.HTML(response.text)

    return html

def get_main_url(html):
    url_list = []
    name_list = []
    # page_total = html.xpath('string(//dd[@class="xl"]/span/font[2])')
    for i in range(1, 501):
        url = 'http://www.pharmnet.com.cn/cgi/company.cgi?p='+ str(i) + '&cate1=&cate2=&cate4=&terms=&f='
        response = requests.get(url)
        time.sleep(1)
        html = etree.HTML(response.text)
        url_list_get = html.xpath('//li[@class="textr"]/h1/a/@href')
        name_list_get = html.xpath('//li[@class="textr"]/h1/a/text()')
        url_list.extend(url_list_get)
        name_list.extend(name_list_get)
        print(name_list_get)
        print('共抓取 %d 条数据'%len(url_list))
        print("第 %d 页"%i)
        save_url(url_list_get, name_list_get)

def save_url(url_list, name_list):
    client = pymongo.MongoClient('mongodb://localhost:27017')
    url_data = client.medicine.url
    for url, name in zip(url_list, name_list):
        result = url_data.find_one({'url': url})
        if (result):
            continue
        url_data.insert_one({'url': url, 'name': name})


if __name__ == '__main__':
    url = 'http://www.pharmnet.com.cn/cgi/company.cgi'
    main_html = send_request(url)
    get_main_url(main_html)