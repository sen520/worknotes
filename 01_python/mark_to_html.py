import markdown
import pymongo
import re


class MarkToHtml(object):
    def __init__(self, client):
        self.db = client.data
        self.entity = self.db.entity

    @staticmethod
    def markdown_to_html(string):
        return markdown.markdown(string).replace('\n', '<br/>')

    # 子字段
    def update_field(self, field):
        for data in self.entity.find({'$and': [{field: {'$exists': True}},{field: {'$ne': ''}}]}, projection=[field]):
            if re.search('\.', field):
                field_list = field.split('.')
                field_str = self.markdown_to_html(data[field_list[0]][field_list[1]])
            else:
                field_str = self.markdown_to_html(data[field])
            self.entity.update_one({'_id': data['_id']}, {'$set': {field: field_str}})

    def run(self, fields):
        for field in fields:
            self.update_field(field)

if __name__ == '__main__':
    client = pymongo.MongoClient('mongodb://localhost:27017')
    field = ['intro', 'onepage.bg', 'onepage.prod', 'onepage.high', 'onepage.team', 'entr.fin', 'entr.market',
             'entr.tech', 'entr.grant', 'asset.tech', 'asset.market', 'course.abs']

    markdown_to_html = MarkToHtml(client)
    markdown_to_html.run(field)
