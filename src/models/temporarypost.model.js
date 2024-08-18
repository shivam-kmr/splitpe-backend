const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { statusTypes } = require('../config/status');

const temporarypostSchema = mongoose.Schema(
    {
        categoryId: {
            type: String,
            required: true,
        },
        templateId: {
            type: String,
            required: true,
        },
        mediaUrl: {
            type: String,
            required: true,
        },
        mediaType: {
            type: String,
            enum: ["image", "video"],
            required: true,
            default: "image"
        },
        placementType: {
            type: String,
            enum: ["post", "story", "reels"],
            required: true,
            default: "post"
        },
        caption: {
            type: String,
            required: true,
        },
        hashtags: {
            type: String,
        },
        uploadId:{
            type: String,
        },
        scheduledOn: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: [statusTypes.NEW, statusTypes.PUBLISHED, statusTypes.DELETED],
            required: true,
            default: statusTypes.NEW
        },
    },
    {
        timestamps: true,
    }
);
temporarypostSchema.plugin(toJSON);
temporarypostSchema.plugin(paginate);

const TemporaryPosts = mongoose.model('TemporaryPosts', temporarypostSchema);

module.exports = {
    TemporaryPosts,
};
