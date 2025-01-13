const UserBalance = require('../models/userbalance.model');
const BaseService = require('./base.service'); // BaseService for common logic

class BalanceService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Helper function to update balance between two users.
   * If `fromUser` owes `toUser`, `amount` is positive.
   * If `toUser` owes `fromUser`, `amount` is negative.
   */
  async updateUserBalance(fromUser, toUser, amount, expenseId) {
    let userBalance = await UserBalance.findOne({ from: fromUser, to: toUser });

    if (userBalance) {
      userBalance.balance += amount;
      if (userBalance.balance === 0) {
        await userBalance.delete();
      } else {
        await userBalance.save();
      }
    } else {
      userBalance = new UserBalance({
        from: fromUser,
        to: toUser,
        expense: expenseId,
        balance: amount,
      });
      await userBalance.save();
    }

    return userBalance;
  }

  /**
   * Records a payment and adjusts UserBalance accordingly.
   * Example: User B pays User A a certain amount to reduce debt.
   */
  async settlePayment(fromUser, toUser, paymentAmount) {
    let userBalance = await UserBalance.findOne({ from: fromUser, to: toUser });

    if (!userBalance) {
      throw new Error('No debt exists between these users');
    }

    userBalance.balance -= paymentAmount;

    if (userBalance.balance === 0) {
      await userBalance.delete();
    } else if (userBalance.balance < 0) {
      const newBalance = -userBalance.balance;
      await userBalance.delete();
      userBalance = await this.updateUserBalance(toUser, fromUser, newBalance);
    } else {
      await userBalance.save();
    }

    return userBalance;
  }

  /**
   * Retrieves all balances related to a user, including debts owed by and to the user.
   */
  async getBalancesForUser(userId) {
    const owes = await UserBalance.find({ from: userId }).populate('to', 'name');
    const owedBy = await UserBalance.find({ to: userId }).populate('from', 'name');

    return {
      owes,
      owedBy,
    };
  }

  /**
   * Removes all balances related to a specific expense.
   * @param {ObjectId} expenseId
   */
  async removeBalanceForExpense(expenseId) {
    await UserBalance.deleteMany({ expense: expenseId });
  }
}

module.exports = {
    getInst: function () {
      return new BalanceService();
    },
}  