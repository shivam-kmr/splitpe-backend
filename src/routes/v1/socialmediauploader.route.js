const express = require('express');
const socialmediaController = require('../../controllers/socialmedia.controller');
const router = express.Router();

router
  .route('/golive')
  .post(socialmediaController.postToInstagram)

module.exports = router;