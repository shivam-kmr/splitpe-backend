const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { friendService } = require('../services');

const addFriend = catchAsync(async (req, res) => {
  const friend = await friendService.addFriend(req.body);
  res.status(httpStatus.CREATED).send(friend);
});

const getFriends = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await friendService.queryFriends(filter, options);
  res.send(result);
});

const getFriend = catchAsync(async (req, res) => {
  const friend = await friendService.getFriendById(req.params.friendId);
  if (!friend) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
  }
  res.send(friend);
});

const updateFriend = catchAsync(async (req, res) => {
  const friend = await friendService.updateFriendById(req.params.friendId, req.body);
  res.send(friend);
});

const deleteFriend = catchAsync(async (req, res) => {
  await friendService.deleteFriendById(req.params.friendId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  addFriend,
  getFriends,
  getFriend,
  updateFriend,
  deleteFriend,
};
