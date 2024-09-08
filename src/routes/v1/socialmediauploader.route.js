const express = require('express');
const socialmediaController = require('../../controllers/socialmedia.controller');
const publishingPostValidation = require('../../validations/publishingpost.validation');
const router = express.Router();
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');

router
  .route('/golive')
  .post(auth("managePublishingPost"),validate(publishingPostValidation.createPublishingPost),socialmediaController.postToInstagram)

module.exports = router;