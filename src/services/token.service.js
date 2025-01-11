const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { token: Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const BaseService = require('./base.service'); // BaseService for common logic

class TokenService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Generate token
   * @param {ObjectId} userId
   * @param {Moment} expires
   * @param {string} type
   * @param {string} [secret]
   * @returns {string}
   */
  generateToken(userId, expires, type, secret = config.jwt.secret) {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return jwt.sign(payload, secret);
  }

  /**
   * Encrypt data
   * @param {Object} data
   * @param {string} [secret]
   * @returns {string}
   */
  encryptData(data, secret = config.jwt.secret) {
    return jwt.sign(data, secret);
  }

  /**
   * Decrypt data
   * @param {string} token
   * @returns {Object}
   */
  decryptData(token) {
    return jwt.verify(token, config.jwt.secret);
  }

  /**
   * Save a token
   * @param {string} token
   * @param {ObjectId} userId
   * @param {Moment} expires
   * @param {string} type
   * @param {boolean} [blacklisted]
   * @returns {Promise<Token>}
   */
  async saveToken(token, userId, expires, type, blacklisted = false) {
    const tokenDoc = await Token.create({
      token,
      user: userId,
      expires: expires.toDate(),
      type,
      blacklisted,
    });
    return tokenDoc;
  }

  /**
   * Verify token and return token doc
   * @param {string} token
   * @param {string} type
   * @returns {Promise<Token>}
   */
  async verifyToken(token, type) {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
    if (!tokenDoc) {
      throw new Error('Token not found');
    }
    return tokenDoc;
  }

  /**
   * Generate auth tokens
   * @param {User} user
   * @returns {Promise<Object>}
   */
  async generateAuthTokens(user) {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = this.generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = this.generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
    await this.saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };
  }

  /**
   * Generate reset password token
   * @param {string} email
   * @returns {Promise<string>}
   */
  async generateResetPasswordToken(email) {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
    }
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = this.generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
    await this.saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
    return resetPasswordToken;
  }

  /**
   * Generate verify email token
   * @param {User} user
   * @returns {Promise<string>}
   */
  async generateVerifyEmailToken(user) {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
    const verifyEmailToken = this.generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
    await this.saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
    return verifyEmailToken;
  }
}

module.exports = new TokenService();
