import requests
import re

# html_url = 'https://partneringone.knect365.com/event/620/search/alphabetical-list/company/1014'
# a = re.search('\d+$', html_url)
# url = 'https://api.partneringone.knect365.com/events/profile/620/company/'+ a.group()
# headers = {
#     'Accept': '*/*',
#     'Accept-Encoding': 'gzip, deflate, br',
#     'Accept-Language': 'zh-CN,zh;q=0.9',
#     'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25JZCI6MzEyNDE2NCwidXNlclR5cGUiOiJ1c2VyIiwiaXNUcnVzdGVkRGV2aWNlIjpmYWxzZSwiZXhwaXJhdGlvbkRhdGUiOjE1NDUwMTcyMjE0NzEsImlhdCI6MTU0NTAxNDg0OX0.AFrXZLTte_9MNis7xgQMA6vPI464WxkcsNtjBbjDTas',
#     'Connection': 'keep-alive',
#     'correlation-id': '03869b8f-2bd7-f545-e961-aa7f7b11c623',
#     'Host': 'api.partneringone.knect365.com',
#     'If-None-Match': 'W/"9e98-EKSqpobMlpr8lQ5IxG/ZJuyRMjM"',
#     'Origin': 'https://partneringone.knect365.com',
#     'Referer': url,
#     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36}'}
# res = requests.get(url=url, headers=headers)
# print(res.text)

# url = 'https://api.partneringone.knect365.com/events/tags/620/byTarget/company/1178'
# headers = {
#     'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25JZCI6MzEyNDE2NCwidXNlclR5cGUiOiJ1c2VyIiwiaXNUcnVzdGVkRGV2aWNlIjpmYWxzZSwiZXhwaXJhdGlvbkRhdGUiOjE1NDUwMTcyMjE0NzEsImlhdCI6MTU0NTAxNDg0OX0.AFrXZLTte_9MNis7xgQMA6vPI464WxkcsNtjBbjDTas',
#     'Accept': '*/*',
#     'Accept-Encoding': 'gzip, deflate, br',
#     'Accept-Language': 'zh-CN,zh;q=0.9',
#     'Access-Control-Request-Headers': 'authorization,correlation-id',
#     'Access-Control-Request-Method': 'GET',
#     'Connection': 'keep-alive',
#     'Host': 'api.partneringone.knect365.com',
#     'Origin': 'https://partneringone.knect365.com',
#     'Referer': 'https://partneringone.knect365.com/event/620/search/alphabetical-list?doctypes[0]=company&sectionId=2&size=20&start=40',
#     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36'
# }
# res = requests.get(url=url,headers=headers)
# print(res.text)

url = 'https://partneringone.knect365.com/event/620/search/alphabetical-list?doctypes[0]=company&sectionId=2&size=20&start=40'
headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXJzb25JZCI6MzEyNDE2NCwidXNlclR5cGUiOiJ1c2VyIiwiaXNUcnVzdGVkRGV2aWNlIjpmYWxzZSwiZXhwaXJhdGlvbkRhdGUiOjE1NDUwMTcyMjE0NzEsImlhdCI6MTU0NTAxNDg0OX0.AFrXZLTte_9MNis7xgQMA6vPI464WxkcsNtjBbjDTas',
    'Connection': 'keep-alive',
    'correlation-id': '03869b8f-2bd7-f545-e961-aa7f7b11c623',
    'Host': 'api.partneringone.knect365.com',
    'If-None-Match': 'W/"9e98-EKSqpobMlpr8lQ5IxG/ZJuyRMjM"',
    'Origin': 'https://partneringone.knect365.com',
    'Referer': url,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36}'}
res = requests.get(url=url, headers=headers)

print(res)
