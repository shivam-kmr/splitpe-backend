const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addFriend = {
  body: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
    friendId: Joi.string().required().custom(objectId),
  }),
};

const addFriendByEmail = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required(),
  }),
};

const getFriends = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getFriendJson = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getFriend = {
  params: Joi.object().keys({
    friendId: Joi.string().custom(objectId),
  }),
};

const updateFriend = {
  params: Joi.object().keys({
    friendId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      user: Joi.string().custom(objectId),
      friend: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteFriend = {
  params: Joi.object().keys({
    friendId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  addFriend,
  addFriendByEmail,
  getFriends,
  getFriend,
  updateFriend,
  deleteFriend,
  getFriendJson
};
