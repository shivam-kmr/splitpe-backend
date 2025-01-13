const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const authService = require('../services/auth.service').getInst();
const userService = require('../services/user.service').getInst();
const tokenService = require('../services/token.service').getInst();
const emailService = require('../services/email.service').getInst();

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  const emailObject = {
    userName: user.username || "Splitter",
    subject: 'Welcome to SplitPe!',
  }
  emailService.sendEmailFromTemplate("userregistrationsuccess", req.body.email, emailObject);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  console.log({authService})
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  const context = {
    token: resetPasswordToken,
    action: "PASSWORDRESET",
    email: req.body.email
  }
  // encrypt the context body so that we can send it in the url.
  const encryptedContext = tokenService.encryptData(JSON.stringify(context));
  const resetPasswordLink = `${config.website.url}/verify?token=${encryptedContext}`;
  const emailObject = {
    resetPasswordLink,
    subject: 'Reset Your Password on SplitPe',
  }
  emailService.sendEmailFromTemplate("resetpassword", req.body.email, emailObject);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const context = {
    token: await tokenService.generateVerifyEmailToken(req.user),
    action: "ACCOUNTVERIFICATION",
    email: req.body.email,
    name: req.user.name
  }
  // encrypt the context body so that we can send it in the url.
  const encryptedContext = tokenService.encryptData(JSON.stringify(context));
  const verificationLink = `${config.website.url}/verify?token=${encryptedContext}`;
  const emailObject = {
    verificationLink,
    subject: 'Email Verification on SplitPe',
    userName: req.user.name || "Splitter"
  }
  console.log({user: req.user})
  emailService.sendEmailFromTemplate("signupverification", req.user.email, emailObject);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const loginWithGoogle = catchAsync(async (req, res) => {
  const user = await authService.loginUserWithGoogle(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  loginWithGoogle
};
