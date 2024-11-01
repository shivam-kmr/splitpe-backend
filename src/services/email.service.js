const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');
const { emailVariable } = require('../config/emailVariable');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch((err) => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env', err));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  const msg = { from: `${config.email.fromName} <${config.email.from}`, to, subject, html };
  await transport.sendMail(msg);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `${config.website.url}/verify-email?token=${token}`;
  let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/signup/signupverification.html"), 'utf-8');
  html = html.replaceAll('${userName}', to.split("@")[0]).replaceAll('${verificationLink}', verificationEmailUrl);
  await sendEmail(to, subject, html);
};

/**
 * Send social welcome email
 * @param {string} to
 * @returns {Promise}
 */
const sendSocialWelcomeEmail = async (to) => {
  let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/signup/signupsocialwelcome.html"), 'utf-8');
  html = html.replaceAll('${userName}', to.split("@")[0]);
  await sendEmail(to, 'Welcome to SplitPe Family', html);
};

/**
 * Send email to friend who got reffered
 * @param {string} to
 * @returns {Promise}
 */
const sendFriendReferredEmail = async (fromFriend, toFriend, to) => {
  let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/signup/friendrefered.html"), 'utf-8');
  html = html.replaceAll('${friendName}', fromFriend).replaceAll('${userName}', toFriend);
  await sendEmail(to, `You've Been Added to a SplitPe Group by ${fromFriend}!`, html);
};

const sendNewExpenseEntryEmail = async (toEmail, userName, groupName, transactionList) => {
  let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/expense/expenseentry.html"), 'utf-8');
  // Replace groupName placeholder

  html = html.replaceAll("${groupName}", groupName);
  html = html.replaceAll("${userName}", userName);

  // Generate transaction list HTML
  const transactionItems = transactionList.map(transaction => `
      <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666666; font-size: 16px;">
              ${transaction.description}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666666; font-size: 16px;">
              ₹${transaction.amount}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666666; font-size: 16px;">
              ${transaction.oweStatus}
          </td>
      </tr>
  `).join('');

  // Insert the transaction list into the HTML
  html = html.replaceAll("${transactionList}", transactionItems);
  await sendEmail(toEmail, `New Expense Entry in ${groupName}`, html);
};

const bulkReplacer = async (templateName, dataObject) => {
  let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/"+templateName+".html"), 'utf-8');
  let fieldsToEdit = emailVariable[templateName].fieldsToEdit;
  for(var i=0;i<fieldsToEdit.length;i++){
    if(!dataObject[fieldsToEdit[i]]) return {error: "Field not found in dataObject"};
    html = html.replaceAll("${"+fieldsToEdit[i]+"}", dataObject[fieldsToEdit[i]]);
  }
  return html;
}

const sendEmailFromTemplate = async (templateName, toEmail, dataObject) => {
  let html = await bulkReplacer(templateName, dataObject);
  return await sendEmail(toEmail, dataObject.subject, html);
}

module.exports = {
  transport,
  sendEmail,
  sendVerificationEmail,
  sendSocialWelcomeEmail,
  sendFriendReferredEmail,
  sendNewExpenseEntryEmail,
  sendEmailFromTemplate
};
