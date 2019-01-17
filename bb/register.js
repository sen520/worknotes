const {
  validateEmail, validatePhone, getRandomInt, setResult, setError, deepCopy,
} = require('./utility');
const { redisRegister, mongo } = require('./server');
const { sendSmsForVerificationCode } = require('./message');
const { newPermission } = require('./permission');
const moment = require('moment');
const uuid4 = require('uuid/v4');
const { promisify } = require('util');
const constant = require('button-constant');

const VERIFICATION_CODE_EXPIRES_SECONDS = 600;
const getAsync = promisify(redisRegister.get).bind(redisRegister);

/**
 * Sends verification code for a given email and phone.
 *
 * @param res the result to return
 * @param email email address
 * @param phone phone address. Ignored when email is valid
 * @param body the extra message to send besides the verification code
 */
async function sendVerificationCode(
// eslint-disable-next-line no-unused-vars
  res, email = undefined, phone = undefined, body = undefined) {
  try {
    const emailValidated = validateEmail(email) ? email : undefined;
    const phoneValidated = validatePhone(phone) ? phone : undefined;
    if (emailValidated === undefined && phoneValidated === undefined) {
      const message = `Neither ${email} nor ${phone} is valid`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    // Generate a 6-digit verification code.
    const code = getRandomInt(100000, 999999).toString().substring(0, 6);
    // verify the email and phone is unique
    const db = (await mongo).db('data');
    if (emailValidated) {
      const value = await db.collection('user').count(
        { email: { $regex: new RegExp(`^${emailValidated}$`, 'i') } });
      if (value > 0) {
        const message = `${emailValidated}已经存在。`;
        console.error(message);
        setResult(res, 400, { message });
        return;
      }
      // send the verification code
      const { sendEmail } = require('./mail');
      const mailBody = `<h2>Dear ${emailValidated} Sir/Madam</h2>
<p>Thank you for registering on Button Platform. Please use this verification code ${code} to complete your registration.</p>
<p>Thank you!</p>
<br/>
<h1>尊敬的 ${emailValidated} 先生/女士（用户）：</h1>
<p>您好！</p>
<p>您正在注册巴特恩数据平台，请输入验证码： ${code}，以完成操作。</p>
<p>感谢您注册使用巴特恩数据平台，祝您愉快！</p>`;
      sendEmail(
        emailValidated,
        'Verification Code from Button Platform',
        mailBody);
      // Set the key and expires in 10 minutes.
      redisRegister.set(
        emailValidated, code, 'EX', VERIFICATION_CODE_EXPIRES_SECONDS);
      const message = `验证码已经发送到${emailValidated}`;
      console.log(message);
      setResult(res, 201, { message });
    } else {
      const value = await db.collection('user').count({ phone: phoneValidated });
      if (value > 0) {
        const message = `${phoneValidated}已经存在`;
        console.error(message);
        setResult(res, 400, { message });
        return;
      }
      // send the verification code
      sendSmsForVerificationCode(phone, code, res);
      // Set the key and expires in 10 minutes.
      redisRegister.set(phoneValidated, code);
      const message = `验证码已经发送到${phoneValidated}`;
      console.log(message);
      setResult(res, 201, { message });
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Validates the validation code.
 *
 * @param emailValidated {string} the email with the validation code
 * @param phoneValidated {string} the phone with the validation code
 * @param verificationCode {string} the verification code
 * @return {Promise} the validation result
 */
async function validateCode(
  emailValidated, phoneValidated, verificationCode) {
  try {
    const emailVerified = await getAsync(emailValidated);
    if (emailVerified === verificationCode) {
      return true;
    }
    const phoneVerified = await getAsync(phoneValidated);
    return phoneVerified === verificationCode;
  } catch (e) {
    return false;
  }
}

/**
 * Registers an user.
 *
 * @param name {string} user name, prefer a real name
 * @param password {string} password after hash
 * @param email {string} email address of the user and must be unique if provided
 * @param phone {string} phone number of the user and must be unique if provided
 * @param verificationCode {string} verification code
 * @param type {int} type of the user
 * @param groupId {string} if not empty, it shall be the id of the group the new
 *   user will be added
 * @param keyword {[string]} list of keywords for the new user
 * @param legal {string} the real name of the user
 * @param refer {string} if not empty, it shall be the id of the user which refers
 *   the new user to the platform
 * @param res the result
 */
async function register(
  name, password, email, phone, verificationCode, res, type = undefined,
  groupId = undefined, keyword = undefined, legal = undefined,
  refer = undefined) {
  try {
    const emailValidated = validateEmail(email) ? email : undefined;
    const phoneValidated = validatePhone(phone) ? phone : undefined;
    if (emailValidated === undefined && phoneValidated === undefined) {
      setResult(res, 400, { message: 'a valid email or phone shall present' });
      return;
    }
    if (typeof name !== 'string' || name.length < 2) {
      setResult(res, 400, { message: 'name is not valid' });
      return;
    }
    if (typeof password !== 'string' || password.length < 2) {
      setResult(res, 400, { message: 'password is not valid' });
      return;
    }
    const validation = await validateCode(
      emailValidated, phoneValidated, verificationCode);
    if (!validation) {
      setResult(res, 400, { message: 'verification code is not valid' });
      return;
    }
    const db = (await mongo).db('data');
    const query = {};
    if (emailValidated !== undefined) {
      query.email = emailValidated;
    }
    if (phoneValidated !== undefined) {
      query.phone = phoneValidated;
    }
    // Check whether the account already exists.
    const value = await db.collection('user').count(query);
    if (value > 0) {
      setResult(res, 400, { message: 'user already exists' });
      return;
    }

    const user = Object.assign(
      deepCopy(constant.USER.TEMPLATE),
      {
        name,
        legal: legal || name,
        refer: refer || '',
        email: emailValidated !== undefined ? emailValidated : '',
        phone: phoneValidated !== undefined ? phoneValidated : '',
        password,
        type: type === undefined ? 0 : type,
        id: uuid4(),
        creationTime: moment().unix(),
        keyword: keyword || [],
      });
    // verify the refer exists.
    if (!refer) {
      registerUser(user, groupId, db, res);
    } else {
      const referCount = await db.collection('user').count({ id: refer });
      if (referCount <= 0) {
        // Referral is invalid
        user.refer = '';
      } else {
        user.refer = refer;
      }
      registerUser(user, groupId, db, res);
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Registers the user.
 *
 * @param user {{}} the user to register
 * @param groupId {string} if not empty, it shall be the id of the group where the
 *   new user will be added to
 * @param {MongoClient} db the database handler
 * @param res the response object
 */
async function registerUser(user, groupId, db, res) {
  try {
    // Creates the account.
    const result = await db.collection('user').insertOne(user);
    if (result.insertedCount < 1) {
      const message = `fails to create user ${user}`;
      setResult(res, 500, { message });
      console.log(message);
      return;
    }
    // Creates permission accordingly.
    const permission = newPermission(
      user.id, result.insertedId, 'user', 'write');
    db.collection('permission').insertOne(permission);
    if (groupId !== undefined) {
      // Add user to the group.
      const value = await db.collection('user').count(
        { id: groupId, type: { $bitsAnySet: 2147483648 } });
      if (value <= 0) {
        setResult(res, 201, {
          message: `user register succeeds but fail to add to group ${groupId} as it is not a valid group`,
          id: user.id,
        });
        return;
      }
      db.collection('group').updateOne({ id: groupId }, { memberId: { $push: user.id } });
      setResult(res, 201, {
        message: `user register succeeds and add to group ${groupId}`,
        id: user.id,
      });
    } else {
      setResult(res, 201, {
        message: 'user register succeeds',
        id: user.id,
      });
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

module.exports = {
  verification: sendVerificationCode,
  register,
  registerUser,
};
