/* eslint-disable import/order,prefer-destructuring */
const redis = require('redis');
const config = require('./config.json');

const REDIS_SERVER = config.redis;
const redisRegister = redis.createClient({ host: REDIS_SERVER, db: 0 });
const redisGroup = redis.createClient({ host: REDIS_SERVER, db: 3 });
const redisLogin = redis.createClient({ host: REDIS_SERVER, db: 1 });
const redisPassword = redis.createClient({ host: REDIS_SERVER, db: 2 });
const redisPermission = redis.createClient({ host: REDIS_SERVER, db: 4 });
const redisTranslate = redis.createClient({ host: REDIS_SERVER, db: 5 });
const MongoClient = require('mongodb').MongoClient;

const mongoClient = MongoClient.connect(config.mongo);

module.exports = {
  redisRegister,
  redisGroup,
  redisLogin,
  redisPassword,
  redisPermission,
  mongo: mongoClient,
  REDIS_SERVER,
  redisTranslate,
};
