const { mongo, redisPassword } = require('./server');
const uuid4 = require('uuid/v4');
const { validateEmail, validatePhone, setResult, setError } = require('./utility');
const { sendEmail } = require('./mail');
const { sendSmsForPasswordRetrieve } = require('./message');
const { promisify } = require('util');

const VERIFICATION_CODE_EXPIRES_ONE_DAY = 24 * 60 * 60;
const getAsync = promisify(redisPassword.get).bind(redisPassword);

/**
 * Requests password reset and sent the link to reset password to email or
 * phone.
 *
 * @param email email of the user
 * @param phone phone of the user. Ignored when email is available
 * @param jump the url to redirect after password reset
 * @param res to return result
 */
async function requestPassword(email, phone, jump, res) {
  try {
    const emailValidated = validateEmail(email) ? email : undefined;
    const phoneValidated = validatePhone(phone) ? phone : undefined;
    if (emailValidated === undefined && phoneValidated === undefined) {
      const message = 'email or password is not valid';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const query = {};
    if (emailValidated !== undefined) {
      query.email = emailValidated;
    } else if (phoneValidated !== undefined) {
      query.phone = phoneValidated;
    }
    const db = (await mongo).db('data');
    const result = await db.collection('user').findOne(query);
    if (result === null) {
      const message = 'no such user';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const token = uuid4();
    const value = JSON.stringify({ jump, id: result.id });
    redisPassword.set(token, value, 'EX', VERIFICATION_CODE_EXPIRES_ONE_DAY);
    const body = `请用下面的链接'重置密码\n
  https://auth.button.tech/password/reset/${token}`;
    if (emailValidated !== undefined) {
      sendEmail(emailValidated, '重置密码', body, res);
    } else if (phoneValidated !== undefined) {
      sendSmsForPasswordRetrieve(phone, token, res);
    } else {
      const message = 'email or password is not valid';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Resets password.
 *
 * @param email
 * @param phone
 * @param res
 */
async function resetPassword(token, res) {
  try {
    if (!token) {
      const message = 'invalid token';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const reply = await getAsync(token);
    if (reply === null) {
      const message = 'fail to find user';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    // remove this token
    redisPassword.del(token);
    const db = (await mongo).db('data');
    const password = token.substring(0, 8);
    const SALT = '4fe41995-b7e8-4bc3-9cda-b9a0f444b460';
    const hash = require('hash.js');
    const obfuscated = hash.sha256().update(password + SALT).digest('hex');
    const input = JSON.parse(reply);
    const result = await db.collection('user').findOneAndUpdate(
      { id: input.id },
      { $set: { password: obfuscated } },
      null);
    if (result.ok !== 1) {
      const message = `no such user ${input.id}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    // Redirect user to the new page.
    res.status(200).redirect(`${input.jump}${password}`);
  } catch (error) {
    setError(res, 500, error);
  }
}

module.exports = {
  resetPassword,
  requestPassword,
};
