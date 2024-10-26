const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');

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
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset Your Password on SplitPe';
  const resetPasswordLink = `${config.website.url}/reset-password?token=${token}`;
  let html = await fs.readFile(path.join(__dirname, "../../emailtemplates/reset-password/resetpassword.html"), 'utf-8');
  html = html.replaceAll('${resetPasswordLink}', resetPasswordLink);
  await sendEmail(to, subject, html);
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
  html = html.replaceAll('{friendName}', fromFriend).replaceAll('{userName}', toFriend);
  await sendEmail(to, `You've Been Added to a SplitPe Group by ${fromFriend}!`, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendSocialWelcomeEmail,
  sendFriendReferredEmail
};
