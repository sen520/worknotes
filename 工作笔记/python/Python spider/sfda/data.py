from uuid import uuid4

import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017')

company_name_collection = client.a.companyName

sfda = client.sfda.companyName

company_names = company_name_collection.find()

company_name_list = []

for company_name in company_names:
    company_name_list.append(company_name['name'])
collection = set(company_name_list)
new_list = list(collection)

for name in new_list:
    print(name)
    # sfda.insert({'id': uuid4().hex, 'name': name})