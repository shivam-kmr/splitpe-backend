const allRoles = {
  user: ['getCategory','manageCategory', 'manageExpense','getFriends','manageFriends', 'manageFriend', 'manageGroup','manageQuotes','getQuotes','manageTemporaryPosts','getTemporaryPosts','managePublishingPost'],
  admin: ['getUsers', 'manageUsers', 'getFriends', 'manageFriends'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
