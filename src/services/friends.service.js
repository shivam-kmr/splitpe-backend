const Friend = require('../models/friends.model');

const createFriend = async (friendBody) => {
  return Friend.create(friendBody);
};

const getAllFriends = async () => {
  return Friend.find();
};

const getFriendById = async (friendId) => {
  return Friend.findById(friendId);
};

const updateFriend = async (friendId, updateBody) => {
  return Friend.findByIdAndUpdate(friendId, updateBody, { new: true });
};

const deleteFriend = async (friendId) => {
  return Friend.findByIdAndDelete(friendId);
};

module.exports = {
  createFriend,
  getAllFriends,
  getFriendById,
  updateFriend,
  deleteFriend,
};
