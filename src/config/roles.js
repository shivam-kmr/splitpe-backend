const allRoles = {
  user: ['getCategory','manageCategory', 'manageExpense', 'manageFriend', 'manageGroup','manageQuotes','getQuotes','manageTemporaryPosts','getTemporaryPosts'],
  admin: ['getUsers', 'manageUsers'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
