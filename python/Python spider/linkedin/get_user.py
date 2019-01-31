import requests
from lxml import etree
import pymongo


class Spider(object):
    def __init__(self):
        self.person = pymongo.MongoClient('mongodb://localhost:27017').linkin.person
        self.data_list = []
        self.url = 'https://www.linkedin.com/directory/people-more-1'
        self.headers = {
            'Cookie': 'bcookie="v=2&dca1b3f8-c8df-4a03-89d1-e9b27563a49e"; bscookie="v=1&2019012509022945e29473-1871-4bb5-87a1-8e58c63658e7AQFpv1pLFx-jpDO86gEaTvFsHegT1Uic"; _lipt=CwEAAAFol2zkeyjNgpuIuMHVP-Y6Vr0TsfUPvmVar3TrMctJttWuYTtjMj_IDLEcTt2Z1UMVueSjhofPj6vD2ZFOAYPBupIkwzyrSAw40p629P-9L_dlCsNN10RZ3DhQ6GeL_en3IoYyL1pRLc29YgiWMr_wlT_KNrOhVbi3bimeQ_JN1HA3C3kv1gNx_nqVcbmbWKpW8RK_n6GOFcqXcGkFmqoFC_XIFSzdj--CHPQt1YypcMAiygFtMtW_LAiCxsQ; _ga=GA1.2.449209128.1548728721; li_oatml=AQFZ7mrEaSKGigAAAWiXbPcmRFPkI8LLZgyVMZEqFZGj-JOJ2Uw3tGKpK6E2R7DLnSuST6cCvlMxKt4zc-nqGI-MsBW8vxZi; UserMatchHistory=AQKa8zOgel3aSwAAAWiXbQCBFKFQNkH7GIsDf7ceLasQsJd-KXBTPA4sInLsjux41KYBv_fAmfLRHzz9RX_q0NXbk0jCe2ESaQKn_SwFTw; visit=v=1&M; _gat=1; __utma=226841088.449209128.1548728721.1548729621.1548729621.1; __utmc=226841088; __utmz=226841088.1548729621.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmt=1; AMCVS_14215E3D5995C57C0A495C55%40AdobeOrg=1; AMCV_14215E3D5995C57C0A495C55%40AdobeOrg=-1891778711%7CMCIDTS%7C17926%7CMCMID%7C62499842196695776334374035905175566687%7CMCAAMLH-1549334472%7C11%7CMCAAMB-1549334472%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCCIDH%7C-1485060353%7CMCOPTOUT-1548736872s%7CNONE%7CMCSYNCSOP%7C411-17933%7CvVersion%7C2.4.0; ELOQUA=GUID=1CFE017A5AF64C5BA5805E6C280451C7; JSESSIONID="ajax:8368880195365051852"; __utmb=226841088.3.10.1548729621; li_at=AQEDASkK4pgEqYztAAABaJd9IcYAAAFou4mlxlEABZrNc8CYvcOZhqQmOBhpEHiETOC8mWzHFaSsbDWQQ5dRLUtA6ZKawtGVPwKh_5Y6RyVeT1sc3NUUied4au_alcUcukGbYfNLmp1Is06ytk4RmFwI; wwepo=true; sl=v=1&5VJzR; liap=true; li_cc=AQHM2DKEcFhQUwAAAWiXfSNXGAnVSR-LJKL-DUjFSzcZEo_bQYgZhfPJYknKsHEUzxOW2B7O7TeC; lang=v=2&lang=zh-cn; lidc="b=SB24:g=189:u=2:i=1548729868:t=1548810967:s=AQEnMPkcnecNIvXpxbPDfTB2HhoedpPD"',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
        }
        self.page = None

    def get_url(self):
        response = requests.get(self.url, headers=self.headers)
        html = etree.HTML(response.text)
        self.page = html.xpath('//div[@class="section bucket-container"][2]//li[@class="bucket-item"]/a/@href')
        page_num = 1
        for page_url in self.page:
            response = requests.get(page_url, headers = self.headers)
            page_html = etree.HTML(response.text)
            person_href = page_html.xpath('//li[@class="content"]/a/@href')
            person_name = page_html.xpath('//li[@class="content"]/a/text()')
            self.data_list.extend(person_href)
            print('一共%d页，正在抓取%d页' % (len(self.page), page_num))
            page_num += 1
            # self.save_url(person_href, person_name)

    def save_url(self, url_list, name_list):
        for url, name in zip(url_list, name_list):
            self.person.insert({'name': name, 'url': url})

    def get_url_from_mongo(self):
        data_objects = self.person.find()
        for data in data_objects:
            print(data['url'])
            response = requests.get(data['url'], headers = self.headers)
            html = etree.HTML(response.text)
            a = html.xpath('//p[@class="subline-level-1 t-14 t-black t-normal search-result__truncate"]/span/text()')
            print(response.text)
            self.data_list.append(data['url'])
            break

    def run(self):
        self.get_url_from_mongo()


if __name__ == '__main__':
    spider = Spider()
    spider.run()
