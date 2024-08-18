const express = require('express');
const multer = require('multer');
const temporaryPostsController = require('../../controllers/temporarypost.controller');
const temporaryPostValidation = require('../../validations/temporarypost.validation');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .post(auth("manageTemporaryPosts"),validate(temporaryPostValidation.createTemporaryPost), temporaryPostsController.createTemporaryPost)
  .get(auth("getTemporaryPosts"),validate(temporaryPostValidation.getTemporaryPosts), temporaryPostsController.getTemporaryPost);

router
  .route('/:temporaryPostId')
  .get(auth("getTemporaryPosts"),validate(temporaryPostValidation.getTemporaryPost), temporaryPostsController.getTemporaryPostById)
  .patch(auth("manageTemporaryPosts"),validate(temporaryPostValidation.updateTemporaryPost), temporaryPostsController.updateTemporaryPost)
  .delete(auth("manageTemporaryPosts"),validate(temporaryPostValidation.deleteTemporaryPost), temporaryPostsController.deleteTemporaryPost);

router
  .route('/bulk')
  .post(auth("manageTemporaryPosts"),validate(temporaryPostValidation.createBulkTemporaryPost), temporaryPostsController.createBulkTemporaryPost);


module.exports = router;