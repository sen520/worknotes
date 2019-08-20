```
mongod --replSet node --dbpath . --port 27018
mongod --replSet node --dbpath . --port 27019

mongo 127.0.0.1:27018'
> rs.status()
> config = {
    "_id": "node",
    "members": [
    {"_id": 0, "host": "192.168.1.2:27018"},
    {"_id": 1, "host": "192.168.1.2:27019"},
	]
}
> rs.initiate(config)
```

