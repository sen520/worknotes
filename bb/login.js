const { mongo, redisLogin } = require('./server');
const uuid4 = require('uuid/v4');
const { validateEmail, validatePhone, setResult, setError } = require('./utility');
const { promisify } = require('util');

const getAsync = promisify(redisLogin.get).bind(redisLogin);

/**
 * Signs user into the system.
 *
 * After user is signed in, a token will be created to authenticate user when
 * accessing the rest api. It will expire after 12 hours.
 *
 * @param email email of the user
 * @param phone phone of the user. Ignored when email is available
 * @param res to return result
 * @param password obfuscated password of the user
 */
async function loginWithPassword(email, phone, password, res) {
  try {
    const emailValidated = validateEmail(email) ? email : undefined;
    const phoneValidated = validatePhone(phone) ? phone : undefined;
    if (typeof password !== 'string' || password.length < 1) {
      const message = 'password is illegal';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (emailValidated === undefined && phoneValidated === undefined) {
      const message = 'email or password is not valid';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const db = (await mongo).db('data');
    const query = { password };
    if (emailValidated !== undefined) {
      query.email = { $regex: new RegExp(`^${emailValidated}$`, 'i') };
    } else if (emailValidated !== phoneValidated) {
      query.phone = phoneValidated;
    }
    const result = await db.collection('user').findOne(query);
    if (result === null) {
      const message = 'no such user';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    loginSucceed(result, res);
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Returns the user when login succeed.
 *
 * @param result retrieve user information
 * @param res response object
 */
async function loginSucceed(result, res) {
  // reuse previous token if possible
  let reply = null;
  try {
    reply = await getAsync(result.id);
  } catch (err) {
    console.error(`fail to get login token for ${result.id}`);
  }
  if (reply === null) {
    console.log(`no existing login token for ${result.id}`);
    // create a token
    reply = uuid4();
  }
  // refresh its expiration date to 12 hours
  redisLogin.set(result.id, reply, 'EX', 12 * 60 * 60);
  const message = `user ${result.id} logs in with token ${reply}`;
  console.log(message);
  setResult(res, 200, { message, token: reply, user: result });
}

/**
 * Refreshes the authentication token.
 *
 * @param userId id of the current user
 * @param token current token
 * @param res response object
 */
async function refresh(userId, token, res) {
  try {
    // reuse previous token if possible
    const reply = await getAsync(userId);
    if (reply === null) {
      const message = `no existing login token for ${userId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (reply !== token) {
      const message = `the provided token ${token} doesn't match with the token for ${userId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    // refresh its expiration date to 12 hours
    redisLogin.set(userId, reply, 'EX', 12 * 60 * 60);
    const message = `token ${token} is refreshed for user ${userId}`;
    console.log(message);
    setResult(res, 200, { message, token: reply });
  } catch (error) {
    setError(res, 500, error);
  }
}

async function loginWithMac(mac, res) {
  const db = (await mongo).db('data');
  const result = await db.collection('user').findOne({ 'authority.mac': mac });
  if (result === null) {
    const message = 'no such MAC address';
    console.error(message);
    setResult(res, 400, { message });
    return;
  }
  loginSucceed(result, res);
}

async function login(body, res) {
  if (body.mac) {
    await loginWithMac(body.mac, res);
    return;
  }
  await loginWithPassword(body.email, body.phone, body.password, res);
}

module.exports = {
  login,
  refresh,
};
