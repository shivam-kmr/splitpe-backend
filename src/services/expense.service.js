const httpStatus = require('http-status');
const { expense: Expense } = require('../models');
const ApiError = require('../utils/ApiError');
const expenseSplitService = require('./expensesplit.service');
const BaseService = require('./base.service');

class ExpenseService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Create an expense
   * @param {Object} expenseBody
   * @returns {Promise<Expense>}
   */
  async createExpense(expenseBody) {
    let expense = await Expense.create(expenseBody);
    let splits = await expenseSplitService.processSplits(expense, expenseBody);
    await this.updateExpenseById(expense.id, { proposedSettlement: splits }, true);
    return { expense };
  }

  /**
   * Query for expenses
   * @param {Object} filter - Mongo filter
   * @param {Object} options - Query options
   * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  async queryExpenses(filter, options) {
    options.populate = [
      {
        path: 'proposedSettlement.from',
        select: 'name',  // Retrieve the 'name' field from the 'from' user in 'proposedSettlement'
      },
      {
        path: 'proposedSettlement.to',
        select: 'name',  // Retrieve the 'name' field from the 'to' user in 'proposedSettlement'
      },
      {
        path: 'splits.user',
        select: 'name',  // Retrieve the 'name' field from the 'user' in 'splits'
      },
      {
        path: 'payments.user',
        select: 'name',  // Retrieve the 'name' field from the 'user' in 'payments'
      }
    ];  // Populate userId and friendId
    options.lean = true;  // Return plain JavaScript objects
    const expenses = await Expense.paginate(filter, options);
    return expenses;
  }

  /**
   * Get expense by id
   * @param {ObjectId} id
   * @returns {Promise<Expense>}
   */
  async getExpenseById(id) {
    return Expense.findById(id);
  }

  /**
   * Update expense by id
   * @param {ObjectId} expenseId
   * @param {Object} updateBody
   * @returns {Promise<Expense>}
   */
  async updateExpenseById(expenseId, updateBody, isNew = false) {
    const expense = await this.getExpenseById(expenseId);
    if (!expense) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Expense not found');
    }

    // Check if critical fields have changed
    const fieldsRequiringReprocessing = ['amount', 'splits', 'payments'];
    const reprocessRequired = fieldsRequiringReprocessing.some((field) => updateBody[field] !== undefined);

    Object.assign(expense, updateBody);

    if (reprocessRequired) {
      // Recalculate splits and settlements
      const splits = await expenseSplitService.processSplits(expense, updateBody, isNew);
      expense.proposedSettlement = splits;
    }

    await expense.save();
    return expense;
  }

  /**
   * Delete expense by id
   * @param {ObjectId} expenseId
   * @returns {Promise<Expense>}
   */
  async deleteExpenseById(expenseId) {
    const expense = await this.getExpenseById(expenseId);
    if (!expense) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Expense not found');
    }
    await expense.remove();
    return expense;
  }
}

module.exports = new ExpenseService();
