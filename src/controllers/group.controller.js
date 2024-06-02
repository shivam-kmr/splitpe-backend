const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { groupService } = require('../services');

const createGroup = catchAsync(async (req, res) => {
  const group = await groupService.createGroup(req.body);
  res.status(httpStatus.CREATED).send(group);
});

const getGroups = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await groupService.queryGroups(filter, options);
  res.send(result);
});

const getGroup = catchAsync(async (req, res) => {
  const group = await groupService.getGroupById(req.params.groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }
  res.send(group);
});

const updateGroup = catchAsync(async (req, res) => {
  const group = await groupService.updateGroupById(req.params.groupId, req.body);
  res.send(group);
});

const deleteGroup = catchAsync(async (req, res) => {
  await groupService.deleteGroupById(req.params.groupId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
};