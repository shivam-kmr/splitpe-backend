// validations/quote.validation.js
const Joi = require('joi');

const createPublishingPost = {
    body: Joi.object().keys({
        scheduleFrom: Joi.date().required(),
        timeDifference: Joi.number().integer().required(),
    }),
};

module.exports = {
    createPublishingPost
};
