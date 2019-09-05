RUN `docker run -d -v /root/data:/root/data imageName`

mv config to master /root/data 



如果mongo是集群, mongo的配置应该是ip的形式

```
config = {
      "_id" : "rs0",
      "members" : [
          {
              "_id" : 0,
              "host" : "192.168.1.35:27018"
          },
          {
              "_id" : 1,
              "host" : "192.168.1.35:27019"
          },
          {
              "_id" : 2,
              "host" : "192.168.1.35:27020"
          }
      ]
  }
rs.initiate(config)
```

