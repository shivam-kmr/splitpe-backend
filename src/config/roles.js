const allRoles = {
  user: ['getCategory','manageCategory', 'manageExpense', 'manageFriend', 'manageGroup'],
  admin: ['getUsers', 'manageUsers'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
