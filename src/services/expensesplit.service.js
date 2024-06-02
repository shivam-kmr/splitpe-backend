const httpStatus = require('http-status');
const { expenseSplit: ExpenseSplit } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an expense split
 * @param {Object} expenseSplitBody
 * @returns {Promise<ExpenseSplit>}
 */
const createExpenseSplit = async (expenseSplitBody) => {
  return ExpenseSplit.create(expenseSplitBody);
};

/**
 * Query for expense splits
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryExpenseSplits = async (filter, options) => {
  const expenseSplits = await ExpenseSplit.paginate(filter, options);
  return expenseSplits;
};

/**
 * Get expense split by id
 * @param {ObjectId} id
 * @returns {Promise<ExpenseSplit>}
 */
const getExpenseSplitById = async (id) => {
  return ExpenseSplit.findById(id);
};

/**
 * Update expense split by id
 * @param {ObjectId} expenseSplitId
 * @param {Object} updateBody
 * @returns {Promise<ExpenseSplit>}
 */
const updateExpenseSplitById = async (expenseSplitId, updateBody) => {
  const expenseSplit = await getExpenseSplitById(expenseSplitId);
  if (!expenseSplit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense split not found');
  }
  Object.assign(expenseSplit, updateBody);
  await expenseSplit.save();
  return expenseSplit;
};

/**
 * Delete expense split by id
 * @param {ObjectId} expenseSplitId
 * @returns {Promise<ExpenseSplit>}
 */
const deleteExpenseSplitById = async (expenseSplitId) => {
  const expenseSplit = await getExpenseSplitById(expenseSplitId);
  if (!expenseSplit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense split not found');
  }
  await expenseSplit.remove();
  return expenseSplit;
};

module.exports = {
  createExpenseSplit,
  queryExpenseSplits,
  getExpenseSplitById,
  updateExpenseSplitById,
  deleteExpenseSplitById,
};
