const { Quote } = require('../models/quote.model');


const createQuote = async (quoteData) => {
  return Quote.create(quoteData);
};

/**
 * Query for expenses
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryQuotes = async (filter, options) => {
  const expenses = await Quote.paginate(filter, options);
  return expenses;
};

const getQuoteById = async (quoteId) => {
  return Quote.findById(quoteId).populate('category_id');
};

const updateQuoteById = async (quoteId, updateBody) => {
  const quote = await Quote.findByIdAndUpdate(quoteId, updateBody, { new: true });
  return quote;
};

const deleteQuoteById = async (quoteId) => {
  return Quote.findByIdAndDelete(quoteId);
};

const createQuotes = async (quotes) => {
  return Quote.insertMany(quotes);
};

module.exports = {
  createQuotes,
  createQuote,
  queryQuotes,
  getQuoteById,
  updateQuoteById,
  deleteQuoteById,
};
