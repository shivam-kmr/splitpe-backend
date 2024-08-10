// image.route.js
const express = require('express');
const { uploadImage, upload } = require('../../controllers/imageupload.controller');

const router = express.Router();

router.post('/upload', upload.single('file'), uploadImage);

module.exports = router;
