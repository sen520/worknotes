from lxml import etree
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json, io, uuid, time, re


def login(driver, loginUrl, username, password):
    driver.get(loginUrl)
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.ID, 'login'))
    )
    driver.find_element_by_id('login').send_keys(username)
    driver.find_element_by_id('password').send_keys(password)

    driver.find_element_by_xpath('//input[@type="submit"]').click()


def parseHtml(driver, url):
    driver.get(url)
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, '//div[@class="search-company-info"]'))
    )
    projectList = []
    userList = []
    productList1 = []
    productList2 = []
    productList3 = []
    driver.find_element_by_xpath('//ul[@class="nav-tabs"]/li[1]').click()
    time.sleep(2)
    page = etree.HTML(driver.page_source)
    numStr = page.xpath('string(//span[@ng-if="loading || pageNumbers.length > 1"])')
    pageNumProject = re.search('\d+', numStr).group()

    # for i in range(1, int(pageNumProject) + 1):
    #     print('parseProject','page',i)
    #     url = 'https://buttoncapital.partnering.bio.org/inova-business-platform/webclient/#/bio/4001/search/0/' + str(i) + '/modifiedOn/companies'
    #     driver.get(url)
    #     time.sleep(5)
    #     projectList = parseProject(driver, projectList)
    # dataToJson(projectList, 'one_project')

    # driver.find_element_by_xpath('//ul[@class="nav-tabs"]/li[2]').click()
    # time.sleep(2)
    # page = etree.HTML(driver.page_source)
    # numStr = page.xpath('string(//span[@ng-if="loading || pageNumbers.length > 1"])')
    # pageNumUser = re.search('\d+', numStr).group()
    # for i in range(1, int(pageNumUser) + 1):
    #     print('parseUser','page', i)
    #     url = 'https://buttoncapital.partnering.bio.org/inova-business-platform/webclient/#/bio/4001/search/0/' + str(i) + '/modifiedOn/delegates'
    #     driver.get(url)
    #     time.sleep(5)
    #     userList = parseUser(driver,userList)
    #     dataToJson(userList, 'one_user')
    projectFile = open("one_project.json", encoding='utf-8')
    projectList = json.load(projectFile)

    driver.find_element_by_xpath('//ul[@class="nav-tabs"]/li[3]').click()
    time.sleep(2)
    page = etree.HTML(driver.page_source)
    numStr = page.xpath('string(//span[@ng-if="loading || pageNumbers.length > 1"])')
    pageNumProduct1 = re.search('\d+', numStr).group()
    for i in range(2, int(pageNumProduct1) + 1):
        print('parseAsset','page', i)
        time.sleep(5)
        productList1 = parseAsset(driver, productList1 ,projectList)
        url = 'https://buttoncapital.partnering.bio.org/inova-business-platform/webclient/#/bio/4001/search/0/' + str(i) + '/modifiedOn/assets'
        driver.get(url)
        dataToJson(productList1, 'one_product1')

    driver.find_element_by_xpath('//ul[@class="nav-tabs"]/li[4]').click()
    time.sleep(2)
    page = etree.HTML(driver.page_source)
    numStr = page.xpath('string(//span[@ng-if="loading || pageNumbers.length > 1"])')
    pageNumProduct2 = re.search('\d+', numStr).group()
    for i in range(2, int(pageNumProduct2) + 1):
        print('parseMarketProducts','page', i)
        time.sleep(5)
        productList2 = parseMarketProducts(driver, productList2, projectList)
        url = 'https://buttoncapital.partnering.bio.org/inova-business-platform/webclient/#/bio/4001/search/0/' + str(i) + '/modifiedOn/products'
        driver.get(url)
        dataToJson(productList2, 'one_product2')

    driver.find_element_by_xpath('//ul[@class="nav-tabs"]/li[5]').click()
    time.sleep(2)
    page = etree.HTML(driver.page_source)
    numStr = page.xpath('string(//span[@ng-if="loading || pageNumbers.length > 1"])')
    pageNumProduct3 = re.search('\d+', numStr).group()
    for i in range(2, int(pageNumProduct3) + 1):
        print('parseServices','page', i)
        time.sleep(5)
        productList3 = parseServices(driver, productList3, projectList)
        url = 'https://buttoncapital.partnering.bio.org/inova-business-platform/webclient/#/bio/4001/search/0/' + str(i) + '/modifiedOn/services'
        driver.get(url)
        dataToJson(productList3, 'one_product3')

