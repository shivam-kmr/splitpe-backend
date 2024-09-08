// validations/quote.validation.js
const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { statusTypes } = require('../config/status');

const createTemporaryPost = {
    body: Joi.object().keys({
        categoryId: Joi.string().custom(objectId).required(),
        templateId: Joi.string().custom(objectId).required(),
        mediaUrl: Joi.string().uri().required(),
        mediaType: Joi.string().valid("image", "video").required(),
        placementType: Joi.string().valid("post", "story", "reels").required(),
        caption: Joi.string().required(),
        hashtags: Joi.string().optional(),
        scheduledOn: Joi.date().optional(),
        quoteId: Joi.string().custom(objectId).required(),
        status: Joi.string().valid(statusTypes.NEW, statusTypes.PUBLISHED, statusTypes.DELETED).optional(),
    }),
};

const createBulkTemporaryPost = {
    body: Joi.array().items(
        Joi.object().keys({
            categoryId: Joi.string().custom(objectId).required(),
            templateId: Joi.string().custom(objectId).required(),
            mediaUrl: Joi.string().uri().required(),
            mediaType: Joi.string().valid("image", "video").required(),
            placementType: Joi.string().valid("post", "story", "reels").required(),
            caption: Joi.string().required(),
            hashtags: Joi.string().optional(),
            scheduledOn: Joi.date().optional(),
            quoteId: Joi.string().custom(objectId).required(),
            status: Joi.string().valid(statusTypes.NEW, statusTypes.PUBLISHED, statusTypes.DELETED).optional(),
        })
    ).min(1).required(),
};

const getTemporaryPosts = {
    query: Joi.object().keys({
        status: Joi.string().valid(statusTypes.NEW, statusTypes.PUBLISHED, statusTypes.DELETED),
        categoryId: Joi.string().custom(objectId),
        templateId: Joi.string().custom(objectId),
    }),
};

const getTemporaryPost = {
    params: Joi.object().keys({
        temporaryPostId: Joi.string().custom(objectId),
    }),
};

const updateTemporaryPost = {
    params: Joi.object().keys({
        temporaryPostId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            categoryId: Joi.string().custom(objectId),
            templateId: Joi.string().custom(objectId),
            mediaUrl: Joi.string().uri(),
            mediaType: Joi.string().valid("image", "video"),
            placementType: Joi.string().valid("post", "story", "reels"),
            caption: Joi.string(),
            hashtags: Joi.string(),
            scheduledOn: Joi.date(),
            quoteId: Joi.string().custom(objectId),
            status: Joi.string().valid(statusTypes.NEW, statusTypes.PUBLISHED, statusTypes.DELETED),
        })
        .min(1),
};

const deleteTemporaryPost = {
    params: Joi.object().keys({
        temporaryPostId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createTemporaryPost,
    createBulkTemporaryPost,
    getTemporaryPosts,
    getTemporaryPost,
    updateTemporaryPost,
    deleteTemporaryPost,
};
