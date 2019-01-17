const { setResult, setError } = require('./utility');
const SMSClient = require('@alicloud/sms-sdk');

const smsClient = new SMSClient({
  accessKeyId: 'LTAI0LwFIzDJjkd0',
  secretAccessKey: 'da62ufm3BZphisb1rRikQQl2YwnN20' });

/**
 * Sends a text message to phone.
 *
 * Note, due to the requirement of aliyun sdk, the message should send under a
 * template.
 *
 * @param phone a mobile phone number from China
 * @param templateCode template code
 * @param body message to deliver. note it should be a json string, e.g., '{
 *   "code":"123456"}'
 * @param res the return of response
 */
async function sendSms(phone, templateCode, body, res) {
  try {
    const result = await smsClient.sendSMS({
      PhoneNumbers: phone,
      SignName: '巴特恩跨境研究和数据平台',
      TemplateCode: 'SMS_135792990',
      TemplateParam: body,
    });
    const { Code } = result;
    if (Code === 'OK') {
      // 处理返回参数
      const message = `短信发送${phone}成功`;
      console.log(message);
      setResult(res, 200, { message });
    } else {
      const message = `短信发送${phone}失败`;
      console.error(message);
      setResult(res, 500, { message });
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Sends a short message for phone verification.
 *
 * @param phone phone number to send
 * @param code the verification code which should be a string
 * @param res response to write
 */
async function sendSmsForVerificationCode(phone, code, res) {
  await sendSms(phone, 'SMS_135792990', JSON.stringify({ code }), res);
}

/**
 * Sends a short message for password reset request.
 *
 * @param phone phone number to send
 * @param token the password reset token which should be a string
 * @param res response to write
 */
async function sendSmsForPasswordRetrieve(phone, token, res) {
  await sendSms(phone, 'SMS_135798004', JSON.stringify({ token }), res);
}

/**
 * Sends a short message for new password.
 *
 * @param phone phone number to send
 * @param code the new password which should be a string
 * @param res response to write
 */
async function sendSmsForNotification(phone, code, res) {
  await sendSms(phone, 'SMS_135798004', JSON.stringify({ code }), res);
}

/**
 * Sends a short message for notification.
 *
 * @param phone phone number to send
 * @param message the message which should be a string
 * @param res response to write
 */
async function sendSmsForPasswordReset(phone, message, res) {
  await sendSms(phone, 'SMS_135798004', JSON.stringify({ code: message }), res);
}

module.exports = {
  sendSmsForPasswordReset,
  sendSmsForVerificationCode,
  sendSmsForPasswordRetrieve,
  sendSmsForNotification,
};
