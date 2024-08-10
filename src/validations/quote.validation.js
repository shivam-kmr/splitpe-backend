// validations/quote.validation.js
const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createQuote = {
    body: Joi.object().keys({
        category_id: Joi.string().custom(objectId).required(),
        title: Joi.string().required(),
        caption: Joi.string().optional(),
        quote_by: Joi.string().optional(),
    }),
};

const getQuotes = {
    query: Joi.object().keys({
        title: Joi.string(),
        quote_by: Joi.string(),
    }),
};

const getQuote = {
    params: Joi.object().keys({
        quoteId: Joi.string().custom(objectId),
    }),
};

const updateQuote = {
    params: Joi.object().keys({
        quoteId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            category_id: Joi.string().custom(objectId),
            title: Joi.string(),
            caption: Joi.string(),
            quote_by: Joi.string(),
        })
        .min(1),
};

const deleteQuote = {
    params: Joi.object().keys({
        quoteId: Joi.string().custom(objectId),
    }),
};

const uploadQuote = {
    file: Joi.object({
        originalname: Joi.string().required().pattern(/\.csv$/),
        path: Joi.string().required(),
    }),
};


module.exports = {
    createQuote,
    getQuotes,
    getQuote,
    updateQuote,
    deleteQuote,
    uploadQuote
};
