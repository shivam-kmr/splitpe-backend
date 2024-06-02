const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const friendSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    friend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
friendSchema.plugin(toJSON);
friendSchema.plugin(paginate);

/**
 * @typedef Friend
 */
const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend;
