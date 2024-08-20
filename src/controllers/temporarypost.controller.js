const fs = require('fs');
const csv = require('csv-parser');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { temporarypostService: temporaryPostService } = require('../services');


const createTemporaryPost = catchAsync(async (req, res) => {
    const quote = await temporaryPostService.createTemporaryPost(req.body);
    res.status(httpStatus.CREATED).send(quote);
});

const createBulkTemporaryPost = catchAsync(async (req, res) => {
    const quote = await temporaryPostService.createBulkTemporaryPosts(req.body);
    res.status(httpStatus.CREATED).send(quote);
});


const getTemporaryPost = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['category_id']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await temporaryPostService.queryTemporaryPosts(filter, options);
    res.send(result);
  });
  
const getTemporaryPostById = catchAsync(async (req, res) => {
    const notification = await temporaryPostService.getTemporaryPostById(req.params.quoteId);
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'TemporaryPost not found');
    }
    res.send(notification);
});

const updateTemporaryPost = catchAsync(async (req, res) => {
    const quote = await temporaryPostService.updateTemporaryPostById(req.params.quoteId, req.body);
    res.status(httpStatus.OK).send(quote);
});

const deleteTemporaryPost = catchAsync(async (req, res) => {
    await temporaryPostService.deleteTemporaryPostById(req.params.quoteId);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createTemporaryPost,
    getTemporaryPost,
    getTemporaryPostById,
    updateTemporaryPost,
    deleteTemporaryPost,
    createBulkTemporaryPost,
};
