const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const categoryImagesSchema = mongoose.Schema(
  {
    categoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    font: {
      type: String,
      required: true,
    },
    fontWeight: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
categoryImagesSchema.plugin(toJSON);
categoryImagesSchema.plugin(paginate);


/**
 * @typedef Category
 */
const Category = mongoose.model('CategoryImages', categoryImagesSchema);

module.exports = Category;
