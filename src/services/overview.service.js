// services/overview.service.js
const UserBalance = require('../models/userbalance.model');
const Expense = require('../models/expense.model');
const Group = require('../models/group.model');

/**
 * Retrieves an overview of the user's financial standing, including
 * total amount owed and owed to them, along with recent group activity.
 * @param {ObjectId} userId - The ID of the logged-in user
 */
const getOverview = async (userId) => {
  // Fetch balances in parallel to improve performance
  const [owesData, owedByData, recentGroups] = await Promise.all([
    UserBalance.find({ from: userId }),
    UserBalance.find({ to: userId }),
    Expense.aggregate([
      { $match: { 'splits.user': userId } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      { $group: { _id: '$group' } }
    ])
  ]);

  const totalOwes = owesData.reduce((sum, balance) => sum + balance.balance, 0);
  const totalOwedBy = owedByData.reduce((sum, balance) => sum + balance.balance, 0);

  // Fetch group details with single call
  const groupIds = recentGroups.map((item) => item._id);
  const recentGroupDetails = await Group.find({ _id: { $in: groupIds } }, 'name description');

  // Get settlements for each recent group in parallel
  const recentGroupDetailsWithSettlement = await Promise.all(
    recentGroupDetails.map(async (grp) => ({
      ...grp.toObject(),
      settlement: await calculateGroupSettlement(grp._id)
    }))
  );

  return { totalOwes, totalOwedBy, recentGroups: recentGroupDetailsWithSettlement };
};

/**
 * Calculate the simplified debts for a group based on proposed settlements.
 * @param {ObjectId} groupId - The ID of the group
 * @returns {Object} - Aggregated data of who owes whom, with simplified debts
 */
const calculateGroupSettlement = async (groupId) => {
  const settlements = await Expense.aggregate([
    { $match: { group: groupId } },
    { $unwind: '$proposedSettlement' },
    {
      $group: {
        _id: { from: '$proposedSettlement.from', to: '$proposedSettlement.to' },
        totalAmount: { $sum: '$proposedSettlement.amount' }
      }
    }
  ]);

  // Consolidate settlements into a single debt map without repetitive transactions
  const debtMap = settlements.reduce((acc, { _id: { from, to }, totalAmount }) => {
    acc[from] = acc[from] || {};
    acc[to] = acc[to] || {};
    acc[from][to] = (acc[from][to] || 0) + totalAmount;
    return acc;
  }, {});

  return simplifyDebts(debtMap);
};

/**
 * Simplifies debts by consolidating payments in the debt map.
 * @param {Object} debtMap - A nested object where debtMap[from][to] is the amount `from` owes `to`.
 * @returns {Array} - Array of simplified debts in the form [{ from, to, amount }]
 */
const simplifyDebts = (debtMap) => {
  const netBalance = Object.entries(debtMap).reduce((acc, [from, toObj]) => {
    for (const [to, amount] of Object.entries(toObj)) {
      acc[from] = (acc[from] || 0) - amount;
      acc[to] = (acc[to] || 0) + amount;
    }
    return acc;
  }, {});

  const usersOwe = [];
  const usersOwed = [];

  for (const [user, balance] of Object.entries(netBalance)) {
    if (balance < 0) usersOwe.push({ user, amount: -balance });
    else if (balance > 0) usersOwed.push({ user, amount: balance });
  }

  const simplifiedDebts = [];
  let i = 0, j = 0;

  while (i < usersOwe.length && j < usersOwed.length) {
    const oweUser = usersOwe[i];
    const owedUser = usersOwed[j];
    const amount = Math.min(oweUser.amount, owedUser.amount);

    simplifiedDebts.push({ from: oweUser.user, to: owedUser.user, amount });

    oweUser.amount -= amount;
    owedUser.amount -= amount;
    if (oweUser.amount === 0) i++;
    if (owedUser.amount === 0) j++;
  }

  return simplifiedDebts;
};

module.exports = { getOverview, calculateGroupSettlement };
