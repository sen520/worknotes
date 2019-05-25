# def find_tag(tag, d, tag_list=[]):
#     print(d)
#     for key in d.keys():
#         # print('key', key, tag, key==tag)
#         tag_list.append(key)
#         if tag == key:
#             return tag_list
#         else:
#             tag_list = find_tag(tag, d[key], tag_list)
#     return tag_list
#
#
# d = {
#     "Torso": {
#         "Abdomen": {
#             "Abdominal Cavity": {
#                 "Peritoneum": {
#                     "Douglas' Pouch": {},
#                     "Mesentery": {
#                         "Mesocolon": {}
#                     },
#                     "Omentum": {},
#                     "Peritoneal Cavity": {},
#                     "Peritoneal Stomata": {}
#                 },
#                 "Retroperitoneal Space": {}
#             },
#         }
#     },
# }
# a = find_tag('Peritoneal Stomata', d)
# print(a)
import json
import io
import pymongo


class Test():
    def __init__(self):
        self.num = 0
        self.l = []
        self.client = pymongo.MongoClient('mongodb://localhost:27017')
        self.tag = self.client.exportTag.tag

    def parse(self, d, parent=-1):
        for key in d.keys():
            # self.l.append({"p": parent, "name": key, "c": self.num + 1})
            self.num = self.num + 1
            self.save({"p": parent, "name": key, 'self':self.num, "c": self.num + 1})
            self.parse(d[key], self.num)

    def save(self, data):
        self.tag.insert(data)
        # with io.open('./tag/' + 'a' + '.json', 'w', encoding='utf-8') as fo:
        #     fo.write(json.dumps(data, ensure_ascii=False, indent=2, separators=(',', ': ')))


with open('./data/mesh.json', 'r') as f:
    d = json.loads(f.read())
t = Test()
t.parse(d)
