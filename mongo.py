import datetime
import json

from bson import ObjectId
from pymongo import MongoClient
import logging


def create_logger(name):
    """
    create log file

    :param name: file of absolute path
    :return: log object
    """
    log = logging.getLogger(name)
    log.handlers = []
    log.setLevel(logging.DEBUG)
    log.addHandler(logging.FileHandler(name))
    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.WARNING)
    log.addHandler(stream_handler)
    return log


def change_type(object):
    """
    change mongo field type

    :param object: object to change
    :return: object
    """
    data_dict = {}
    for key, value in object.items():
        if isinstance(value, ObjectId):
            data_dict[key] = str(value)
        if isinstance(value, datetime.datetime):
            data_dict[key] = datetime.datetime.strftime(value, '%Y-%m-%d %H:%M:%S')
    return data_dict


class Database(object):
    def __init__(self, address, database, log_dir):
        self.client = MongoClient(host=address)
        self.database = database
        self.db = self.client[database]
        self.log = create_logger(log_dir)

    def get_state(self):
        """
        Get connection status

        :return:
        """
        return self.client is not None and self.db is not None

    def get_db_state(self):
        """
        check db

        :return: Whether db in database or not
        """
        if self.database in self.client.list_database_names():
            return True
        return False

    def get_collection_state(self, collection):
        """
        check collection

        :param collection:
        :return: Whether collection in db or not
        """
        if self.get_db_state():
            if collection in self.client[self.database].list_collection_names():
                return True
        self.log.error('database or collection is not exist')
        return False

    def insert_one(self, collection, data):
        """
        Insert a piece of data

        :param collection:
        :param data:
        :return: string of mongo ObjectId
        """
        self.log.info('-------------' + str(datetime.datetime.now()) + '-----------------')
        self.log.info('insert_one  collection:{}, data:{}'.format(collection, json.dumps(data)))
        if self.get_state():
            result = self.db[collection].insert_one(data)
            return result.inserted_id
        else:
            self.log.error('something connect error')
            return ""

    def insert_many(self, collection, data):
        """
        Insert multiple data

        :param collection:
        :param data:
        :return:
        """
        self.log.info('-------------' + str(datetime.datetime.now()) + '-----------------')
        self.log.info('insert_many  collection:{}, data:{}'.format(collection, json.dumps(data)))
        if self.get_state():
            ret = self.db[collection].insert_many(data)
            return ret.inserted_id
        else:
            self.log.error('something connect error')
            return ""

    def update(self, collection, condition=None, data=None, multi=False):
        """
        update data

        :param collection: collection name
        :param condition: Query condition
        :param data:
        :param multi:
        :return:
        """
        if not self.get_collection_state(collection):
            return ''
        self.log.info('-------------' + str(datetime.datetime.now()) + '-----------------')
        self.log.info(
            'update  collection:{}, condition:{}, update_data: {}'.format(collection, change_type(condition),
                                                                          change_type(data)))
        if condition is None or data is None:
            self.log.error('the condition and update_data is invalid')
            return 0
        if not self.get_state():
            self.log.error('something connect error')
            return 0
        return self.db[collection].update(condition, {"$set": data}, multi=multi)

    def find(self, collection, condition, column=None):
        """
        Query data

        :param collection: collection name
        :param condition: Query condition
        :param column:
        :return: Cursor
        """
        if self.get_state():
            if column is None:
                return self.db[collection].find(condition)
            else:
                return self.db[collection].find(condition, column)
        else:
            self.log.error('something connect error')
            return 0

    def find_one(self, collection, condition, column=None):
        """
        Query one data

        :param collection: collection name
        :param condition: Query condition
        :param column:
        :return: result of query
        """
        if self.get_state():
            if column is None:
                return self.db[collection].find_one(condition)
            else:
                return self.db[collection].find_one(condition, column)
        else:
            self.log.error('something connect error')
            return 0

    def remove(self, collection, condition=None, multi=False):
        """
        delete data

        :param collection: collection name
        :param condition:  delete condition
        :param multi: Whether it is a batch operation
        :return: Number of deletions
        """
        self.log.info('-------------' + str(datetime.datetime.now()) + '-----------------')
        self.log.info(
            'remove  collection:{}, condition:{}'.format(collection, json.dumps(condition)))

        if condition != {} and condition != None or multi == True and condition == {}:
            # condittion为{}时不会清空集合，只有在multi为True时，才会清空
            if self.get_state():
                return self.db[collection].delete_many(filter=condition).deleted_count
            self.log.error('something connect error')
            return 0
        else:
            logging.error('must have condition')
            return ''


if __name__ == '__main__':
    db = Database("127.0.0.1:27017", "asd", './db.log')
    db.remove('t', {}, multi=True)
