const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createNotification = {
  body: Joi.object().keys({
    user: Joi.string().required().custom(objectId),
    type: Joi.string().required().valid('expense', 'settlement', 'group'),
    message: Joi.string().required(),
    date: Joi.date().required(),
    read: Joi.boolean().default(false),
  }),
};

const getNotifications = {
  query: Joi.object().keys({
    user: Joi.string().custom(objectId),
    type: Joi.string().valid('expense', 'settlement', 'group'),
    read: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

const updateNotification = {
  params: Joi.object().keys({
    notificationId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      user: Joi.string().custom(objectId),
      type: Joi.string().valid('expense', 'settlement', 'group'),
      message: Joi.string(),
      date: Joi.date(),
      read: Joi.boolean(),
    })
    .min(1),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
};
