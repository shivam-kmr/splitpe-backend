const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createExpense = {
  body: Joi.object().keys({
    description: Joi.string().required(),
    amount: Joi.number().required(),
    payer: Joi.string().required().custom(objectId),
    group: Joi.string().required().custom(objectId),
    date: Joi.date().required(),
    splits: Joi.array().items(Joi.object({
      user: Joi.string().required().custom(objectId),
      amount: Joi.number().required(),
    })).required(),
  }),
};

const getExpenses = {
  query: Joi.object().keys({
    description: Joi.string(),
    payer: Joi.string().custom(objectId),
    group: Joi.string().custom(objectId),
    date: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getExpense = {
  params: Joi.object().keys({
    expenseId: Joi.string().custom(objectId),
  }),
};

const updateExpense = {
  params: Joi.object().keys({
    expenseId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      description: Joi.string(),
      amount: Joi.number(),
      payer: Joi.string().custom(objectId),
      group: Joi.string().custom(objectId),
      date: Joi.date(),
      splits: Joi.array().items(Joi.object({
        user: Joi.string().custom(objectId),
        amount: Joi.number(),
      })),
    })
    .min(1),
};

const deleteExpense = {
  params: Joi.object().keys({
    expenseId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};
