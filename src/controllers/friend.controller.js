const httpStatus = require('http-status');
const Friend = require('../models/friends.model');
const ApiError = require('../utils/ApiError');

const createFriend = async (req, res, next) => {
  try {
    const friend = await Friend.create(req.body);
    res.status(httpStatus.CREATED).json(friend);
  } catch (error) {
    next(error);
  }
};

const getAllFriends = async (req, res, next) => {
  try {
    const friends = await Friend.find();
    res.json(friends);
  } catch (error) {
    next(error);
  }
};

const getFriendById = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const friend = await Friend.findById(friendId);
    if (!friend) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
    }
    res.json(friend);
  } catch (error) {
    next(error);
  }
};

const updateFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const friend = await Friend.findByIdAndUpdate(friendId, req.body, { new: true });
    if (!friend) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
    }
    res.json(friend);
  } catch (error) {
    next(error);
  }
};

const deleteFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const friend = await Friend.findByIdAndDelete(friendId);
    if (!friend) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
    }
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFriend,
  getAllFriends,
  getFriendById,
  updateFriend,
  deleteFriend,
};
