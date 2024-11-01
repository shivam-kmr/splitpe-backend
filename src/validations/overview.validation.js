// validations/overview.validation.js
const Joi = require('joi');

const getOverview = {
  headers: Joi.object().keys({
    authorization: Joi.string().required(),  // Ensure the user is authenticated
  }).unknown(),
};

module.exports = {
  getOverview,
};