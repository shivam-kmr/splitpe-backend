const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const expenseSplitSchema = mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
expenseSplitSchema.plugin(toJSON);
expenseSplitSchema.plugin(paginate);

/**
 * @typedef ExpenseSplit
 */
const ExpenseSplit = mongoose.model('ExpenseSplit', expenseSplitSchema);

module.exports = ExpenseSplit;
