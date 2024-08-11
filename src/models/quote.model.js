const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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
quoteSchema.plugin(toJSON);
quoteSchema.plugin(paginate);

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = {
  Quote,
};
