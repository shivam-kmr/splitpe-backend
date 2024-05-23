const Joi = require('joi');

const createFriend = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    // Add more validations as needed
  }),
};

const updateFriend = {
  params: Joi.object().keys({
    friendId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    phoneNumber: Joi.string(),
    // Add more validations as needed
  }),
};

module.exports = {
  createFriend,
  updateFriend,
};
