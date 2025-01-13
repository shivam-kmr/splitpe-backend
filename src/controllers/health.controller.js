const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const emailService = require('../services/email.service').getInst();

const getHealth = catchAsync(async (req, res) => {
  const serverDate = new Date()
  res.send({serverDate, message: 'Server is up and running!'});
});

const checkEmailTemplate = catchAsync(async (req, res) => {
  let body = req.body;
  //const emailResponse = await emailService.sendFriendReferredEmail(body.fromFriend, body.toFriend, body.to);
  //const emailResponse = await emailService.sendResetPasswordEmail(body.to, "token");
  const emailResponse = await emailService.sendNewExpenseEntryEmail(body.to,body.userName, body.groupName, body.transactionList);
  res.send(emailResponse);
});


module.exports = {
    getHealth,
    checkEmailTemplate,
};
