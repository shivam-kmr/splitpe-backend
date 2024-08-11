const express = require('express');
const multer = require('multer');
const quotesController = require('../../controllers/quote.controller');
const quoteValidation = require('../../validations/quote.validation');
const validateCsv = require('../../middlewares/validateCsv');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Configure multer for file uploads

router
  .route('/')
  .post(auth("manageQuotes"),validate(quoteValidation.createQuote), quotesController.createQuote)
  .get(auth("getQuotes"),validate(quoteValidation.getQuotes), quotesController.getQuotes);

router
  .route('/:quoteId')
  .get(auth("getQuotes"),validate(quoteValidation.getQuote), quotesController.getQuote)
  .patch(auth("manageQuotes"),validate(quoteValidation.updateQuote), quotesController.updateQuote)
  .delete(auth("manageQuotes"),validate(quoteValidation.deleteQuote), quotesController.deleteQuote);

router
    .route('/upload')
    .post(auth("manageQuotes"),upload.single('file'), validateCsv, quotesController.uploadQuotes);
module.exports = router;

/**
 * @swagger
 * /quotes/upload:
 *   post:
 *     summary: Upload CSV to create quotes
 *     tags: [Quotes]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: The CSV file to upload
 *     responses:
 *       201:
 *         description: Quotes uploaded successfully
 *       400:
 *         description: Bad Request
 */
