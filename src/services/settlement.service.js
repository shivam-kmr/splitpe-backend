const httpStatus = require('http-status');
const { settlement: Settlement } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a settlement
 * @param {Object} settlementBody
 * @returns {Promise<Settlement>}
 */
const createSettlement = async (settlementBody) => {
  return Settlement.create(settlementBody);
};

/**
 * Query for settlements
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySettlements = async (filter, options) => {
  const settlements = await Settlement.paginate(filter, options);
  return settlements;
};

/**
 * Get settlement by id
 * @param {ObjectId} id
 * @returns {Promise<Settlement>}
 */
const getSettlementById = async (id) => {
  return Settlement.findById(id);
};

/**
 * Update settlement by id
 * @param {ObjectId} settlementId
 * @param {Object} updateBody
 * @returns {Promise<Settlement>}
 */
const updateSettlementById = async (settlementId, updateBody) => {
  const settlement = await getSettlementById(settlementId);
  if (!settlement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Settlement not found');
  }
  Object.assign(settlement, updateBody);
  await settlement.save();
  return settlement;
};

/**
 * Delete settlement by id
 * @param {ObjectId} settlementId
 * @returns {Promise<Settlement>}
 */
const deleteSettlementById = async (settlementId) => {
  const settlement = await getSettlementById(settlementId);
  if (!settlement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Settlement not found');
  }
  await settlement.remove();
  return settlement;
};

module.exports = {
  createSettlement,
  querySettlements,
  getSettlementById,
  updateSettlementById,
  deleteSettlementById,
};
