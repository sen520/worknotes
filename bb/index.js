const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin');
const bodyParser = require('body-parser');

const app = express();
const { sendEmail } = require('./mail');
const { getPolicy, getFile, deleteFile } = require('./aliupload');
const { register, verification } = require('./register');
const { login, refresh } = require('./login');
const translate = require('./youdao');
const {
  loginWithLinkedIn, linkLinkedIn, linkEmail, verifyEmail, loginWithWechat,
  loginWithWechatCallback, linkWechat, linkWechatCallback,
} = require('./oauth');
const { getProjectInfo, getPatentInfo } = require('./spider');
const { resetPassword, requestPassword } = require('./password');
const { invite, accept } = require('./group');
const exportProjectList = require('./exportList');
const setLog = require('./logManagement');
const notify = require('./notify');
const patent = require('./patent');
const { print } = require('./print');
const onepageppt = require('./onepage');
const {
  queryPermission, queryMultiplePermission, createPermission,
  requestPermission, grantPermission, authSignPermission,
} = require('./permission');
const config = require('./config.json');
const getProject = require('./project');
const { merge } = require('./merger');
const {
  deleteProjectInfo, deleteTaskInfo, emptyTrash, deleteSendEmail,
  recoverProject,
} = require('./deleteAndRecovery');

// Uses Linkedin Login
passport.use(new LinkedInStrategy(
  {
    consumerKey: config.linkedIn.id,
    consumerSecret: config.linkedIn.secret,
    callbackURL: '/login/linkedin',
    profileFields: [
      'id',
      'first-name',
      'last-name',
      'email-address',
      'formatted-name',
      'headline',
      'location',
      'industry',
      'summary',
      'specialties',
      'positions',
      'phone-numbers',
      'public-profile-url',
      'picture-url'],
  },
  (token, tokenSecret, profile, done) => done(null, profile)));

const corsOption = {
  origin: true, // simple add origin to cors
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};
app.use(cors(corsOption));
app.use(session({ secret: '8153bc98-bee2-4504-aae4-2a6d656cd61b' }));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(passport.initialize());
app.use(passport.session());
// app.use(authSignPermission);

app.options('*', cors());

// Get policy to upload ali cloud.
app.get('/policy', (req, res) => {
  getPolicy(res);
});

// Default page.
app.get('/', (req, res) => {
  res.send('You are not supposed to see this page');
});

// send an email via post.
app.post('/mail', (req, res) => {
  const { to, subject, body } = req.body;
  sendEmail(to, subject, body, res);
});

app.post('/translate', (req, res) => {
  const { text, from, to } = req.body;
  console.log('translate the %o', req.body);
  translate(text, res, from, to);
});

app.post('/verification', (req, res) => {
  const { email, phone, message } = req.body;
  verification(res, email, phone, message);
});

app.post('/register', (req, res) => {
  const {
    email, phone, name, password, type, groupId, keyword, verificationCode,
    legal, refer,
  } = req.body;
  console.log('request %o', req.body);
  register(
    name, password, email, phone, verificationCode, res, type, groupId,
    keyword, legal, refer);
});

app.post('/login', (req, res) => {
  const loginInfo = req.body;
  console.log('login %o', req.body);
  login(loginInfo, res);
});

app.get('/login/linkedin', (req, res, next) => {
  console.log('login with linkedIn %o', req.query);
  loginWithLinkedIn(passport, req, res, next);
});

app.get('/link/linkedin', (req, res, next) => {
  console.log('link linkedIn %o', req.query);
  linkLinkedIn(passport, req, res, next);
});

app.get('/login/wechat', (req, res) => {
  console.log('login with wechat %o', req.query);
  const { callback } = req.query;
  loginWithWechat(callback, req, res);
});

app.get('/login/wechat/callback', (req, res) => {
  console.log('login with wechat callback %o', req.query);
  const { code, state } = req.query;
  loginWithWechatCallback(code, state, res);
});

app.get('/link/wechat', (req, res) => {
  console.log('link wechat %o', req.query);
  const { callback, userId } = req.query;
  linkWechat(callback, userId, req, res);
});

app.get('/link/wechat/callback', (req, res) => {
  console.log('link wechat callback %o', req.query);
  const { code, state } = req.query;
  const { userId, callback } = JSON.parse(decodeURIComponent(state));
  linkWechatCallback(code, userId, callback, res);
});

app.post('/link/email', (req, res) => {
  const { email, token, callback } = req.body;
  console.log('link email %o', req.body);
  linkEmail(email, token, callback, req, res);
});

app.get('/verify/email', (req, res) => {
  const { token, callback } = req.query;
  console.log('verify email %o', req.params);
  verifyEmail(token, callback, res);
});

app.post('/merger', (req, res) => {
  const { userId, fromId, toId } = req.body;
  console.log('merge %o', req.body);
  merge(userId, fromId, toId, res);
});

app.post('/project/import/angellist', (req, res) => {
  const { userId, projectUrl } = req.body;
  console.log('get info %o', req.body);
  getProjectInfo(userId, projectUrl, req, res);
});

app.post('/project/import/gsxt', (req, res) => {
  const { userId, projectUrl } = req.body;
  console.log('get info %o', req.body);
  getProjectInfo(userId, projectUrl, req, res);
});

app.post('/patent/import/google', (req, res) => {
  const { userId, name, type, targetId } = req.body;
  console.log('request %o', req.body);
  getPatentInfo(userId, name, type, targetId, res, req);
});

