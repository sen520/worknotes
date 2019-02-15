#!/usr/bin/env python
# coding: utf-8

# In[12]:


# coding=utf-8
import os
from selenium.webdriver import Chrome
from selenium.webdriver import ChromeOptions
from selenium.webdriver.support import ui
import json
import time
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


def create_driver(
        driverPath='/Users/qiangzhang/chromedriver',
        outputPath='/Users/qiangzhang/Downloads/clinic'):
    """
    Create a driver configuring download to default folder without asking for confirm.

    :return: the created chrome driver.
    """
    option = ChromeOptions()
    option.add_experimental_option("prefs", {
        "profile.default_content_settings.popups": 0,
        "download.default_directory": outputPath,
    })
    driver = Chrome(driverPath, chrome_options=option)
    return driver

class ChinaClinicalTrialXml(object):

    def __init__(self, work_directory):
        self.url = 'http://www.chictr.org.cn/searchproj.aspx'
        self.driver = create_driver()
        self.path = work_directory

    def run(self):
        if os.path.exists(os.path.join(self.path, 'links.json')):
            links = json.load(open(os.path.join(self.path, 'links.json'), 'r'))
        else:
            self.driver.get(self.url)
            self.get_page_count()
            links = []
            for page in range(self.number_page):
                print('process page {}'.format(page + 1))
                links.extend([element.get_attribute('href') for element in
                              self.driver.find_elements_by_xpath("//table[@class='table_list']//tbody/tr/td/p/a")])
                self.goto_page(page + 2)
            with open(os.path.join(self.path, 'links.json'), 'w') as fo:
                json.dump(links, fo)
        # process page
        files = os.listdir(self.path)
        for link in links[len(files) - 1:]:
            self.download_xml(link)
        self.driver.close()

    def download_xml(self, link):
        print('download page {}'.format(link))
        self.driver.get(link)
        ui.WebDriverWait(self.driver, 0).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='ProjetInfo_title']/a")))
        element = self.driver.find_element_by_xpath("//div[@class='ProjetInfo_title']/a")
        element.click()

    def get_page_count(self):
        self.number_records = int(self.driver.find_element_by_xpath('/html/body/div[4]/div[3]/p/b').text)
        self.number_page = int((self.number_records + 9) / 10)
        print('found {} results for {} pages'.format(self.number_records, self.number_page))

    def goto_page(self, page):
        # starts with 1
        print('go to page {}'.format(page))
        self.driver.get('http://www.chictr.org.cn/searchproj.aspx?title=&officialname=&subjectid=&secondaryid=&applier=&studyleader=&ethicalcommitteesanction=&sponsor=&studyailment=&studyailmentcode=&studytype=0&studystage=0&studydesign=0&minstudyexecutetime=&maxstudyexecutetime=&recruitmentstatus=0&gender=0&agreetosign=&secsponsor=&regno=&regstatus=0&country=&province=&city=&institution=&institutionlevel=&measure=&intercode=&sourceofspends=&createyear=0&isuploadrf=&whetherpublic=&btngo=btn&verifycode=nwymv&page={}'.format(page))
        time.sleep(2)


if __name__ == '__main__':
    # list the category.
    sourceDirectory = os.path.join(os.curdir, "clinic")
    task = ChinaClinicalTrialXml(sourceDirectory)
    task.run()


# In[ ]:




