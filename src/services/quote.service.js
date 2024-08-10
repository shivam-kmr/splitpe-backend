const { Quote } = require('../models/quote.model');


const createQuote = async (quoteData) => {
    return Quote.create(quoteData);
  };
  
  const getQuotes = async (filter) => {
    return Quote.find(filter).populate('category_id');
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
  getQuotes,
  getQuoteById,
  updateQuoteById,
  deleteQuoteById,
};
