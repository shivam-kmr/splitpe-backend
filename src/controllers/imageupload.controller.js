// image.controller.js
const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cloudinary configuration
cloudinary.config({ 
    cloud_name: 'daxa0ufcm', 
    api_key: '288464884947252', 
    api_secret: 'TRcaeEzYExRA-XMtZ5qmliNaVeU'
});

// Multer setup for file handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage });

// Upload image to Cloudinary
const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: path.parse(req.file.filename).name
        });

        fs.unlinkSync(req.file.path); // Clean up local file

        res.status(200).json({
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        res.status(500).send('Error uploading image.');
    }
};

module.exports = {
    uploadImage,
    upload
};
