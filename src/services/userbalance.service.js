const Expense = require('../models/expense.model');
const UserBalance = require('../models/userbalance.model');

/**
 * Helper function to update balance between two users.
 * If `fromUser` owes `toUser`, `amount` is positive.
 * If `toUser` owes `fromUser`, `amount` is negative.
 */
const updateUserBalance = async (fromUser, toUser, amount) => {
    // Find existing balance or create a new one
    let userBalance = await UserBalance.findOne({ from: fromUser, to: toUser });

    if (userBalance) {
        // Update existing balance
        userBalance.balance += amount;
        if (userBalance.balance === 0) {
            await userBalance.delete();  // Delete record if balance is settled
        } else {
            await userBalance.save();
        }
    } else {
        // If no existing balance, create a new one
        userBalance = new UserBalance({
            from: fromUser,
            to: toUser,
            balance: amount,
        });
        await userBalance.save();
    }

    return userBalance;
};

/**
 * Records a payment and adjusts UserBalance accordingly.
 * Example: User B pays User A a certain amount to reduce debt.
 */
const settlePayment = async (fromUser, toUser, paymentAmount) => {
    // Find the balance between the two users
    let userBalance = await UserBalance.findOne({ from: fromUser, to: toUser });

    if (!userBalance) {
        throw new Error('No debt exists between these users');
    }

    // Adjust balance by payment amount
    userBalance.balance -= paymentAmount;

    if (userBalance.balance === 0) {
        await userBalance.delete();  // Remove balance if settled
    } else if (userBalance.balance < 0) {
        // Reverse `from` and `to` if `toUser` now owes `fromUser`
        const newBalance = -userBalance.balance;
        await userBalance.delete(); // Delete old balance
        userBalance = await updateUserBalance(toUser, fromUser, newBalance);
    } else {
        await userBalance.save();
    }

    return userBalance;
};

/**
 * Retrieves all balances related to a user, including debts owed by and to the user.
 */
const getBalancesForUser = async (userId) => {
    // Get who the user owes
    const owes = await UserBalance.find({ from: userId }).populate('to', 'name');

    // Get who owes the user
    const owedBy = await UserBalance.find({ to: userId }).populate('from', 'name');

    return {
        owes,
        owedBy,
    };
};


module.exports = {
    updateUserBalance,
    settlePayment,
    getBalancesForUser
};
