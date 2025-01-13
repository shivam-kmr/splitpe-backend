const httpStatus = require('http-status');
const { settlement: Settlement } = require('../models');
const ApiError = require('../utils/ApiError');
const BaseService = require('./base.service');


class SettlementService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Create a settlement
   * @param {Object} settlementBody
   * @returns {Promise<Settlement>}
   */
  async createSettlement(settlementBody) {
    return Settlement.create(settlementBody);
  }

  /**
   * Query for settlements
   * @param {Object} filter - Mongo filter
   * @param {Object} options - Query options
   * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  async querySettlements(filter, options) {
    const settlements = await Settlement.paginate(filter, options);
    return settlements;
  }

  /**
   * Get settlement by id
   * @param {ObjectId} id
   * @returns {Promise<Settlement>}
   */
  async getSettlementById(id) {
    return Settlement.findById(id);
  }

  /**
   * Update settlement by id
   * @param {ObjectId} settlementId
   * @param {Object} updateBody
   * @returns {Promise<Settlement>}
   */
  async updateSettlementById(settlementId, updateBody) {
    const settlement = await this.getSettlementById(settlementId);
    if (!settlement) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Settlement not found');
    }
    Object.assign(settlement, updateBody);
    await settlement.save();
    return settlement;
  }

  /**
   * Delete settlement by id
   * @param {ObjectId} settlementId
   * @returns {Promise<Settlement>}
   */
  async deleteSettlementById(settlementId) {
    const settlement = await this.getSettlementById(settlementId);
    if (!settlement) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Settlement not found');
    }
    await settlement.remove();
    return settlement;
  }
}

module.exports = {
  getInst: function () {
    return new SettlementService();
  },
}