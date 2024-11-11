const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createExpense = {
  body: Joi.object().keys({
    description: Joi.string().required(),
    amount: Joi.number().required(),
    group: Joi.string().required().custom(objectId),
    splits: Joi.array().items(Joi.object({
      user: Joi.string().required().custom(objectId),
      amount: Joi.number().required(),
      realValue: Joi.number().required(),
      typeSelected: Joi.number().required(),
    })).required(),
    payments: Joi.array().items(Joi.object({
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
        realValue: Joi.number().required(),
        typeSelected: Joi.number().required(),
      })),
      payments: Joi.array().items(Joi.object({
        user: Joi.string().required().custom(objectId),
        name:Joi.string().required(),
        amount: Joi.number().required(),
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
