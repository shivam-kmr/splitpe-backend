const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');
const { emailVariable } = require('../config/emailVariable');
const BaseService = require('./base.service');

class EmailService extends BaseService {
  constructor() {
    super();
    this.transport = nodemailer.createTransport(config.email.smtp);
    if (config.env !== 'test') {
      this.transport
        .verify()
        .then(() => logger.info('Connected to email server'))
        .catch((err) => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env', err));
    }
  }

  /**
   * Send an email
   * @param {string} to
   * @param {string} subject
   * @param {string} text
   * @returns {Promise}
   */
  async sendEmail(to, subject, html) {
    const msg = { from: `${config.email.fromName} <${config.email.from}`, to, subject, html };
    await this.transport.sendMail(msg);
  }

  /**
   * Send verification email
   * @param {string} to
   * @param {string} token
   * @returns {Promise}
   */
  async sendVerificationEmail(to, token) {
    const subject = 'Email Verification';
    const verificationEmailUrl = `${config.website.url}/verify-email?token=${token}`;
    let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/signup/signupverification.html"), 'utf-8');
    html = html.replaceAll('${userName}', to.split("@")[0]).replaceAll('${verificationLink}', verificationEmailUrl);
    await this.sendEmail(to, subject, html);
  }

  /**
   * Send social welcome email
   * @param {string} to
   * @returns {Promise}
   */
  async sendSocialWelcomeEmail(to) {
    let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/signup/signupsocialwelcome.html"), 'utf-8');
    html = html.replaceAll('${userName}', to.split("@")[0]);
    await this.sendEmail(to, 'Welcome to SplitPe Family', html);
  }

  /**
   * Send email to friend who got referred
   * @param {string} to
   * @returns {Promise}
   */
  async sendFriendReferredEmail(fromFriend, toFriend, to) {
    let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/signup/friendrefered.html"), 'utf-8');
    html = html.replaceAll('${friendName}', fromFriend).replaceAll('${userName}', toFriend);
    await this.sendEmail(to, `You've Been Added to a SplitPe Group by ${fromFriend}!`, html);
  }

  /**
   * Send new expense entry email
   * @param {string} toEmail
   * @param {string} userName
   * @param {string} groupName
   * @param {Array} transactionList
   * @returns {Promise}
   */
  async sendNewExpenseEntryEmail(toEmail, userName, groupName, transactionList) {
    let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/expense/expenseentry.html"), 'utf-8');
    html = html.replaceAll("${groupName}", groupName);
    html = html.replaceAll("${userName}", userName);

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

    html = html.replaceAll("${transactionList}", transactionItems);
    await this.sendEmail(toEmail, `New Expense Entry in ${groupName}`, html);
  }

  /**
   * Bulk replace placeholders in email template
   * @param {string} templateName
   * @param {Object} dataObject
   * @returns {Promise<string>}
   */
  async bulkReplacer(templateName, dataObject) {
    let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/" + templateName + ".html"), 'utf-8');
    let fieldsToEdit = emailVariable[templateName].fieldsToEdit;
    for (let i = 0; i < fieldsToEdit.length; i++) {
      if (!dataObject[fieldsToEdit[i]]) return { error: "Field not found in dataObject" };
      html = html.replaceAll("${" + fieldsToEdit[i] + "}", dataObject[fieldsToEdit[i]]);
    }
    return html;
  }

  /**
   * Send email from template
   * @param {string} templateName
   * @param {string} toEmail
   * @param {Object} dataObject
   * @returns {Promise}
   */
  async sendEmailFromTemplate(templateName, toEmail, dataObject) {
    let html = await this.bulkReplacer(templateName, dataObject);
    return await this.sendEmail(toEmail, dataObject.subject, html);
  }
}

module.exports = new EmailService();
