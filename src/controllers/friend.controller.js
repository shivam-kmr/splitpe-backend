const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { friendsService, userService, emailService } = require('../services');

const addFriend = catchAsync(async (req, res) => {
  const friend = await friendsService.addFriend(req.body);
  res.status(httpStatus.CREATED).send(friend);
});

const addFriendByEmail = catchAsync(async (req, res) => {
  let user = await userService.getUserByEmail(req.body.email);
  if(!user){
    user = await userService.createUser({
      email: req.body.email,
      name: req.body.name,
      signupStatus: 2,
      password: "def@ultp@@$w0rd@9o99",
    });
    req.body.friendId = user.id;
    emailService.sendFriendReferredEmail(req.user.name, req.body.name, req.body.email);
  }else {
    req.body.friendId = user.id;
  }
  const friend = await friendsService.addFriend({
    userId: req.user.id,
    friendId: req.body.friendId
  });
  res.status(httpStatus.CREATED).send(friend);
});

const getFriends = catchAsync(async (req, res) => {
  var filter = {userId: req.user.id};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await friendsService.queryFriends(filter, options);
  res.send(result);
});

const getFriend = catchAsync(async (req, res) => {
  const friend = await friendsService.getFriendById(req.params.friendId);
  if (!friend) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
  }
  res.send(friend);
});

const updateFriend = catchAsync(async (req, res) => {
  const friend = await friendsService.updateFriendById(req.params.friendId, req.body);
  res.send(friend);
});

const deleteFriend = catchAsync(async (req, res) => {
  await friendsService.deleteFriendById(req.params.friendId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  addFriend,
  addFriendByEmail,
  getFriends,
  getFriend,
  updateFriend,
  deleteFriend,
};
