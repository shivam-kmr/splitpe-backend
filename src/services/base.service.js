const config = require('../config/config');
var redis = require('../connections/redisClient').getInst(config);

class BaseService {
	constructor(model) {
	  this.model = model;
	  this.redis = redis.getClient();
	}
  
	async create(data) {
	  return this.model.create(data);
	}
  
	async getById(id) {
	  return this.model.findById(id);
	}
  
	async updateById(id, updateData) {
	  const record = await this.getById(id);
	  if (!record) {
		throw new ApiError(httpStatus.NOT_FOUND, `${this.model.modelName} not found`);
	  }
	  Object.assign(record, updateData);
	  await record.save();
	  return record;
	}
  
	async deleteById(id) {
	  const record = await this.getById(id);
	  if (!record) {
		throw new ApiError(httpStatus.NOT_FOUND, `${this.model.modelName} not found`);
	  }
	  await record.remove();
	  return record;
	}
  }
  
  module.exports = BaseService;
  