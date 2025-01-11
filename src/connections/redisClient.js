const { createClient } = require('redis');
const logger = require('../config/logger');

class RedisService {
  constructor(config) {
    this.client = createClient({
      socket: {
        url: config.redis.url,
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
      },
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });

    this.client.on('error', (err) => {
      logger.error(`Redis error: ${err}`);
    });
  }

  /**
   * Connects to the Redis server
   * @returns {Promise<void>}
   */
  connect() {
    try {
      this.client.connect();
      logger.info('Redis connection established successfully');
    } catch (err) {
      logger.error(`Failed to connect to Redis: ${err}`);
      process.exit(1); // Exit if Redis connection fails
    }
  }

  /**
   * Provides the Redis client instance
   * @returns {RedisClient}
   */
  getClient() {
    return this.client;
  }
}

let redisServiceInstance = null;

/**
 * Factory method to get the RedisService instance
 * @param {Object} config
 * @returns {RedisService}
 */
const getRedisService = (config) => {
if (!redisServiceInstance) {
    redisServiceInstance = new RedisService(config);
    redisServiceInstance.connect(); // Connect to Redis on the first call
  }
  return redisServiceInstance;
};

/**
 * Exposing the getInst function for getting RedisService instance
 * @param {Object} config
 * @returns {RedisService}
 */
module.exports = {
  getInst: function (config) {
    return getRedisService(config);
  },
};
