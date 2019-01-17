const uuid4 = require('uuid/v4');
const { mongo, redisPermission, redisLogin } = require('./server');
const { setResult, setError, deepCopy } = require('./utility');
const { ObjectId } = require('mongodb');
const { promisify } = require('util');
const constant = require('button-constant');
const crypto = require('crypto');

const getAsync = promisify(redisPermission.get).bind(redisPermission);
const getAsyncLogin = promisify(redisLogin.get).bind(redisLogin);

/**
 * 执行查询操作
 *
 * @param db 数据库对象
 * @param userId id of the user under query. It can be string or an array.
 * @param targetId id of the data under query. It can be string, ObjectId or an
 *  array or such or mix.
 * @param type type of the data under query
 */
async function queryPermissionTable(db, userId, targetId, type) {
  const userIds = [''];
  if (Array.isArray(userId)) {
    // Remove duplicate to improve performance
    userIds.push(...(new Set(userId)));
  } else {
    userIds.push(userId);
  }
  const query = {
    userId: { $in: userIds },
    type,
  };
  if (Array.isArray(targetId)) {
    query.targetId = { $in: targetId.map(ObjectId) };
  } else {
    query.targetId = ObjectId(targetId);
  }
  const result = await db.collection('permission')
    .aggregate(
      [
        { $match: query },
        { $group: { _id: '$targetId', permission: { $max: '$permission' } } }])
    .toArray();
  return result;
}


/**
 * Queries a permission.
 *
 * Note it will check the groups managed by the user.
 *
 * @param userId id of the user under query
 * @param targetId id of the data under query
 * @param type type of the data under query
 * @param res response object
 */
