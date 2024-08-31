const { TemporaryPosts: TemporaryPost } = require('../models/temporarypost.model');


const createTemporaryPost = async (temporaryPostData) => {
    return TemporaryPost.create(temporaryPostData);
};

const createBulkTemporaryPosts = async (temporaryPosts) => {
    return TemporaryPost.insertMany(temporaryPosts);
}

/**
 * Query for temporaryPosts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTemporaryPosts = async (filter, options) => {
    const temporaryPosts = await TemporaryPost.paginate(filter, options);
    return temporaryPosts;
};
const getPendingTemporaryPosts = async () => {
    // const temporaryPosts = await TemporaryPost.find({status: 'new'})
    const temporaryPosts = await TemporaryPost.find({})
    return temporaryPosts;
};

const getTemporaryPostById = async (temporaryPostId) => {
    return TemporaryPost.findById(temporaryPostId).populate('category_id');
};

const updateTemporaryPostById = async (temporaryPostId, updateBody) => {
    const temporaryPost = await TemporaryPost.findByIdAndUpdate(temporaryPostId, updateBody, { new: true });
    return temporaryPost;
};

const deleteTemporaryPostById = async (temporaryPostId) => {
    return TemporaryPost.findByIdAndDelete(temporaryPostId);
};


module.exports = {
    createBulkTemporaryPosts,
    createTemporaryPost,
    queryTemporaryPosts,
    getTemporaryPostById,
    updateTemporaryPostById,
    deleteTemporaryPostById,
    getPendingTemporaryPosts
};
