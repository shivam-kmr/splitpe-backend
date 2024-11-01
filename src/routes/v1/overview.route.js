// routes/overview.route.js
const express = require('express');
const validate = require('../../middlewares/validate');
const overviewController = require('../../controllers/overview.controller');
const overviewValidation = require('../../validations/overview.validation');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(auth("getOverview"), validate(overviewValidation.getOverview), overviewController.getOverview);

module.exports = router;
