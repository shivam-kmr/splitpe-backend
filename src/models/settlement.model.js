const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const settlementSchema = mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
settlementSchema.plugin(toJSON);
settlementSchema.plugin(paginate);

/**
 * @typedef Settlement
 */
const Settlement = mongoose.model('Settlement', settlementSchema);

module.exports = Settlement;
