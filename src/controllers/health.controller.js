const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const getHealth = catchAsync(async (req, res) => {
  const serverDate = new Date()
  res.send({serverDate, message: 'Server is up and running!'});
});


module.exports = {
    getHealth,
};
