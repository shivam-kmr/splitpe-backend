const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { friendsService, userService, emailService, groupService, tokenService } = require('../services');
const { signupTypes } = require('../config/signupType');
const { groupTypes } = require('../config/groupTypes');
const config = require('../config/config');

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
      signupStatus: signupTypes.FRIENDADDITION,
      password: "def@ultp@@$w0rd@9o99",
    });
    req.body.friendId = user.id;
    const context = {
      action: "USERREFERRED",
      email: req.body.email,
      name: req.body.name,
    }
    // encrypt the context body so that we can send it in the url.
    const encryptedContext = tokenService.encryptData(JSON.stringify(context));
    await emailService.sendEmailFromTemplate("friendrefered", req.body.email, {
      userName: req.user.name,
      friendName: req.body.name,
      signupLink: `${config.website.url}/verify?token=${encryptedContext}`,
      subject: `You've Been Added to a SplitPe Group by ${req.user.name} for managing expenses!`,
    });  
    
  }else {
    req.body.friendId = user.id;
  }
  let areAlreadyFriends = await friendsService.areFriends(req.user.id, user.id);
  if(areAlreadyFriends && 1==2){
    return res.status(httpStatus.BAD_REQUEST).send({message: 'You are already friends with this user', "code": "ALREADYFRIEND"});
  }
  const friend = await friendsService.addFriend({
    userId: req.user.id,
    friendId: req.body.friendId
  });
  await friendsService.addFriend({
    friendId: req.user.id,
    userId: req.body.friendId
  });
  // create a group for the two friends.
  const group = await groupService.createGroup({
    name: `${req.user.name} and ${req.body.name}`,
    members: [req.user.id, req.body.friendId],
    createdBy: req.user.id,
    groupType: groupTypes.PERSONAL
  });
  res.status(httpStatus.CREATED).send(friend);
});

const getFriends = catchAsync(async (req, res) => {
  var filter = {userId: req.user.id};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await friendsService.queryFriends(filter, options);
  res.send(result);
});

const getFriendsJson = catchAsync(async (req, res) => {
  var filter = {userId: req.user.id};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  options.limit = 100000;
  const result = await friendsService.queryFriends(filter, options);
  let friendsJson = {}
  result.results.forEach(friend => {
    friendsJson[friend.friendId.id] = friend.friendId.name;
  });
  res.send(friendsJson);
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
  getFriendsJson,
  getFriend,
  updateFriend,
  deleteFriend,
};
