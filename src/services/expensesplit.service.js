const httpStatus = require('http-status');
const mod = require('../models');
const { expensesplit: ExpenseSplit } = require('../models');
const ApiError = require('../utils/ApiError');
const { use } = require('passport');

/**
 * Create an expense split
 * @param {Object} expenseSplitBody
 * @returns {Promise<ExpenseSplit>}
 */
const createExpenseSplit = async (expenseSplitBody) => {
  return ExpenseSplit.create(expenseSplitBody);
};


const processSplits = async (expense, expenseBody) => {
  // Here I'll get the expense.
  let totalTransactionAmount = expense.amount;

  let totalPayedAmount = getTotalAmount(expenseBody.payments);
  if(totalTransactionAmount != totalPayedAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Total payed amount does not match transaction amount');
  }

  let totalSplitAmount = getTotalAmount(expenseBody.splits);
  if(totalTransactionAmount != totalSplitAmount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Total split amount does not match transaction amount');
  }

  paidMap = createMap(expenseBody.payments);
  ownedMap = createMap(expenseBody.splits);

  let summaryTextArray = [];

  for(let own in ownedMap) {
    let {user, amount, name} = ownedMap[own];
    let toGetBackAmount = 0;
    if(!paidMap[user]){
      toGetBackAmount = -amount;
      createExpenseSplit({
        expense: expense.id,
        user: user,
        amount: amount,
        toGetBackAmount: toGetBackAmount
      })
      summaryTextArray.push(`${name} owes ${amount} to the group`);
    } else if(paidMap[user].amount > amount) {
      toGetBackAmount = paidMap[user].amount - amount
      createExpenseSplit({
        expense: expense.id,
        user: user,
        amount: amount,
        toGetBackAmount: toGetBackAmount
      })
      summaryTextArray.push(`${name} lent ${toGetBackAmount} to the group`);
    }else if(paidMap[user].amount == amount) {
      toGetBackAmount = 0;
      createExpenseSplit({
        expense: expense.id,
        user: user,
        amount: amount,
        toGetBackAmount: toGetBackAmount
      })
      summaryTextArray.push(`${name} paid for his share`);
    }
    else if(paidMap[user].amount < amount){
      toGetBackAmount = -amount + paidMap[user].amount;
      createExpenseSplit({
        expense: expense.id,
        user: user,
        amount: amount,
        toGetBackAmount: toGetBackAmount
      })
      summaryTextArray.push(`${name} owes ${toGetBackAmount} to the group`);
    } 
    else{
      toGetBackAmount = -amount;
      createExpenseSplit({
        expense: expense.id,
        user: user,
        amount: amount,
        toGetBackAmount: toGetBackAmount
      })
      summaryTextArray.push(`${name} owes ${amount} to the group`);
    }
  }
  let settlements = calculateSettlements(paidMap, ownedMap);
  return settlements;
}

const calculateSettlements = (paidMap, ownedMap) => {
  // Step 1: Calculate net balance for each user
  const netBalanceMap = {};

  // Fill net balance map from paidMap
  for (const userId in paidMap) {
    netBalanceMap[userId] = (netBalanceMap[userId] || 0) + paidMap[userId].amount;
  }

  // Subtract ownedMap amounts to get final net balance
  for (const userId in ownedMap) {
    netBalanceMap[userId] = (netBalanceMap[userId] || 0) - ownedMap[userId].amount;
  }

  // Step 2: Separate creditors and debtors
  const creditors = [];
  const debtors = [];

  for (const [userId, balance] of Object.entries(netBalanceMap)) {
    if (balance > 0) {
      creditors.push({ userId, amount: balance });
    } else if (balance < 0) {
      debtors.push({ userId, amount: -balance });
    }
  }

  // Step 3: Calculate settlements
  const transactions = [];
  let i = 0;
  let j = 0;

  // Match debtors with creditors to minimize transactions
  while (i < debtors.length && j < creditors.length) {
    const debt = debtors[i];
    const credit = creditors[j];

    const settlementAmount = Math.min(debt.amount, credit.amount);

    transactions.push({
      from: debt.userId,
      to: credit.userId,
      amount: settlementAmount,
    });

    // Update the amounts
    debt.amount -= settlementAmount;
    credit.amount -= settlementAmount;

    // Move to next debtor or creditor if settled
    if (debt.amount === 0) i++;
    if (credit.amount === 0) j++;
  }

  return transactions;
};

function getTotalAmount(array) {
  return array.reduce((total, item) => total + item.amount, 0);
}

function createMap(payments) {
  let paidMap = {};
  payments.forEach(payment => {
    if(!paidMap[payment.user]) {
      paidMap[payment.user] = {
        user: payment.user,
        amount: 0,
        name: payment.name
      };
    }
    paidMap[payment.user].amount += payment.amount;
  })
  return paidMap;
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
  processSplits,
  queryExpenseSplits,
  getExpenseSplitById,
  updateExpenseSplitById,
  deleteExpenseSplitById,
};
