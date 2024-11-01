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
  // Fetch user balances to calculate totals
  const owesData = await UserBalance.find({ from: userId });
  const owedByData = await UserBalance.find({ to: userId });
  console.log(userId);

  // Calculate totals
  const totalOwes = owesData.reduce((sum, balance) => sum + balance.balance, 0);
  const totalOwedBy = owedByData.reduce((sum, balance) => sum + balance.balance, 0);

  // Get the latest groups where transactions occurred
  const recentGroups = await Expense.aggregate([
    { $match: { 'splits.user': userId } },
    { $sort: { createdAt: -1 } },
    { $limit: 5 }, // limit to the latest 5 transactions
    { $group: { _id: '$group' } }, // Get unique group IDs
  ]);
   
  // Fetch group information using a separate query
  const groupIds = recentGroups.map((item) => item._id);
  const recentGroupDetails = await Group.find({ _id: { $in: groupIds } }, 'name description');
  
  // Use Promise.all to await all settlement calculations
  const recentGroupDetailsWithSettlement = await Promise.all(
    recentGroupDetails.map(async (grp) => {
      const settlement = await calculateGroupSettlement(grp._id);
      return { ...grp.toObject(), settlement };
    })
  );


  return {
    totalOwes,
    totalOwedBy,
    recentGroups: recentGroupDetailsWithSettlement,
  };
};


/**
 * Calculate the simplified debts for a group based on the proposed settlements
 * from all expenses in the specified group.
 * @param {ObjectId} groupId - The ID of the group
 * @returns {Object} - Aggregated data of who owes whom, with simplified debts
 */
const calculateGroupSettlement = async (groupId) => {
    // Step 1: Aggregate all proposed settlements for the specified group
    const settlements = await Expense.aggregate([
      { $match: { group: groupId } },
      { $unwind: '$proposedSettlement' },
      {
        $group: {
          _id: {
            from: '$proposedSettlement.from',
            to: '$proposedSettlement.to',
          },
          totalAmount: { $sum: '$proposedSettlement.amount' },
        },
      },
    ]);
  
    // Step 2: Transform aggregated results into a debt map for simplification
    const debtMap = {};
  
    settlements.forEach(({ _id: { from, to }, totalAmount }) => {
      if (!debtMap[from]) debtMap[from] = {};
      if (!debtMap[to]) debtMap[to] = {};
      debtMap[from][to] = (debtMap[from][to] || 0) + totalAmount;
      debtMap[to][from] = (debtMap[to][from] || 0) - totalAmount;
    });
  
    // Step 3: Simplify the debts within the group
    const simplifiedDebts = simplifyDebts(debtMap);
  
    return simplifiedDebts;
  };
  
  /**
   * Helper function to simplify debts by consolidating payments in the debt map
   * @param {Object} debtMap - A nested object where debtMap[from][to] is the amount `from` owes `to`
   * @returns {Array} - Array of simplified debts in the form [{ from, to, amount }]
   */
  const simplifyDebts = (debtMap) => {
    const simplifiedDebts = [];
  
    // Step 1: Create a net balance for each user
    const netBalance = {};
    for (const from in debtMap) {
      for (const to in debtMap[from]) {
        netBalance[from] = (netBalance[from] || 0) + debtMap[from][to];
        netBalance[to] = (netBalance[to] || 0) - debtMap[from][to];
      }
    }
  
    // Step 2: Minimize the transactions
    const usersOwe = Object.keys(netBalance).filter((user) => netBalance[user] < 0);
    const usersOwed = Object.keys(netBalance).filter((user) => netBalance[user] > 0);
  
    // Settle debts by matching users who owe and users who are owed
    let i = 0;
    let j = 0;
    while (i < usersOwe.length && j < usersOwed.length) {
      const oweUser = usersOwe[i];
      const owedUser = usersOwed[j];
      const amount = Math.min(-netBalance[oweUser], netBalance[owedUser]);
  
      // Record the simplified debt
      if (amount > 0) {
        simplifiedDebts.push({
          from: oweUser,
          to: owedUser,
          amount,
        });
      }
  
      // Update net balances and move pointers
      netBalance[oweUser] += amount;
      netBalance[owedUser] -= amount;
      if (netBalance[oweUser] === 0) i++;
      if (netBalance[owedUser] === 0) j++;
    }
  
    return simplifiedDebts;
  };

module.exports = {
  getOverview,
  calculateGroupSettlement
};
