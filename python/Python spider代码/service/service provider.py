from selenium import webdriver
from lxml import etree
import json, io, uuid, time

def getUrl(driver):
    page_first = ''
    page_end = driver.page_source
    while page_first != page_end:
        js = 'window.scrollTo(0, document.body.scrollHeight)'
        # 执行js
        driver.execute_script(js)
        page_first = page_end
        page_end = driver.page_source
        time.sleep(2)
    e = etree.HTML(driver.page_source)
    urls = e.xpath('//td[2]/a/@href')
    fullUrlList = []
    for url in set(urls):
        fullUrl = 'https://bmsj18.mapyourshow.com' + url
        fullUrlList.append(fullUrl)
    return fullUrlList

def parseHtml(html):
    userDict = {
      "id": uuid.uuid4().hex,
      "password": "",
      "name": "",
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
      "type": 4,
      "capital": 0.0,
      "netCapital": 0.0,
      "credit": 0,
      "refer": "",
      "legal": "",
      "logo": "https://buttondata.oss-cn-shanghai.aliyuncs.com/user.png",
      "authority": {
        "wechat": "",
        "linkedin": "",
        "google": "",
        "facebook": ""
      }
    }
    name = html.xpath("string(//h1)").strip()
    address = html.xpath('string(//p[@class="sc-Exhibitor_Address"])').strip()
    phone = html.xpath('string(//*[@id="jq-sc-TabletDesktop-ExhContactInfo"]/div/p[2]/text()[2])').strip()
    website = html.xpath('string(//p[@class="sc-Exhibitor_Url"]/a/@href)').strip()
    product = html.xpath('//ul[@class="mys-bullets"]/li/text()')
    abstract = html.xpath('string(//*[@id="mys-exhibitor-details-wrapper"]/div[@class="mys-taper-measure"])').strip()
    userDict['name'] = name
    userDict['address'] = address
    userDict['phone'] = phone
    userDict['website'] = website
    userDict['keyword'] = product
    userDict['abstract'] = abstract
    return userDict

def dataToJson(newDataList, name):
    print(len(newDataList))
    with io.open(name + '.json', 'w', encoding='utf-8') as fo:
        fo.write(json.dumps(newDataList, ensure_ascii=False, indent=2, separators=(',', ': ')))

if __name__ == '__main__':
    driver = webdriver.Chrome()
    driver.get(
        "https://bmsj18.mapyourshow.com/7_0/alphalist.cfm?endrow=142&alpha=*&CFID=39046746&CFTOKEN=eea2e227e0125b1e-E5DA3A94-DC2B-3B56-915A016C8C59EBB9")
    urlList = getUrl(driver)
    print(len(urlList))
    userList = []
    for url in set(urlList):
        driver.get(url)
        print(url)
        html = etree.HTML(driver.page_source)
        userDict = parseHtml(html)
        userList.append(userDict)
        break
    dataToJson(userList, 'service provider')
    driver.close()