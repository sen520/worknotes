# import xlrd
#
# def read_excel():
#     # 读取文件
#     workbook = xlrd.open_workbook(r'company.xlsx')
#
#     # 获取所有 sheet
#     # print(workbook.sheet_names())  # ['安徽上市公司列表', 'Pivot Table 1', 'Pivot Table 2', '规上企业', '规上企业初筛', 'Pivot Table 3']
#     # sheet_name = workbook.sheet_names()[0]
#
#     # 根据sheet索引或者名称获取内容
#     # sheet = workbook.sheet_by_index(0)
#     sheet = workbook.sheet_by_name('安徽上市公司列表')
#     cols = sheet.col_values(0)
#     # print(sheet.name, sheet.nrows, sheet.ncols)
#     print(cols)
#
# if __name__ == '__main__':
#     read_excel()


from selenium import webdriver

wd = webdriver.Chrome()

c = [{"name": "UM_distinctid", "value": "167df3bd9d1bf-094eee395a5886-594d2a16-1fa400-167df3bd9d36f5"},
             {"name": "_uab_collina", "value": "154563850192558180877668"},
             {"name": "saveFpTip", "value": "true"},
             {"name": "CNZZDATA1254842228", "value": "1308816306-1545633217-%7C1546911603"},
             {"name": "hasShow", "value": "1"},
             {"name": "QCCSESSID", "value": "9irne2emp9eo65vdes3jjsl577"},
             {"name": "Hm_lpvt_3456bee468c83cc63fb5147f119f1075", "value": "1546916773"},
             {"name": "Hm_lvt_3456bee468c83cc63fb5147f119f1075",
              "value": "1545793326,1546914502,1546915366,1546916729"},
             {"name": "zg_de1d1a35bfa24ce29bbf2c7eb17e6c4f",
              "value": "%7B%22sid%22%3A%201546914499835%2C%22updated%22%3A%201546916777128%2C%22info%22%3A%201546914499842%2C%22superProperty%22%3A%20%22%7B%7D%22%2C%22platform%22%3A%20%22%7B%7D%22%2C%22utm%22%3A%20%22%7B%7D%22%2C%22referrerDomain%22%3A%20%22%22%2C%22cuid%22%3A%20%228e8f9880b9b499b75465dbe38af72d81%22%7D"}
             ]
wd.get('https://www.baidu.com/')

for i in c:
    wd.add_cookie(i)
wd.get('https://www.qichacha.com/')