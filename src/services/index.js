let serviceNames = ["auth", "email", "token", "user", "expense"]
serviceNames.forEach(service => {
    module.exports[`${service}Service`] = require(`./${service}.service`);
})
// module.exports.authService = require('./auth.service');
// module.exports.emailService = require('./email.service');
// module.exports.tokenService = require('./token.service');
// module.exports.userService = require('./user.service');
// module.exports.expenseService = require('./expense.service');
