const httpStatus = require('http-status');
const { Friend } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Add a friend
 * @param {Object} friendBody
 * @returns {Promise<Friend>}
 */
const addFriend = async (friendBody) => {
  return Friend.create(friendBody);
};

/**
 * Query for friends
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryFriends = async (filter, options) => {
  const friends = await Friend.paginate(filter, options);
  return friends;
};

/**
 * Get friend by id
 * @param {ObjectId} id
 * @returns {Promise<Friend>}
 */
const getFriendById = async (id) => {
  return Friend.findById(id);
};

/**
 * Update friend by id
 * @param {ObjectId} friendId
 * @param {Object} updateBody
 * @returns {Promise<Friend>}
 */
const updateFriendById = async (friendId, updateBody) => {
  const friend = await getFriendById(friendId);
  if (!friend) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
  }
  Object.assign(friend, updateBody);
  await friend.save();
  return friend;
};

/**
 * Delete friend by id
 * @param {ObjectId} friendId
 * @returns {Promise<Friend>}
 */
const deleteFriendById = async (friendId) => {
  const friend = await getFriendById(friendId);
  if (!friend) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
  }
  await friend.remove();
  return friend;
};

module.exports = {
  addFriend,
  queryFriends,
  getFriendById,
  updateFriendById,
  deleteFriendById,
};