app.post('/refresh', (req, res) => {
  const { userId, token } = req.body;
  console.log('refresh token %o', req.body);
  refresh(userId, token, res);
});

app.post('/log', (req, res) => {
  const { level, message, userId, url, extra = {} } = req.body;
  console.log('log', req.body);
  setLog(level, message, userId, url, extra, res);
});

app.post('/password/retrieve', (req, res) => {
  const { email, phone, jump } = req.body;
  console.log('retrieve password %o', req.body);
  requestPassword(email, phone, jump, res);
});

app.get('/password/reset/:token', (req, res) => {
  const { token } = req.params;
  console.log('reset password %o', req.params);
  resetPassword(token, res);
});

app.post('/group/invite', (req, res) => {
  const { userId, groupId, memberId, message, type } = req.body;
  console.log('invite user to group %o', req.body);
  invite(res, req, userId, groupId, memberId, type, message);
});

app.post('/delete/project', (req, res) => {
  const { userId, projectId } = req.body;
  console.log('remove project %o', req.body);
  deleteProjectInfo(userId, projectId, res);
});

app.post('/delete/task', (req, res) => {
  const { userId, taskId } = req.body;
  console.log('delete task %o', req.body);
  deleteTaskInfo(userId, taskId, res);
});

app.post('/mail/project/delete', (req, res) => {
  const { userId, projectId } = req.body;
  console.log('delete send email %o', req.body);
  deleteSendEmail(userId, projectId, res);
});

app.post('/delete/recovery', (req, res) => {
  const { userId, projectId } = req.body;
  console.log('delete task %o', req.body);
  recoverProject(userId, projectId, res);
});

app.post('/empty/trash', (req, res) => {
  const { userId } = req.body;
  console.log('empty project %o', req.body);
  emptyTrash(userId, res);
});

app.get('/group/accept/:token', (req, res) => {
  const { token } = req.params;
  console.log('user accept the invitation to group %o', token);
  accept(token, res);
});

app.post('/notify', (req, res) => {
  const { fromId, toId, subject, body } = req.body;
  console.log('invite user to group %o', req.body);
  notify(res, fromId, toId, subject, body);
});

app.post('/patent', (req, res) => {
  const { projectId, term, page } = req.body;
  console.log('query patent %o', req.body);
  patent(projectId, term, res, page);
});

app.post('/print', (req, res) => {
  const { targetId, type, userId, format, embed } = req.body;
  console.log('request to print', req.body);
  print(targetId, type, userId, format, embed, res, req);
});

app.post('/print/project/list', (req, res) => {
  const { type, userId, format, query, group } = req.body;
  console.log('request to print', req.body);
  exportProjectList(type, userId, format, query, group, req, res);
});

app.post('/print/onepage', (req, res) => {
  const { userId, projectId, format } = req.body;
  console.log('onepage to pdf', req.body);
  onepageppt(userId, projectId, format, res, req);
});

app.get('/project/:id', (req, res) => {
  const { id } = req.params;
  console.log('get project for', req.params);
  getProject(id, res);
});

app.get('/permission', (req, res) => {
  const { userId, targetId, type } = req.query;
  console.log('check permission for', req.query);
  queryPermission(userId, targetId, parseInt(type, 10), res);
});

app.post('/permission/multi', (req, res) => {
  const { userId, targetIdArray, type } = req.body;
  console.log('check permission for', req.body);
  queryMultiplePermission(userId, targetIdArray, parseInt(type, 10), res);
});

app.post('/permission', (req, res) => {
  const { userId, targetId, sourceId, type, permission } = req.body;
  console.log('check permission for', req.body);
  createPermission(userId, targetId, sourceId, parseInt(type, 10), parseInt(permission, 10), res);
});

app.post('/permission/request', (req, res) => {
  const { userId, targetId, sourceId, type, permission } = req.body;
  console.log('check permission for', req.body);
  requestPermission(userId, targetId, sourceId, parseInt(type, 10), parseInt(permission, 10), res);
});

app.get('/permission/grant/', (req, res) => {
  const { token, callback } = req.query;
  console.log('check permission for', req.query);
  grantPermission(token, callback, res);
});

/**
 * Checks whether the ip is allowed for access the file.
 *
 * @param ip ip address in xxx.xxx.xxx.xxx format
 * @return {boolean} true if and only the ip belongs to microsoft
 */
const isIpAllowed = (ip) => {
  if (typeof ip !== 'string') {
    console.error('%o is not an valid ip address', ip);
    return false;
  }
  const minIp = 222298113;
  const maxIp = 224395262;
  const ips = ip.split('.').map(i => parseInt(i, 10));
  if (ips.length !== 4) {
    console.error('%o is not an valid ip address', ip);
    return false;
  }
  const result = (((((ips[0] * 256) + ips[1]) * 256) + ips[2]) * 256) + ips[3];
  return result >= minIp && result <= maxIp;
};

app.get('/file/:url', (req, res) => {
  const { url } = req.params;
  console.log('request for file %o', url);
  const origin = req.headers['x-forwarded-for'];
  if (!isIpAllowed(origin)) {
    const message = `Origin doesn't match: ${origin}`;
    console.error(message);
    res.status(403).send(message);
    return;
  }
  getFile(url, res);
});

app.post('/file/delete', (req, res) => {
  const { filename } = req.body;
  console.log('delete %o', req.body);
  deleteFile(filename, res);
});

module.exports = app;