def parseServices(driver, productList, projectList):
    num = 0
    rowList = driver.find_elements_by_xpath('//div[@class="wrapper-lister"]//div[@class="row-all clearfix"]')
    time.sleep(2)
    for index, row in enumerate(rowList):
        try:
            productDict = {
                "id": uuid.uuid4().hex,
                "projectId": "",
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
            row.click()
            time.sleep(2)
            html = etree.HTML(driver.page_source)
            rowHtml = html.xpath('//div[@class="wrapper-lister"]/div/div/div')[index + 1]
            name = rowHtml.xpath('string(.//div[@class="sub-profile-name align-vertical"])')
            abstract = html.xpath('string(//div[@class="container-fluid"]/div//div[@label="\'Description\'"]/div/div/@ibp-markdown)')
            company = rowHtml.xpath('string(./div[3])')

            productDict['name'] = name
            productDict['abstract'] = abstract
            if company :
                productDict['company'] = company
                for i in projectList:
                    if company == i['name']:
                        productDict['projectId'] = i['id']
                        break
            print(productDict)
            productList.append(productDict)
            num += 1
            print(num)
        except:
            continue
    return productList

def parseMarketProducts(driver, productList, projectList):
    num = 0
    rowList = driver.find_elements_by_xpath('//div[@class="wrapper-lister"]//div[@class="row-all clearfix"]')
    time.sleep(2)
    for index, row in enumerate(rowList):
        try:
            productDict = {
                "id": uuid.uuid4().hex,
                "projectId": "",
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
            row.click()
            time.sleep(2)
            html = etree.HTML(driver.page_source)
            rowHtml = html.xpath('//div[@class="wrapper-lister"]/div/div/div')[index + 1]
            name = rowHtml.xpath('string(./div[@class="col-xs-3 col-sm-3 col-md-3 col-lg-3 first-element"])')
            company = rowHtml.xpath('string(./div[3])')
            abstract = html.xpath('string(//div[@class="container-fluid"]/div//div[@label="\'Description\'"]/div/div/@ibp-markdown)')
            technique1 = rowHtml.xpath('string(./div[2])')
            technique2 = rowHtml.xpath('string(./div[4])')
            technique = ''
            if technique1:
                technique += technique1
            if technique2:
                technique += ', ' + technique2

            website = rowHtml.xpath('string(//div[@class="selection"]/a)')
            productDict['name'] = name
            if company :
                productDict['company'] = company
                for i in projectList:
                    if company == i['name']:
                        productDict['projectId'] = i['id']
                        break
            if website:
                productDict['detail']['introduction'] += '\n' + website
            productDict['detail']['technique'] = technique
            productDict['abstract'] = abstract
            print(productDict)
            productList.append(productDict)
            num += 1
            print(num)
        except:
            continue
    return productList



def parseAsset(driver, productList, projectList):
    num = 0
    rowList = driver.find_elements_by_xpath('//div[@class="wrapper-lister"]//div[@class="row-all clearfix"]')
    time.sleep(2)
    for index, row in enumerate(rowList):
        try:
            productDict = {
                "id": uuid.uuid4().hex,
                "projectId": "",
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
            row.click()
            time.sleep(2)
            html = etree.HTML(driver.page_source)
            rowHtml = html.xpath('//div[@class="wrapper-lister"]/div/div/div')[index + 1]
            name = rowHtml.xpath('string(./div[@class="col-xs-3 col-sm-3 col-md-3 col-lg-3 first-element"])')
            company = rowHtml.xpath('string(.//div[@class="col-xs-2 col-sm-2 col-md-2 col-lg-2 company-name"])')
            abstract = html.xpath('string(//div[@class="container-fluid"]/div//div[@label="\'Description\'"]/div/div/@ibp-markdown)')
            productDict['company'] = company
            if company :
                for i in projectList:
                    if company == i['name']:
                        productDict['projectId'] = i['id']
                        break
            technique1 = rowHtml.xpath('string(./div[4])')
            technique2 = rowHtml.xpath('string(./div[2])')
            technique = ''
            if technique1:
                technique +=  technique1
            if technique2:
                technique += ', ' + technique2
            website = rowHtml.xpath('string(//div[@class="selection"]/a)')
            productDict['name'] = name
            productDict['detail']['introduction'] = website
            productDict['detail']['technique'] = technique
            productDict['abstract'] = abstract
            print(productDict)
            productList.append(productDict)
            num += 1
            print(num)
        except:
            continue
    return productList


def parseUser(driver, userList):
    num = 0
    rowList = driver.find_elements_by_xpath('//div[@class="wrapper-lister"]//div[@class="row-all clearfix"]')
    time.sleep(2)
    for index, row in enumerate(rowList):
        try:
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
                "type": 0,
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
            row.click()
            time.sleep(2)
            html = etree.HTML(driver.page_source)
            rowHtml = html.xpath('//div[@class="wrapper-lister"]/div/div/div')[index + 1]
            name = rowHtml.xpath('string(.//div[@class="delegate-name align-vertical"])')
            # postion = rowHtml.xpath('string(.//div[@class="col-xs-2 col-sm-2 col-md-2 col-lg-2 delegate-title"])')
            company = rowHtml.xpath('string(.//div[@class="company-name align-vertical"])')
            keywords = rowHtml.xpath('string(.//div[@class="col-xs-3 col-sm-3 col-md-3 col-lg-3 company-type"])')
            a = rowHtml.xpath('//div[@label="\'LABEL_DELEGATE_AREA_EXP\' | translate"]/div[1]/div[2]/p/font/font/text()')
            if a:
                keywords += ' ' + ' '.join(a)
            userDict['name'] = name
            userDict['company'] = company
            userDict['keyword'] = keywords
            userList.append(userDict)
            num += 1
            print(num)
        except:
            continue

    return userList


def parseProject(driver, projectList):
    num = 0
    rowList = driver.find_elements_by_xpath('//div[@class="search-company-info"]')
    time.sleep(2)
    for index, row in enumerate(rowList):
        try:
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
            row.click()
            time.sleep(2)
            html = etree.HTML(driver.page_source)
            rowHtml = html.xpath('//div[@class="wrapper-lister"]/div/div/div')[index + 1]
            name = rowHtml.xpath('string(.//div[@class="company-name"])')
            keywords = rowHtml.xpath('string(.//div[@class="search-company-type"])')
            address = rowHtml.xpath('string(.//div[@class="search-company-country"])')

            abstract = rowHtml.xpath(
                "string(//div[@label=\"'LABEL_COMPANY_BRIEF_DESCRIPTION_FIELD' | translate\"]/div[1]/div[2]/p)")
            detailElementList = rowHtml.xpath(
                "//div[@class='card-compact']/ibp-company-description/div[@ng-form='description']/div[1]/div[2]/p")
            website = html.xpath("//div[@label=\"'LABEL_COMPANY_URL_FIELD' | translate\"]/div[1]/a/text()")
            if (len(website)):
                projectDict['website'] = website[0]
            detailStr = ''
            for detail in detailElementList:
                if (detail.text) :
                    detailStr += detail.text + '\n'
            projectDict['name'] = name
            projectDict['address'] = address
            projectDict['keyword'] = keywords
            projectDict['abstract'] = abstract
            projectDict['detail'] = detailStr

            projectList.append(projectDict)
            print(projectDict)
            num += 1
            print(num)
        except:
            continue

    return projectList

def dataToJson(newDataList, name):
    print(len(newDataList))
    with io.open(name + '.json', 'w', encoding='utf-8') as fo:
        fo.write(json.dumps(newDataList, ensure_ascii=False, indent=2, separators=(',', ': ')))


if __name__ == '__main__':
    username = "leroy.li@buttoninvest.com"
    password = "Button2018"
    loginUrl = "https://buttoncapital.partnering.bio.org"
    driver = webdriver.Chrome()
    login(driver, loginUrl, username, password)
    time.sleep(2)
    print('===')
    url = 'https://buttoncapital.partnering.bio.org/inova-business-platform/webclient/#/bio/4001/search/0/1/modifiedOn/companies'
    parseHtml(driver, url)
    driver.close()
