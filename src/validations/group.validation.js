const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createGroup = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    members: Joi.array().items(Joi.string().custom(objectId)).required(),
  }),
};

const getGroups = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getGroup = {
  params: Joi.object().keys({
    groupId: Joi.string().custom(objectId),
  }),
};

const updateGroup = {
  params: Joi.object().keys({
    groupId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      members: Joi.array().items(Joi.string().custom(objectId)),
    })
    .min(1),
};

const deleteGroup = {
  params: Joi.object().keys({
    groupId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
};
