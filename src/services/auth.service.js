
const BaseService = require('./base.service');
const emailService = require('./email.service').getInst();
const userService = require('./user.service').getInst();
const tokenService = require('./token.service').getInst();

const { token: Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { signupTypes } = require('../config/signupType');
const config = require('../config/config');

const httpStatus = require('http-status');
const { jwtDecode } = require('jwt-decode');

class AuthService extends BaseService {
  constructor() {
    super(Token); // Passing the Token model to the BaseService constructor
  }

  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<User>}
   */
  async loginUserWithEmailAndPassword(email, password) {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    return user;
  }

  /**
   * Logout
   * @param {string} refreshToken
   * @returns {Promise}
   */
  async logout(refreshToken) {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await refreshTokenDoc.remove();
  }

  /**
   * Login with Google
   * @param {Object} body
   * @returns {Promise<User>}
   */
  async loginUserWithGoogle(body) {
    body = jwtDecode(body.token);
    let user = await userService.getUserByEmail(body.email);

    if (!user) {
      // Create new user if not exists
      let newUser = {
        email: body.email,
        socialIdentitifcation: body.googleId,
        name: body.name,
        password: "SecuredPas@1" + body.googleId,
        profilePicture: body.picture,
        signupStatus: signupTypes.SOCIALSIGNUP,
        isEmailVerified: body.email_verified,
      };
      user = await userService.createUser(newUser);
      emailService.sendEmailFromTemplate("signupsocialwelcome", user.email, {
        userName: user.name,
        exploreWebsiteLink: `${config.website.url}`,
        subject: `Welcome to SplitPe Family ${user.name}!`,
      });
    } else if (user && user.signupStatus !== signupTypes.SOCIALSIGNUP) {
      user.signupStatus = signupTypes.SOCIALSIGNUP;
      user.name = body.name;
      user.socialIdentitifcation = body.googleId;
      user.profilePicture = body.picture;
      user.isEmailVerified = body.email_verified;
      user = await userService.updateUserById(user.id, user);
    }

    return user;
  }

  /**
   * Refresh authentication tokens
   * @param {string} refreshToken
   * @returns {Promise<Object>}
   */
  async refreshAuth(refreshToken) {
    try {
      const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
      const user = await userService.getUserById(refreshTokenDoc.user);
      if (!user) {
        throw new Error();
      }
      await refreshTokenDoc.remove();
      return tokenService.generateAuthTokens(user);
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
  }

  /**
   * Reset password
   * @param {string} resetPasswordToken
   * @param {string} newPassword
   * @returns {Promise}
   */
  async resetPassword(resetPasswordToken, newPassword) {
    try {
      const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
      const user = await userService.getUserById(resetPasswordTokenDoc.user);
      if (!user) {
        throw new Error();
      }
      await userService.updateUserById(user.id, { password: newPassword });
      await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
    }
  }

  /**
   * Verify email
   * @param {string} verifyEmailToken
   * @returns {Promise}
   */
  async verifyEmail(verifyEmailToken) {
    try {
      const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
      const user = await userService.getUserById(verifyEmailTokenDoc.user);
      if (!user) {
        throw new Error();
      }
      await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
      await userService.updateUserById(user.id, { isEmailVerified: true });
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
    }
  }
}

module.exports = {
  getInst: function () {
    return new AuthService();
  },
};
