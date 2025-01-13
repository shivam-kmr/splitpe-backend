const httpStatus = require('http-status');
const { friends } = require('../models');
const ApiError = require('../utils/ApiError');
const { signupTypes } = require('../config/signupType');
const { groupTypes } = require('../config/groupTypes');
const config = require('../config/config');
const BaseService = require('./base.service');
const pick = require('../utils/pick');
const emailService = require('./email.service').getInst();
const tokenService = require('./token.service').getInst();

const KEY_EXPIRY_DURATION = 86400;  // Cache expiry duration

class FriendService extends BaseService {
  constructor() {
    super();
  }

  // Add a friend and create a group for the two users.
  async addFriend(friendBody, user) {
    const areAlreadyFriends = await this.areFriends(user.id, friendBody.friendId);
    if (areAlreadyFriends) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You are already friends with this user', "ALREADYFRIEND");
    }

    const friend = await friends.create(friendBody);
    await this.addFriend({
      userId: user.id,
      friendId: friendBody.friendId
    });

    await this.addFriend({
      friendId: user.id,
      userId: friendBody.friendId
    });
    
    this.flushUserRedis(user.id)
    this.flushUserRedis(friendBody.friendId)
    // Create a group for the two friends
    await this.createGroupForFriends(user, friendBody.friendId);

    return friend;
  }

  // Add a friend by email (handle user creation and email sending)
  async addFriendByEmail(friendBody, user) {
    let userRecord = await userService.getUserByEmail(friendBody.email);

    if (!userRecord) {
      userRecord = await userService.createUser({
        email: friendBody.email,
        name: friendBody.name,
        signupStatus: signupTypes.FRIENDADDITION,
        password: "def@ultp@@$w0rd@9o99",
      });

      friendBody.friendId = userRecord.id;

      const context = {
        action: "USERREFERRED",
        email: friendBody.email,
        name: friendBody.name,
      };

      const encryptedContext = tokenService.encryptData(JSON.stringify(context));

      emailService.sendEmailFromTemplate("friendrefered", friendBody.email, {
        userName: user.name,
        friendName: friendBody.name,
        signupLink: `${config.website.url}/verify?token=${encryptedContext}`,
        subject: `You've Been Added to a SplitPe Group by ${user.name} for managing expenses!`,
      });
    } else {
      friendBody.friendId = userRecord.id;
    }

    return this.addFriend(friendBody, user);
  }

  // Query for friends
  async queryFriends(filter, options) {
    options.populate = [
      {
        path: 'friendId',
        select: 'name',
      }
    ];
    options.lean = true;

    return friends.paginate(filter, options);
  }

  // Get friend by id
  async getFriendById(id) {
    return friends.findById(id);
  }

  // Check if two users are friends
  async areFriends(userId, friendId) {
    return friends.findOne({ userId, friendId });
  }

  // Update friend by id
  async updateFriendById(friendId, updateBody) {
    const friend = await this.getFriendById(friendId);
    if (!friend) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
    }
    Object.assign(friend, updateBody);
    await friend.save();
    return friend;
  }

  // Delete friend by id
  async deleteFriendById(friendId) {
    const friend = await this.getFriendById(friendId);
    if (!friend) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
    }
    await friend.remove();
    return friend;
  }

  // Create group for two friends
  async createGroupForFriends(user, friendId) {
    const group = await groupService.createGroup({
      name: `${user.name} and ${friendId}`,
      members: [user.id, friendId],
      createdBy: user.id,
      groupType: groupTypes.PERSONAL,
    });
  }

  // Fetch all friends for user as JSON (caching included)
  async getFriendsJson(user, query) {
    let friendMapping = await this.redis.get(`${config.appname}:${user.id}:friendmapping`);
    
    if (friendMapping) {
      return JSON.parse(friendMapping);
    }

    const options = pick(query, ['sortBy', 'limit', 'page']);
    options.limit = 100000;

    const result = await this.queryFriends({ userId: user.id }, options);
    let friendsJson = {};

    result.results.forEach(friend => {
      friendsJson[friend.friendId.id] = friend.friendId.name;
    });

    friendsJson[user.id] = user.name;  // Add user's own name

    await this.redis.set(`${config.appname}:${user.id}:friendmapping`, JSON.stringify(friendsJson), "NX", KEY_EXPIRY_DURATION);
    return friendsJson;
  }
  async flushUserRedis(userId){
    await this.redis.del(`${config.appname}:${userId}:friendmapping`);
  }
}

module.exports = {
  getInst: function () {
    return new FriendService();
  },
}
