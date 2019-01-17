const uuid4 = require('uuid/v4');
const { promisify } = require('util');
const moment = require('moment');
const OAuth = require('wechat-oauth');
const fetch = require('node-fetch');
const constant = require('button-constant');

const { newPermission } = require('./permission');
const { setResult, setError, deepCopy } = require('./utility');
const { sendEmail } = require('./mail');
const config = require('./config.json');
const { mongo, redisLogin } = require('./server');
const { registerUser } = require('./register');

const WechatApi = new OAuth(config.wechat.id, config.wechat.secret);

const getAsync = promisify(redisLogin.get).bind(redisLogin);

/**
 * Links the email with the oath profile.
 *
 * @param email email provided by user
 * @param token token points to the profile
 * @param callback callback for redirect after email is linked. Must be uri
 *   encoded.
 * @param res response object
 */
async function linkEmail(email, token, callback, req, res) {
  try {
    if (!email || !token) {
      const message = 'message and token are unrecognized';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const reply = await getAsync(token);
    if (reply === null) {
      const message = `fail to get user profile for ${token}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const user = JSON.parse(reply);
    user.email = email;
    redisLogin.set(token, JSON.stringify(user));
    const url = `${req.protocol}://${req.get('host')}/verify/email?token=${
      token}&callback=${encodeURIComponent(callback || '')}`;
    // Sends an email with the token.
    const body = `<h1>Dear ${email} Sir/Madam</h1>
<p>Thank you for registering on Button Platform. Please click the following <a href="${url}">link</a> to validate your email.</p>
<p>Thank you!</p>
<h1>尊敬的 ${email} 先生/女士（用户）：</h1>
<p>您好！</p>
<p>您正在注册巴特恩数据平台，请点击该链接<a href="${url}">link</a>来验证你的邮箱。</p>
<p>感谢您注册使用巴特恩数据平台，祝您愉快！</p>`;
    const subject = 'Verify Email from Button Platform';
    sendEmail(email, subject, body, res);
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Verifies link to the email.
 *
 * @param token token to retrieve profile
 * @param callback callback for redirect. Must be uri encoded.
 * @param res response object
 */
async function verifyEmail(token, callback, res) {
  try {
    if (!token) {
      const message = 'token is unrecognized';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const reply = await getAsync(token);
    if (reply === null) {
      const message = `fail to get user profile for ${token}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    redisLogin.del(token);
    const user = JSON.parse(reply);
    // If such user exists, update the authority
    // If user not yet exists, create a new one
    const query = { email: { $regex: new RegExp(`^${user.email}$`, 'i') } };
    const update = {
      $setOnInsert: user,
      $set: {},
    };
    if (user.authority.linkedin.length > 0) {
      update.$set['authority.linkedin'] = user.authority.linkedin;
    } else if (user.authority.wechat.length > 0) {
      update.$set['authority.wechat'] = user.authority.wechat;
    } else if (user.authority.google.length > 0) {
      update.$set['authority.google'] = user.authority.google;
    } else if (user.authority.facebook.length > 0) {
      update.$set['authority.facebook'] = user.authority.facebook;
    }
    delete update.$setOnInsert.authority;
    const db = (await mongo).db('data');
    const result = db.collection('user').updateOne(
      query, update, { upsert: true });
    if (result === null) {
      const message = 'fail to update user';
      console.error(message);
      setResult(res, 500, { message });
      return;
    } else {
      // user already exists
      const message = 'user is linked';
      console.error(message);
      if (callback) {
        res.redirect(decodeURIComponent(callback));
      } else {
        setResult(res, 200, { message });
      }
      // Creates permission accordingly.
      if (result.upsertedCount > 0) {
        const permission = newPermission(
          user.id, result.upsertedId, 'user', 'write');
        db.collection('permission').insertOne(permission);
      }
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Login with LinkedIn account.
 *
 * @param callback callback after the login
 * @param res response object
 */
function loginWithWechat(callback, req, res) {
  const result = WechatApi.getAuthorizeURLForWebsite(
    encodeURI(`https://${req.get('host')}/login/wechat/callback`),
    encodeURIComponent(callback) || 'test',
    'snsapi_login');
  res.redirect(result);
}

/**
 * Fetches user profile after login wechat.
 *
 * @param code code returned from wechat login
 * @return {Promise<string>} query a string appended to the callback
 */
/* eslint-disable compat/compat, camelcase, no-shadow,no-underscore-dangle */
async function fetchWechatInformation(code, res) {
  try {
    const response = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${
        config.wechat.id}&secret=${config.wechat.secret}&code=${
        code}&grant_type=authorization_code`);
    const result = await response.json();
    const { access_token, openid, unionid } = result;
    if (!access_token || !openid || !unionid) {
      // access token is not available, e.g., out of quota
      const message = 'fails to retrieve access token';
      console.error(message);
      return;
    }
    const db = (await mongo.db('data'));
    const user = await db.collection('user').findOne(
      { 'authority.wechat': unionid },
      { projection: { email: 1, password: 1 } });
    if (user === null) {
      // no such user, look for the user profile
      const result = await fetch(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${
          access_token}&openid=${openid}`);
      const profile = await result.json();
      if (profile.errcode || profile.errmsg) {
        // cannot retrieve user profile
        const message = `fails to retrieve user information ${profile.errcode}: ${profile.errmsg}`;
        console.error(message);
        return;
      }
      const userId = uuid4();
      const address = {
        address1: '',
        address2: '',
        city: profile.city,
        state: profile.province,
        country: profile.country,
        zip: '',
      };
      const newUser = Object.assign(
        deepCopy(constant.USER.TEMPLATE),
        {
          id: userId,
          name: profile.nickname,
          legal: profile.nickname,
          logo: profile.headimgurl,
          creationTime: moment().unix(),
          keyword: [],
          password: userId,
          address,
          authority: {
            wechat: profile.unionid,
            linkedin: '',
            google: '',
            facebook: '',
          },
        });
      redisLogin.set(userId, JSON.stringify(newUser));
      registerUser(user, undefined, db, { send: () => {} });
      console.log('user to create as %o', newUser);
      const query = encodeURIComponent(JSON.stringify({
        token: userId,
      }));
      return query;
    } else {
      // user is found, login
      console.log('user %o already exists', user);
      const query = encodeURIComponent(JSON.stringify({
        email: user.email,
        token: user.password,
      }));
      return query;
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Callback for login with wechat.
 *
 * @param code code returned from wechat
 * @param callback state passed via wechat
 * @param res response object
 */
async function loginWithWechatCallback(code, callback, res) {
  const query = await fetchWechatInformation(code, res);
  if (!query) {
    const message = 'login with wechat error';
    setResult(res, 500, { message });
    return;
  }
  res.redirect(`${decodeURIComponent(callback)}/${query}`);
}

/**
 * Links user account to wechat account.
 *
 * @param state { callback, userId }
 *   callback after wechat login
 *   userId id of the user to link to wechat account
 * @param res response object
 */
function linkWechat(callback, userId, req, res) {
  const result = WechatApi.getAuthorizeURLForWebsite(
    encodeURI(`https://${req.get('host')}/link/wechat/callback`),
    encodeURIComponent(JSON.stringify({ callback, userId })) || 'test',
    'snsapi_login');
  res.redirect(result);
}

async function linkWechatCallback(code, userId, callback, res) {
  try {
    const response = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${
        config.wechat.id}&secret=${config.wechat.secret}&code=${
        code}&grant_type=authorization_code`);
    const result = await response.json();
    const { unionid } = result;
    const db = (await mongo).db('data');
    try {
      await db.collection('user').updateOne(
        { id: userId },
        { $set: { 'authority.wechat': unionid } });
      // user already exists
      const message = `link user ${
        userId} to linkedin user ${unionid}`;
      console.info(message);
      res.redirect(`${callback}/1`);
    } catch (error) {
      const message = `fail to link user ${
        userId} to linkedin user ${unionid}`;
      console.error(message);
      res.redirect(`${callback}/0`);
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

async function loginWithLinkedInCallback(profile, req, res) {
  try {
    // Deals with the login.
    // Fetches the user information in profile. For the list of fields in
    // profile, please refer to https://developer.linkedin.com/docs/fields/basic-profile
    const db = (await mongo).db('data');
    const query = { 'authority.linkedin': profile._json.id };
    const result = await db.collection('user').findOne(query);
    if (result === null) {
      const message = 'fail to find user';
      console.warn(message);
      // create a new user as the user is not yet found in the server
      const keyword = [profile._json.industry];
      const userId = uuid4();
      const address = {
        address1: '',
        address2: '',
        city: profile._json.location.name,
        state: '',
        country: profile._json.location.country,
        zip: '',
      };
      const user = Object.assign(
        deepCopy(constant.USER.TEMPLATE),
        {
          id: userId,
          name: profile._json.formattedName,
          abstract: profile._json.headline,
          detail: profile._json.summary,
          legal: `${profile._json.firstName} ${profile._json.lastName}`,
          logo: profile._json.pictureUrl,
          creationTime: moment().unix(),
          keyword,
          email: profile._json.emailAddress,
          password: userId,
          website: profile._json.publicProfileUrl,
          address,
          title: profile._json.positions.length > 0
            ? profile._json.positions[0].title
            : '',
          company: profile._json.positions.length > 0
            ? profile._json.positions[0].company
            : '',
          authority: {
            wechat: '',
            linkedin: profile._json.id,
            google: '',
            facebook: '',
          },
        });
      // ask the user to link an email
      redisLogin.set(userId, JSON.stringify(user));
      console.log('user to create as %o', user);
      registerUser(user, undefined, db, { send: () => {} });
      const query = encodeURIComponent(JSON.stringify({
        token: userId,
      }));
      res.redirect(`${req.session.callback}/${query}`);
    } else {
      // user already exists
      console.log('user %o already exists', result);
      const query = encodeURIComponent(JSON.stringify({
        email: result.email,
        token: result.password,
      }));
      res.redirect(`${req.session.callback}/${query}`);
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Login with LinkedIn account.
 *
 * @param passport passport library
 * @param req request object
 * @param res response object
 * @param next next step
 */
function loginWithLinkedIn(passport, req, res, next) {
  // Saves the callback in the session for a redirect after success login.
  if (req.query.callback) {
    req.session.callback = decodeURIComponent(req.query.callback);
  }
  passport.authenticate(
    'linkedin',
    { callbackURL: '/login/linkedin' },
    (err, profile) => {
      if (err) {
        console.log(err.message);
        setResult(res, 400, { message: err.message });
        return;
      }
      loginWithLinkedInCallback(profile, req, res);
    })(req, res, next);
}

async function linkLinkedInCallback(profile, userId, callback, res) {
  try {
    if (!userId || !callback) {
      const message = 'internal server error: no user id or callback is found';
      setResult(res, 500, { message });
      return;
    }
    const db = (await mongo).db('data');
    try {
      db.collection('user').updateOne(
        { id: userId },
        { $set: { 'authority.linkedin': profile.id } });
      // user already exists
      const message = `link user ${
        userId} to linkedin user ${profile.id}`;
      console.info(message);
      res.redirect(`${callback}/1`);
    } catch (error) {
      const message = `fail to link user ${
        userId} to linkedin user ${profile.id}`;
      console.warn(message);
      res.redirect(`${callback}/0`);
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Links user account to LinkedIn account.
 *
 * @param passport passport library
 * @param req request object
 * @param res response object
 * @param next next step
 */
function linkLinkedIn(passport, req, res, next) {
  // Saves the callback in the session for a redirect after success login.
  if (req.query.callback) {
    req.session.callback = decodeURIComponent(req.query.callback);
  }
  if (req.query.userId) {
    req.session.userId = decodeURIComponent(req.query.userId);
  }
  passport.authenticate(
    'linkedin',
    { callbackURL: '/link/linkedin' },
    (err, profile) => {
      if (err) {
        console.log(err.message);
        setResult(res, 400, { message: err.message });
        return;
      }
      const { userId, callback } = req.session;
      linkLinkedInCallback(profile, userId, callback, res);
    })(req, res, next);
}

module.exports = {
  loginWithLinkedIn,
  linkLinkedIn,
  linkEmail,
  verifyEmail,
  loginWithWechat,
  loginWithWechatCallback,
  linkWechat,
  linkWechatCallback,
};
