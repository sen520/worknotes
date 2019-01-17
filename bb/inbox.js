const Imap = require('imap');
const { simpleParser } = require('mailparser');
const moment = require('moment');
const uuid4 = require('uuid/v4');
const { mongo } = require('./server');
const { validateEmail, deepCopy } = require('./utility');
const { sendEmail } = require('./mail');
const { upload } = require('./aliupload');
const constant = require('button-constant');
const { newPermission } = require('./permission');

const ALLOWED_ATTACHMENT_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/x-iwork-pages-sffpages',
  'application/x-iwork-keynote-sffkey',
]);

/**
 * main functions.
 */
module.exports = function fetch() {
  const imap = new Imap({
    user: 'bp@button.tech',
    password: 'MmQ4Mzk3ZTI',
    host: 'imap.exmail.qq.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });
  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err) => {
      console.log('open');
      if (err) {
        console.error(err);
        return;
      }
      try {
        checkUnreadEmail(imap);
      } catch (e) {
        console.error('fail to check unread email', e);
      }
    });
  });
  imap.once('error', (err) => {
    console.error(err);
  });

  imap.once('end', () => {
    console.log('Connection ended');
  });
  try {
    imap.connect();
  } catch (e) {
    console.error('fails to connect to imap server', e);
  }
};

/**
 * Scans for unread email.
 */
function checkUnreadEmail(imap) {
  imap.search(['UNSEEN'], (err, results) => {
    if (err) {
      console.error(err);
      return;
    }
    if (results.length < 1) {
      console.info('no unread emails');
      return;
    }
    const f = imap.fetch(results, { bodies: '', markSeen: true });

    f.on('message', (msg, seqno) => {
      msg.on('body', (stream) => {
        console.log(`${seqno}Processed`);
        simpleParser(stream, processEmail);
      });
      msg.once('end', () => {
        console.log(`${seqno}Finished`);
        imap.setFlags([seqno], ['\\Seen']);
      });
    });
    f.once('error', (err2) => {
      console.log(`Fetch error: ${err2}`);
    });
    f.once('end', () => {
      console.log('Done fetching all messages!');
      imap.end();
    });
  });
}

/**
 * Processes the mail.
 *
 * @param mail
 */
async function processEmail(error, mail) {
  if (error) {
    console.error(`fail to parse email ${error}`);
    return;
  }
  // Process the mail
  if (mail.attachments.length < 0) {
    console.info(`${mail.subject} doesn't have any attachment`);
    return;
  }
  try {
    await createProjectFromEmail(mail);
  } catch (reason) {
    const message = `internal server error ${reason}`;
    console.error(message);
    try {
      await replyEmail(mail.from.value[0].address, message, message);
    } finally {
      // Do nothing.
    }
  }
}

function checkAttachmentFormat(attachment) {
  return ALLOWED_ATTACHMENT_MIME.has(attachment.contentType);
}

/**
 * Extracts the subject by removing Re:, Fwd: and so on.
 *
 * Keys: Re: Fwd: Fw: 转：回复：转发：
 * @param {string} text the original text
 */
function extractSubject(text) {
  if (text === null || typeof text === 'string') {
    return text;
  }
  return text.replace(/(Re|Fwd|Fw|转|回复|转发)(:|：) */gi, '');
}

/**
 * Creates a singleton project from the email if there is an attachment.
 *
 * @param mail the mail object from mailparser.
 */
async function createProjectFromEmail(mail) {
  // Check whether the mail has the correct attachment.
  let bp = null;
  for (const a of mail.attachments) {
    if (checkAttachmentFormat(a)) {
      bp = a;
      break;
    }
  }
  if (bp === null) {
    const message = `${mail.subject} does not have valid bp attachment`;
    console.warn(message);
    return;
  }
  if (mail.from === null || mail.from.value === null ||
      mail.from.value.length < 1 || !validateEmail(mail.from.value[0].address)) {
    const message = `${mail.subject} does not have valid email address`;
    console.error(message);
    return;
  }
  const email = mail.from.value[0].address;
  // find the user
  const db = (await mongo).db('data');
  const query = { email };
  const user = await db.collection('user').findOne(query, null);
  if (user === null) {
    const message = 'no such user';
    console.error(message);
    await replyEmail(email, message, message);
    return;
  }
  // upload the attachment
  const url = await upload(bp.filename, bp.contentType, bp.content);
  if (!url) {
    const message = `fails to create attachment for ${bp.filename}`;
    console.error(message);
    await replyEmail(email, message, message);
    return;
  }
  const project = Object.assign(
    deepCopy(constant.PROJECT.TEMPLATE),
    {
      id: uuid4(),
      name: extractSubject(mail.subject),
      logo: 'https://buttondata.oss-cn-shanghai.aliyuncs.com/company.png',
      bp: url,
      time: moment().unix(),
      creatorId: user.id,
      stage: constant.PROJECT.STAGE.unknown,
      _deleted: false,
      _updated: new Date(),
      _created: new Date(),
    });
  const projectInsert = await db.collection('project').insertOne(project);
  if (projectInsert.insertedCount < 1) {
    const message = `fails to create project ${project.name}`;
    console.error(message);
    return;
  }
  // Create permission
  const permission = newPermission(user.id, projectInsert.insertedId, 'project', 'write');
  const permissionInsert = await db.collection('permission').insertOne(permission);
  if (permissionInsert.insertedCount < 1) {
    const message = `fails to create permission for ${project.name}`;
    console.error(message);
  } else {
    const message = `permission created for ${permissionInsert.insertedId}`;
    console.log(message);
  }
  const message = `project ${project.name} created with attachment ${url}`;
  console.log(message);
  await replyEmail(
    email,
    `项目${project.name}创建成功`,
    `请访问https://www.button.tech/product/fda-project/${project.id}来查看和完善项目`);
}

async function replyEmail(to, subject, body) {
  await sendEmail(to, subject, body, { send: () => {} });
}
