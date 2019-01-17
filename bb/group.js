/* eslint-disable no-underscore-dangle */
const { promisify } = require('util');
const constant = require('button-constant');
const { validateEmail, setResult, setError } = require('./utility');
const { mongo, redisGroup } = require('./server');
const { newPermission } = require('./permission');

const getAsync = promisify(redisGroup.get).bind(redisGroup);
const { template } = require('./mail');

/**
 * Invites user to a group.
 *
 * @param res response
 * @param req request, where host is required
 * @param userId id of the user creates the invitation
 * @param groupId id of the group
 * @param memberId id the user to be invited
 * @param type 0 invite user as an ordinary member, otherwise as a manager
 * @param welcomeMessage additional message to add to the invitation
 */
async function invite(
  res, req, userId, groupId, memberId, type, welcomeMessage) {
  try {
    const db = (await mongo).db('data');
    // check current user has the permission to invite the user.
    const result = await db.collection('group').findOne(
      { id: groupId }, { projection: ['_id'] });
    if (!result) {
      const message = `Fail to find the group ${groupId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const permission = db.collection('permission').findOne({
      userId,
      targetId: result._id,
      permission: constant.PERMISSION.PERMISSION_TYPE.write,
    });
    if (!permission) {
      const message = `No permission to update group ${groupId}`;
      console.error(message);
      setResult(res, 401, { message });
      return;
    }
    // Look up the users and groups
    const managerPromise = db.collection('user').findOne({ id: userId });
    const memberPromise = db.collection('user').findOne({ id: memberId });
    const groupPromise = db.collection('group').findOne(
      { id: groupId, $or: [{ creatorId: userId }, { managerId: userId }] });
    // eslint-disable-next-line compat/compat
    const [manager, member, group] = await Promise.all(
      [managerPromise, memberPromise, groupPromise]);
    // Check the users and groups
    if (manager === null) {
      const message = `fail to find user ${userId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (member === null) {
      const message = `fail to find user ${memberId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (!validateEmail(member.email)) {
      const message = `user ${memberId} doesn't have an email`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (group === null) {
      const message = `fail to find group ${groupId} or you don't have the permission to invite user to this group`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (group.creatorId === memberId
        || group.managerId.find(id => id === memberId)
        || group.memberId.find(id => id === memberId)) {
      const message = `user ${memberId} is already in the group`;
      console.warn(message);
      setResult(res, 203, { message });
      return;
    }
    // Create the operation
    const uuid4 = require('uuid/v4');
    const operationId = uuid4();
    const operation = { memberId, groupId, type };
    // Save the operation to redis to user to approve
    redisGroup.set(operationId, JSON.stringify(operation));
    // Deliver the message
    const subject = `${manager.name} 邀请你加入用户 ${group.name}`;
    const url = `https://${req.get('host')}/group/accept/${operationId}`;
    const body = `<p>${subject}</p>
<p>加入这个用户组后，这个组的管理员将会有权利读取你的基本信息，项目信息和任务信息等等。</p>
<p>${type ? '你将作为这个组的管理员，可以读取组里其他成员的信息。' : ''}</p>
<p>如果同意加入这个用户组，请点击或者访问链接：<a href="${url}">${url}</a></p><br />
<h2>邀请信息</h2><p>${welcomeMessage}</p><br />
<p>${subject}</p>
<p>After joining in this group, the managers of this group will be able to access your profile information, projects and workflows.</p>
<p>${type ? 'You will be one of the managers of the group.' : ''}</p>
<p>If you want to join this group, please click this url: <a href="${url}">${url}</a></p><br />
<h2>Greeting from the group</h2><p>${welcomeMessage}</p>`;
    const { sendEmail } = require('./mail');
    sendEmail(member.email, subject, body, res);
    console.log(`send message ${subject}`);
  } catch (error) {
    setError(res, 500, error);
  }
}

async function accept(token, res) {
  try {
    const reply = await getAsync(token);
    if (reply === null) {
      const message = `unrecognized link ${token}`;
      console.error(message);
      setResult(res, 500, { message });
      return;
    }
    let operation = null;
    try {
      operation = JSON.parse(reply);
    } catch (e) {
      const message = `unrecognized request ${token}`;
      console.error(message);
      setResult(res, 500, { message });
      return;
    }
    if (operation === null) {
      const message = `unrecognized request ${token}`;
      console.error(message);
      setResult(res, 500, { message });
      return;
    }
    // Apply the operation
    const db = (await mongo).db('data');
    // overwrite existing record if there is one
    const value = operation.type === 1
      ? await db.collection('group').updateOne(
        { id: operation.groupId },
        { $push: { managerId: operation.memberId } })
      : await db.collection('group').updateOne(
        { id: operation.groupId },
        { $push: { memberId: operation.memberId } });
    // update the permission
    const result = await db.collection('group').findOne(
      { id: operation.groupId }, { projection: ['_id'] });
    if (!result) {
      const message = `Fail to find the group ${operation.groupId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const permission = newPermission(
      operation.memberId,
      result._id,
      'group',
      operation.type === 1 ? 'write' : 'read');
    delete permission.permission;
    await db.collection('permission').updateMany(
      { userId: operation.memberId, targetId: result._id },
      {
        $max: { permission: operation.type === 1
          ? constant.PERMISSION.PERMISSION_TYPE.write
          : constant.PERMISSION.PERMISSION_TYPE.read },
        $setOnInsert: permission },
      { upsert: true });
    if (value.modifiedCount === 1 || value.upsertedCount === 1) {
      const memberInfo = await db.collection('user').findOne({ id: operation.memberId });
      const groupInfo = await db.collection('group').findOne({ id: operation.groupId });
      // token is applied and can be removed now.
      redisGroup.del(token);
      const body = `
<p>欢迎您加入${groupInfo.name}用户组</p>
<p>${memberInfo.type ? '你将作为这个组的管理员，可以读取组里其他成员的信息。' : '这个组的管理员将会有权利读取你的基本信息，项目信息和任务信息等等。'}</p>
<p>Welcome to join the ${groupInfo.name} users Group</p>
<p>${memberInfo.type ? 'You will be one of the managers of the group.' : 'the managers of this group will be able to access your profile information, projects and workflows.'}</p>`;
      const html = template.replace('$body', body);
      const message = 'add user to the group';
      console.log(message);
      res.send(html);
    } else {
      const message = 'fail to add user to group';
      console.error(message);
      setResult(res, 500, { message });
    }
  } catch (error) {
    setError(res, 500, error);
  }
}

module.exports = {
  invite,
  accept,
};
