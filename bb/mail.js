const { setError } = require('./utility');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtpdm.aliyun.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@mail.button.tech', // generated ethereal user
    pass: 'MmQ4Mzk3ZTI', // generated ethereal password
  },
});

const template = `<table width="800" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="font-family:'Microsoft YaHei';">
    <tbody>
      <tr>
        <td>
          <table width="800" border="0" align="center" cellpadding="0" cellspacing="0" height="40"></table>
        </td>
      </tr>
      <tr>
        <td>
          <table width="800" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#123d86" height="48" style="font-family:'Microsoft YaHei';">
            <tbody>
              <tr>
                <td width="74" height="48" border="0" align="center" valign="middle" style="padding-left:20px;">
                  <a href="#">
                    <img width="80" height="28" src="data:img/jpg;base64,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&#10;  Azct+ya1OxOEAAAAAElFTkSuQmCC">
                  </a>
                </td>
                <td width="703" height="48" colspan="2" align="right" valign="middle" style="color:#ffffff; padding-right:20px;">
                  <a href="https://www.button.tech" target="_blank" style="color:#ffffff;text-decoration:none;font-family:'Microsoft YaHei';">数据平台</a>
                  &nbsp; <span style="color:#6c7479;">|</span>&nbsp;&nbsp;
                  <a href="https://www.cxzghw.com/" target="_blank" style="color:#ffffff;text-decoration:none;font-family:'Microsoft YaHei';">创响中国</a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
  
      <tr>
        <td>
          <table width="800" border="0" align="left" cellpadding="0" cellspacing="0" style="border:1px solid #edecec;border-top:none;font-size:14px;color:#333333;">
            <tbody>
              <tr>
                <td width="760" height="30" border="0" align="left" colspan="2">&nbsp;</td>
              </tr>
              <tr>
                <td width="760" height="30" border="0" align="left" colspan="2">&nbsp;</td>
              </tr>
              <tr>
                <td width="760" height="32" border="0" align="left" valign="middle" style="width:760px; text-align:left; padding-left: 90px; vertical-align:middle;line-height:32px;font-family:'Microsoft YaHei';">$body</td>
              </tr>
              <tr>
                <td width="760" height="30" border="0" align="left" colspan="2">&nbsp;</td>
              </tr>
              <tr>
                <td width="760" height="30" border="0" align="left" colspan="2">&nbsp;</td>
              </tr>
              <tr>
                <td width="760" height="30" border="0" align="left" colspan="2">&nbsp;</td>
              </tr>
              <tr style="background-color: rgba(180,180,180,0.8);">
                <td width="360" height="36" style="font-family:'Microsoft YaHei';padding: 0 20px;">
                  <a style="text-decoration: none; color: #fff;" href="http://www.kouwork.com">www.kouwork.com</a>
                </td>
                <td width="360" height="36" style="color: #fff;text-align: right;font-size:12px;font-family:'Microsoft YaHei';padding: 0 20px;">此为系统邮件请勿回复</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
  
      <tr>
        <td>
          <table align="center" border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="#fff">
            <tbody><tr>
              <td>
                <p style="line-height: 22px; font-family: 'Microsoft YaHei'; font-size: 12px; color: #999; text-align: center;">
                  Copyright © 2018 BUTTON
                </p>
              </td>
            </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>`;

/**
 * Invites user to a group.
 *
 * @param to 要发送的邮箱
 * @param subject 主题
 * @param body 内容主题
 * @param res response
 */
async function sendEmail(to, subject, body, res) {
  try {
    // setup email data with unicode symbols
    const info = await sendEmailBody(to, subject, body);
    const { messageId } = info;
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Message sent: %s', messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', previewUrl);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    if (res) {
      res.send({
        id: messageId,
        url: previewUrl,
      });
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * 发送邮件
 *
 * @param to 要发送的邮箱
 * @param subject 主题
 * @param body 内容主题
 */
async function sendEmailBody(to, subject, body) {
  const html = template.replace('$body', body);
  const mailOptions = {
    from: 'noreply@mail.button.tech', // sender address
    to, // list of receivers
    subject, // Subject line
    html, // plain text body
  };

  // send mail with defined transport object
  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = {
  sendEmailBody,
  sendEmail,
  template,
};
