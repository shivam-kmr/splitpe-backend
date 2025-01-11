const httpStatus = require('http-status');
const { category: Category, categoryimages: CategoryImages } = require('../models');
const ApiError = require('../utils/ApiError');
const BaseService = require('./base.service');

class CategoryService extends BaseService {

  /**
   * Create a category
   * @param {Object} categoryBody
   * @returns {Promise<Category>}
   */
  async createCategory(categoryBody) {
    return Category.create(categoryBody);
  }

  /**
   * Query for categories
   * @param {Object} filter - Mongo filter
   * @param {Object} options - Query options
   * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  async queryCategory(filter, options) {
    const categories = await Category.paginate(filter, options);
    return categories;
  }

  /**
   * Get category by id
   * @param {ObjectId} id
   * @returns {Promise<Category>}
   */
  async getCategoryById(id) {
    return Category.findById(id);
  }

  /**
   * Get category by email
   * @param {string} email
   * @returns {Promise<Category>}
   */
  async getCategoryByEmail(email) {
    console.log({ Category });
    return Category.findOne({ email });
  }

  /**
   * Update category by id
   * @param {ObjectId} categoryId
   * @param {Object} updateBody
   * @returns {Promise<Category>}
   */
  async updateCategoryById(categoryId, updateBody) {
    const category = await this.getCategoryById(categoryId);
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    Object.assign(category, updateBody);
    await category.save();
    return category;
  }

  /**
   * Delete category by id
   * @param {ObjectId} categoryId
   * @returns {Promise<Category>}
   */
  async deleteCategoryById(categoryId) {
    const category = await this.getCategoryById(categoryId);
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    await category.remove();
    return category;
  }

  /**
   * Create category images
   * @param {Object} categoryBody
   * @returns {Promise<CategoryImages>}
   */
  async createCategoryImages(categoryBody) {
    return CategoryImages.create(categoryBody);
  }

  /**
   * Get category images
   * @param {Object} filter
   * @param {Object} options
   * @returns {Promise<QueryResult>}
   */
  async getCategoryImages(filter, options) {
    const categoryImages = await CategoryImages.paginate(filter, options);
    return categoryImages;
  }
}

module.exports = {
  getInst: function () {
    return new CategoryService();
  },
};
