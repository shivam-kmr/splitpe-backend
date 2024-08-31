const fs = require('fs');
const csv = require('csv-parser');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { quoteService } = require('../services');


const createQuote = catchAsync(async (req, res) => {
    const quote = await quoteService.createQuote(req.body);
    res.status(httpStatus.CREATED).send(quote);
});

const getQuotes = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['category_id', 'status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await quoteService.queryQuotes(filter, options);
    res.send(result);
  });
  
const getQuote = catchAsync(async (req, res) => {
    const notification = await quoteService.getQuoteById(req.params.quoteId);
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Quote not found');
    }
    res.send(notification);
});

const updateQuote = catchAsync(async (req, res) => {
    const quote = await quoteService.updateQuoteById(req.params.quoteId, req.body);
    res.status(httpStatus.OK).send(quote);
});

const deleteQuote = catchAsync(async (req, res) => {
    await quoteService.deleteQuoteById(req.params.quoteId);
    res.status(httpStatus.NO_CONTENT).send();
});
const uploadQuotes = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new Error('No file uploaded');
    }

    const quotes = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            quotes.push(row);
        })
        .on('end', async () => {
            await quoteService.createQuotes(quotes);
            fs.unlinkSync(req.file.path); // Remove file after processing
            res.status(httpStatus.CREATED).send({ message: 'Quotes uploaded successfully' });
        });
});

module.exports = {
    createQuote,
    getQuotes,
    getQuote,
    updateQuote,
    deleteQuote,
    uploadQuotes,
};
