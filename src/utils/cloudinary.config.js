const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'daxa0ufcm', 
    api_key: '288464884947252', 
    api_secret: process.env.CLOUDINARY_API_SECRET // Store secret in environment variables
});

module.exports = cloudinary;
