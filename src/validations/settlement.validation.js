const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSettlement = {
  body: Joi.object().keys({
    fromUser: Joi.string().required().custom(objectId),
    toUser: Joi.string().required().custom(objectId),
    amount: Joi.number().required(),
    date: Joi.date().required(),
  }),
};

const getSettlements = {
  query: Joi.object().keys({
    fromUser: Joi.string().custom(objectId),
    toUser: Joi.string().custom(objectId),
    date: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSettlement = {
  params: Joi.object().keys({
    settlementId: Joi.string().custom(objectId),
  }),
};

const updateSettlement = {
  params: Joi.object().keys({
    settlementId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      fromUser: Joi.string().custom(objectId),
      toUser: Joi.string().custom(objectId),
      amount: Joi.number(),
      date: Joi.date(),
    })
    .min(1),
};

const deleteSettlement = {
  params: Joi.object().keys({
    settlementId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSettlement,
  getSettlements,
  getSettlement,
  updateSettlement,
  deleteSettlement,
};
