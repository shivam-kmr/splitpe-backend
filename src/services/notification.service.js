const httpStatus = require('http-status');
const { notification: Notification } = require('../models');
const ApiError = require('../utils/ApiError');
const BaseService = require('./base.service');

class NotificationService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Create a notification
   * @param {Object} notificationBody
   * @returns {Promise<Notification>}
   */
  async createNotification(notificationBody) {
    return Notification.create(notificationBody);
  }

  /**
   * Query for notifications
   * @param {Object} filter - Mongo filter
   * @param {Object} options - Query options
   * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  async queryNotifications(filter, options) {
    return Notification.paginate(filter, options);
  }

  /**
   * Get notification by id
   * @param {ObjectId} id
   * @returns {Promise<Notification>}
   */
  async getNotificationById(id) {
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    }
    return notification;
  }

  /**
   * Update notification by id
   * @param {ObjectId} notificationId
   * @param {Object} updateBody
   * @returns {Promise<Notification>}
   */
  async updateNotificationById(notificationId, updateBody) {
    const notification = await this.getNotificationById(notificationId);
    Object.assign(notification, updateBody);
    await notification.save();
    return notification;
  }

  /**
   * Delete notification by id
   * @param {ObjectId} notificationId
   * @returns {Promise<Notification>}
   */
  async deleteNotificationById(notificationId) {
    const notification = await this.getNotificationById(notificationId);
    await notification.remove();
    return notification;
  }
}

module.exports = new NotificationService();