async function queryPermission(userId, targetId, type, res) {
  try {
    if (!userId || !targetId || !type) {
      const message = `unrecognized for user ${userId} and ${type} ${targetId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const db = (await mongo).db('data');
    // Check the permission for user and also public
    const groups = await db.collection('group').find(
      { $or: [{ creatorId: userId }, { managerId: userId }] },
      { projection: { creatorId: 1, managerId: 1, memberId: 1 } }).toArray();
    const userIds = [userId];
    groups.forEach((g) => {
      userIds.push(g.creatorId);
      userIds.push(...g.managerId);
      userIds.push(...g.memberId);
    });
    const result = await queryPermissionTable(db, userIds, targetId, type);
    if (result.length === 0) {
      setResult(res, 200, { permission: 1 });
      return;
    }
    const { permission } = result[0];
    const message = `permission ${permission} found for user ${userId} and ${type} ${targetId}`;
    console.log(message);
    setResult(res, 200, { permission });
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Queries multiple permissions.
 *
 * Note it will check the groups managed by the user.
 *
 * @param userId id of the user under query
 * @param targetIdArray id array of the data under query
 * @param type type of the data under query
 * @param res response object
 */
async function queryMultiplePermission(userId, targetIdArray, type, res) {
  try {
    if (!userId || !targetIdArray || !type) {
      const message = `unrecognized for user ${userId} and ${type} ${targetIdArray}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const db = (await mongo).db('data');
    const groups = await db.collection('group').find(
      { $or: [{ creatorId: userId }, { managerId: userId }] },
      { projection: { creatorId: 1, managerId: 1, memberId: 1 } }).toArray();
    const userIds = [userId];
    groups.forEach((g) => {
      userIds.push(g.creatorId);
      userIds.push(...g.managerId);
      userIds.push(...g.memberId);
    });
    const result = await queryPermissionTable(db, userIds, targetIdArray, type);
    if (result === null || result.length < 1) {
      const message = `no permission for user ${userId} and ${type} ${targetIdArray}`;
      console.warn(message);
      setResult(res, 200, { permission: constant.PERMISSION.PERMISSION_TYPE.list });
      return;
    }
    const dict = {};
    result.forEach((response) => {
      // eslint-disable-next-line no-underscore-dangle
      dict[response._id] = response.permission;
    });

    const message = `permission ${result} found for user ${userId} and ${type} ${targetIdArray}`;
    console.log(message);
    setResult(res, 200, { permission: dict });
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Creates a permission
 *
 * @param userId id of the user for the permission
 * @param targetId id of the data the permission
 * @param sourceId id of the user performing this operation
 * @param type type of the data the permission
 * @param permission permission to be set. Note if this permission is higher
 *  than what sourceId has, this operation will fail
 * @param res response object
 */
async function createPermission(userId, targetId, sourceId, type, permission, res) {
  try {
    if (!userId || !targetId || !type || !sourceId || !permission) {
      const message = `unrecognized for user ${userId} and ${type} ${targetId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (permission <= constant.PERMISSION.PERMISSION_TYPE.list) {
      const message = `${permission} is lower or equal to default permission. this will be a noop.`;
      console.warn(message);
      setResult(res, 204, { message });
      return;
    }
    const db = (await mongo).db('data');
    const sourceQuery = {
      userId: sourceId,
      targetId: ObjectId(targetId),
      type,
      permission: { $gte: permission },
    };
    const sourcePermission = await db.collection('permission')
      .findOne(sourceQuery);
    if (sourcePermission === null) {
      const message = `no sufficient permission for user ${userId} and ${type} ${targetId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    // update the permission
    const data = newPermission(userId, ObjectId(targetId), type, permission);
    data.sourceId = sourceId;
    delete data.permission;
    const query = { userId, targetId: ObjectId(targetId) };
    // Create or replace a lower permission
    try {
      await db.collection('permission').updateMany(
        query,
        { $max: { permission }, $setOnInsert: data },
        { upsert: true });
      const message = `permission updated for user ${JSON.stringify(data)}`;
      console.log(message);
      setResult(res, 200, { message });
    } catch (error) {
      const message = `fail to add permission for user ${userId} and ${type} ${targetId}`;
      console.error(message);
      setResult(res, 400, { message });
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Creates a permission.
 *
 * @param userId id of user own the permission
 * @param targetId id of the target document
 * @param type type of document
 * @param permission type of permission
 */
function newPermission(userId, targetId, type, permission) {
  const data = {
    userId,
    targetId,
    type: constant.PERMISSION.RESOURCE_TYPE[type],
    permission: constant.PERMISSION.PERMISSION_TYPE[permission],
    id: uuid4(),
  };
  return Object.assign(deepCopy(constant.PERMISSION.TEMPLATE), data);
}

/**
 * Requests permission for userId and targetId from sourceId.
 *
 * @param userId id of user who is making the request
 * @param targetId document for which the permission is requested
 * @param sourceId id of the user who will receive the request
 * @param type type of the document
 * @param permission permission value
 * @param res response object
 * @return {Promise<void>}
 */
async function requestPermission(userId, targetId, sourceId, type, permission, res) {
  try {
    if (!userId || !targetId || !type || !sourceId || !permission) {
      const message = `unrecognized for user ${userId} and ${type} ${targetId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (permission <= constant.PERMISSION.PERMISSION_TYPE.list) {
      const message = `${permission} is lower or equal to default permission. this will be a noop.`;
      console.warn(message);
      setResult(res, 204, { message });
      return;
    }
    const db = (await mongo).db('data');
    const sourceQuery = {
      userId: sourceId,
      targetId: ObjectId(targetId),
      type,
      permission: { $gte: permission },
    };
    const sourcePermission = await db.collection('permission')
      .findOne(sourceQuery);
    if (sourcePermission === null) {
      const message = `no sufficient permission for user ${userId} and ${type} ${targetId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    // check its existing permission
    const result = await db.collection('permission').findOne(
      {
        userId,
        targetId: ObjectId(targetId),
        type,
        permission: { $gte: permission },
      });
    if (result !== null) {
      const message = `permission already satisfied for user ${userId} and ${type} ${targetId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    // update the permission
    const data = {
      id: uuid4(),
      userId,
      targetId,
      type,
      permission,
      sourceId,
      credit: 0,
    };
    redisPermission.set(data.id, JSON.stringify(data));
    const message = `permission request with token=${data.id}`;
    setResult(res, 200, { token: data.id, message });
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Grants the permission request.
 *
 * @param token token for the permission request
 * @param res response object
 */
async function grantPermission(token, callback, res) {
  try {
    const reply = await getAsync(token);
    if (!reply) {
      const message = `fail to retrieve the permission request for token ${token}`;
      console.error(message);
      setResult(res, 400, { message });
    }
    redisPermission.del(token);
    const data = JSON.parse(reply);
    const { userId, type, permission, targetId } = data;
    if (!userId || !type || !permission || !targetId) {
      const message = `bad permission request for token ${data}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    data.targetId = ObjectId(data.targetId);
    const query = {
      userId,
      targetId: ObjectId(targetId),
      type,
      permission: { $lt: permission },
    };
    const db = (await mongo).db('data');
    // Create or replace a lower permission
    try {
      db.collection('permission').replaceOne(
        query,
        data,
        { upsert: true });
      const message = `permission updated for user ${JSON.stringify(data)}`;
      console.log(message);
      if (callback) {
        res.redirect(callback);
      } else {
        setResult(res, 200, { message });
      }
    } catch (error) {
      const message = `fail to add permission for user ${userId} and ${type} ${targetId}`;
      console.error(message);
      setResult(res, 400, { message });
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * 验证签名
 *
 * @param req  request object
 * @param res response object
 * @param next next function 继续执行下一步操作
 */
async function authSignPermission(req, res, next) {
  try {
    let url = req.originalUrl;
    // Pattern starts with or without / and followed by url in the white list.
    const AUTH_WHITELIST = new RegExp(`^/{0,1}(${constant.AUTH.WHITELIST.join('|')})`);
    if (AUTH_WHITELIST.test(url)) {
      console.log('白名单');
      next();
      return;
    }
    const { authorization } = req.headers;
    const infoList = authorization.split(':');
    let bodyString = req.body;
    if (typeof (bodyString) !== 'string') {
      bodyString = JSON.stringify(req.body);
    }
    const token = await getAsyncLogin(infoList[0]);
    if (token === null) {
      const message = 'fail to get user';
      console.error(message);
      setResult(res, 500, { message });
      return;
    }
    // post请求连接加密前端加了 "？"
    if (req.method === 'POST') {
      url += '?';
    }
    const middle = crypto.createHmac('sha1', token).update(url).digest('hex');
    const signature = crypto.createHmac(
      'sha1', middle).update(Object.keys(req.body).length > 0 ? bodyString : '').digest('hex');
    if (infoList[1] === signature) {
      const message = 'get permission';
      console.log(message);
      next();
      return;
    }
    const message = 'no permission';
    console.error(message);
    setResult(res, 403, { message });
  } catch (e) {
    console.error(e.message);
    setResult(res, 500, { message: e.message });
  }
}

module.exports = {
  queryPermission,
  queryMultiplePermission,
  createPermission,
  newPermission,
  requestPermission,
  grantPermission,
  queryPermissionTable,
  authSignPermission,
};
