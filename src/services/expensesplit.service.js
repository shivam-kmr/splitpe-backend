const httpStatus = require('http-status');
const { expense: Expense, expensesplit: ExpenseSplit } = require('../models');
const ApiError = require('../utils/ApiError');
const userBalanceService = require('./userbalance.service');
const BaseService = require('./base.service');

class ExpenseSplitService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Create an expense split
   * @param {Object} expenseSplitBody
   * @returns {Promise<ExpenseSplit>}
   */
  async createExpenseSplit(expenseSplitBody) {
    return ExpenseSplit.create(expenseSplitBody);
  }

  async processSplits(expense, expenseBody, isNew = false) {
    const totalTransactionAmount = expense.amount;

    // Validate transaction amounts
    this.validateTransactionAmounts(expenseBody, totalTransactionAmount);

    const paidMap = this.createMap(expenseBody.payments);
    const ownedMap = this.createMap(expenseBody.splits);

    await this.adjustPreviousSplits(expense.id);

    // Process each split
    for (const userId in ownedMap) {
      const { user, amount: owedAmount } = ownedMap[userId];
      const paidAmount = paidMap[user]?.amount || 0;
      const toGetBackAmount = paidAmount - owedAmount;

      await this.createExpenseSplit({
        expense: expense.id,
        user,
        amount: owedAmount,
        toGetBackAmount,
      });
    }

    // Calculate and update settlements
    const settlements = this.calculateSettlements(paidMap, ownedMap);
    await Promise.all(
      settlements.map((settlement) =>
        userBalanceService.updateUserBalance(settlement.from, settlement.to, settlement.amount, expense.id)
      )
    );

    return settlements;
  }

  /**
   * Validates the total amounts for payments and splits
   * @param {Object} expenseBody
   * @param {number} totalTransactionAmount
   */
  validateTransactionAmounts(expenseBody, totalTransactionAmount) {
    const totalPayedAmount = this.getTotalAmount(expenseBody.payments);
    if (totalTransactionAmount !== totalPayedAmount) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Total paid amount does not match transaction amount');
    }

    const totalSplitAmount = this.getTotalAmount(expenseBody.splits);
    if (totalTransactionAmount !== totalSplitAmount) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Total split amount does not match transaction amount');
    }
  }

  calculateSettlements(paidMap, ownedMap) {
    const netBalanceMap = this.calculateNetBalances(paidMap, ownedMap);
    const { creditors, debtors } = this.segregateBalances(netBalanceMap);

    // Minimize transactions
    const transactions = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: settlementAmount,
      });

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    return transactions;
  }

  /**
   * Calculates net balances for each user
   * @param {Object} paidMap
   * @param {Object} ownedMap
   * @returns {Object} netBalanceMap
   */
  calculateNetBalances(paidMap, ownedMap) {
    const netBalanceMap = {};

    for (const userId in paidMap) {
      netBalanceMap[userId] = (netBalanceMap[userId] || 0) + paidMap[userId].amount;
    }

    for (const userId in ownedMap) {
      netBalanceMap[userId] = (netBalanceMap[userId] || 0) - ownedMap[userId].amount;
    }

    return netBalanceMap;
  }

  /**
   * Segregates net balances into creditors and debtors
   * @param {Object} netBalanceMap
   * @returns {Object} { creditors, debtors }
   */
  segregateBalances(netBalanceMap) {
    const creditors = [];
    const debtors = [];

    for (const [userId, balance] of Object.entries(netBalanceMap)) {
      if (balance > 0) {
        creditors.push({ userId, amount: balance });
      } else if (balance < 0) {
        debtors.push({ userId, amount: -balance });
      }
    }

    return { creditors, debtors };
  }

  /**
   * Calculates the total amount from an array of objects
   * @param {Array} array
   * @returns {number} total
   */
  getTotalAmount(array) {
    if (!Array.isArray(array)) throw new Error('Invalid input: Expected an array');
    return array.reduce((total, item) => total + item.amount, 0);
  }

  /**
   * Creates a map of user IDs to their total amounts
   * @param {Array} payments
   * @returns {Object} paidMap
   */
  createMap(payments) {
    const map = {};
    payments.forEach(({ user, amount }) => {
      if (!map[user]) {
        map[user] = { user, amount: 0 };
      }
      map[user].amount += amount;
    });
    return map;
  }

  /**
   * Query for expense splits
   * @param {Object} filter - Mongo filter
   * @param {Object} options - Query options
   * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  async queryExpenseSplits(filter, options) {
    return ExpenseSplit.paginate(filter, options);
  }

  /**
   * Get expense split by id
   * @param {ObjectId} id
   * @returns {Promise<ExpenseSplit>}
   */
  async getExpenseSplitById(id) {
    return ExpenseSplit.findById(id);
  }

  /**
   * Update expense split by id
   * @param {ObjectId} expenseSplitId
   * @param {Object} updateBody
   * @returns {Promise<ExpenseSplit>}
   */
  async updateExpenseSplitById(expenseSplitId, updateBody) {
    const expenseSplit = await this.getExpenseSplitById(expenseSplitId);
    if (!expenseSplit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Expense split not found');
    }
    Object.assign(expenseSplit, updateBody);
    await expenseSplit.save();
    return expenseSplit;
  }

  /**
   * Delete expense split by id
   * @param {ObjectId} expenseSplitId
   * @returns {Promise<ExpenseSplit>}
   */
  async deleteExpenseSplitById(expenseSplitId) {
    const expenseSplit = await this.getExpenseSplitById(expenseSplitId);
    if (!expenseSplit) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Expense split not found');
    }
    await expenseSplit.remove();
    return expenseSplit;
  }

  /**
   * Delete all expense splits by expense ID
   * @param {ObjectId} expenseId
   * @returns {Promise<void>}
   */
  async adjustPreviousSplits(expenseId) {
    await ExpenseSplit.deleteMany({ expense: expenseId });
    await userBalanceService.removeBalanceForExpense(expenseId);
  }
}

module.exports = new ExpenseSplitService();
