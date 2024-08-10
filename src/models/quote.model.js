const mongoose = require('mongoose');

const quoteSchema = mongoose.Schema(
  {
    category_id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    quote_by: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = {
  Quote,
};
