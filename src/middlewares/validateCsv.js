const csv = require('csv-parser');
const fs = require('fs');

const validateCsv = (req, res, next) => {
    const file = req.file; // Assuming you're using multer to handle file uploads
    if (!file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    const errors = [];
    const requiredHeaders = ['category_id', 'title', 'caption', 'quote_by'];

    fs.createReadStream(file.path)
        .pipe(csv())
        .on('headers', (headers) => {
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
            if (missingHeaders.length) {
                errors.push(`Missing headers: ${missingHeaders.join(', ')}`);
            }
        })
        .on('data', (row) => {
            // You can add more validation logic here if needed
        })
        .on('end', () => {
            if (errors.length) {
                return res.status(400).send({ errors });
            }
            next();
        });
};

module.exports = validateCsv;
