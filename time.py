import datetime
import pymongo

import pytz
client = 'mongodb://localhost:27017'
data = pymongo.MongoClient(client).data.data
utc_tz = pytz.timezone('UTC')
da = datetime.datetime.now(tz=utc_tz)
data.insert({'time': da})