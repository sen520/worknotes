import pymongo
import json, io, uuid, re

def get_info():
    client = pymongo.MongoClient('mongodb://localhost:27017')
    data_list = client.medicine.data.find()
    list = []
    for single_data in data_list:
        # print(single_data)
        dict = {'name': '', 'person': '', 'website': '', 'line': '', 'phone': '', 'addr': '', 'product': '', 'url': ''}
        dict['name'] = single_data['name']
        if single_data['name'] == '':
            continue
        # new_dict = {'id': uuid.uuid4().hex,'name': i['name'], 'product': i['product'], 'contact': i['contact']}
        # list.append(new_dict)
        for contact in single_data['contact']:
            # print(contact)
            if re.search('公司名称', contact):
                dict['name'] = contact.replace('公司名称：', '')
            if re.search('联 系 人', contact):
                dict['person'] = contact.replace('联 系 人：', '')
            if re.search('公司网址', contact):
                dict['website'] = contact.replace('公司网址：', '')
            if re.search('联系电话', contact):
                dict['line'] = contact.replace('联系电话：', '')
            if re.search('手    机', contact):
                dict['phone'] = contact.replace('手    机：', '')
            if re.search('单位地址', contact):
                dict['addr'] = contact.replace('单位地址：', '')
            if re.search('联系地址', contact):
                dict['addr'] = contact.replace('联系地址：', '')
        dict['product'] = '; '.join(single_data['product'])
        dict['url'] = single_data['url']
        list.append(dict)
    return list


def save_info(data_list, name):
    with io.open(name + '.json', 'w', encoding='utf-8') as fo:
        fo.write(json.dumps(data_list, ensure_ascii=False, indent=2, separators=(',', ': ')))


if __name__ == '__main__':
    data_list = get_info()
    save_info(data_list, 'data')