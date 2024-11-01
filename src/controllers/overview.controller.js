// controllers/overview.controller.js
const httpStatus = require('http-status');
const overviewService = require('../services/overview.service');

/**
 * Controller to handle the overview request for the dashboard.
 * @param {Request} req
 * @param {Response} res
 */
const getOverview = async (req, res) => {
  try {
    const userId = req.user._id;  // Assuming userId is available in the request (e.g., via authentication middleware)
    const overviewData = await overviewService.getOverview(userId);
    res.status(httpStatus.OK).json(overviewData);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  getOverview,
};