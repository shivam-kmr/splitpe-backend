const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { socialmediauploaderService } = require('../services');

const postToInstagram = catchAsync(async (req, res) => {
    let data = await socialmediauploaderService.postToInstagram(req.body)
    res.status(httpStatus.CREATED).json(data);
});

module.exports = {
    postToInstagram,
};

