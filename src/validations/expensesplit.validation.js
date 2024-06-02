const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createExpenseSplit = {
  body: Joi.object().keys({
    expense: Joi.string().required().custom(objectId),
    user: Joi.string().required().custom(objectId),
    amount: Joi.number().required(),
  }),
};

const getExpenseSplits = {
  query: Joi.object().keys({
    expense: Joi.string().custom(objectId),
    user: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getExpenseSplit = {
  params: Joi.object().keys({
    expenseSplitId: Joi.string().custom(objectId),
  }),
};

const updateExpenseSplit = {
  params: Joi.object().keys({
    expenseSplitId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      expense: Joi.string().custom(objectId),
      user: Joi.string().custom(objectId),
      amount: Joi.number(),
    })
    .min(1),
};

const deleteExpenseSplit = {
  params: Joi.object().keys({
    expenseSplitId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createExpenseSplit,
  getExpenseSplits,
  getExpenseSplit,
  updateExpenseSplit,
  deleteExpenseSplit,
};
