const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userBalanceSchema = mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,  // Positive if 'from' owes 'to'; negative if 'to' owes 'from'.
  },
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true,
  }
}, {
  timestamps: true,
});

// Add plugin that converts mongoose to JSON
userBalanceSchema.plugin(toJSON);
userBalanceSchema.plugin(paginate);

/**
 * @typedef UserBalance
 */
const UserBalance = mongoose.model('UserBalance', userBalanceSchema);

module.exports = UserBalance;
