let serviceNames = ["auth", "user", "expense"]
serviceNames.forEach(service => {
    module.exports[`${service}Controller`] = require(`./${service}.controller`);
})
