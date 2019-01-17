const { validateEmail, setResult, setError } = require('./utility');
const { mongo } = require('./server');

/**
 * Notifies an user.
 *
 * @param res response
 * @param fromId id of the user creates the invitation
 * @param toId arrays of id the user to be invited
 * @param subject 0 invite user as an ordinary member, otherwise as a manager
 * @param body additional message to add to the invitation
 */
module.exports = async function notify(res, fromId, toId, subject, body) {
  try {
    // finds the user information first.
    const db = (await mongo).db('data');
    // Look up the users and groups
    const from = await db.collection('user').findOne({ id: fromId });
    const to = await db.collection('user').find({ id: { $in: toId } }).toArray();
    // Check the users and groups
    if (from === null) {
      const message = `fail to find user ${fromId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (to === null || to.length < 1) {
      const message = `fail to find user ${toId}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const targetEmail = to.filter(item => validateEmail(item.email)).map(
      item => item.email);
    // Deliver the message
    const title = `${subject}`;
    const html = body;
    const { sendEmail } = require('./mail');
    targetEmail.forEach(email => sendEmail(email, title, html, res));
    console.log(`send message ${title} to ${targetEmail.length} receipts`);
  } catch (error) {
    setError(res, 500, error);
  }
};
