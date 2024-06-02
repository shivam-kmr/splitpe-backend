const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { expenseSplitService } = require('../services');

const createExpenseSplit = catchAsync(async (req, res) => {
  const expenseSplit = await expenseSplitService.createExpenseSplit(req.body);
  res.status(httpStatus.CREATED).send(expenseSplit);
});

const getExpenseSplits = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['expense', 'user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await expenseSplitService.queryExpenseSplits(filter, options);
  res.send(result);
});

const getExpenseSplit = catchAsync(async (req, res) => {
  const expenseSplit = await expenseSplitService.getExpenseSplitById(req.params.expenseSplitId);
  if (!expenseSplit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense split not found');
  }
  res.send(expenseSplit);
});

const updateExpenseSplit = catchAsync(async (req, res) => {
  const expenseSplit = await expenseSplitService.updateExpenseSplitById(req.params.expenseSplitId, req.body);
  res.send(expenseSplit);
});

const deleteExpenseSplit = catchAsync(async (req, res) => {
  await expenseSplitService.deleteExpenseSplitById(req.params.expenseSplitId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createExpenseSplit,
  getExpenseSplits,
  getExpenseSplit,
  updateExpenseSplit,
  deleteExpenseSplit,
};
