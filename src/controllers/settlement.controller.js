const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { settlementService } = require('../services');

const createSettlement = catchAsync(async (req, res) => {
  const settlement = await settlementService.createSettlement(req.body);
  res.status(httpStatus.CREATED).send(settlement);
});

const getSettlements = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['fromUser', 'toUser', 'date']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await settlementService.querySettlements(filter, options);
  res.send(result);
});

const getSettlement = catchAsync(async (req, res) => {
  const settlement = await settlementService.getSettlementById(req.params.settlementId);
  if (!settlement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Settlement not found');
  }
  res.send(settlement);
});

const updateSettlement = catchAsync(async (req, res) => {
  const settlement = await settlementService.updateSettlementById(req.params.settlementId, req.body);
  res.send(settlement);
});

const deleteSettlement = catchAsync(async (req, res) => {
  await settlementService.deleteSettlementById(req.params.settlementId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSettlement,
  getSettlements,
  getSettlement,
  updateSettlement,
  deleteSettlement,
};
