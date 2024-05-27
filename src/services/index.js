const fs = require('fs');
const path = require('path');
const services = {};
fs.readdirSync(__dirname).forEach(file => {
  if (file === 'index.js') return;
  const ext = path.extname(file);
  if (ext === '.js') {
    const moduleName = path.basename(file, ext).split(".")[0];
    services[moduleName + "Service"] = require(path.join(__dirname, file));
  }
});
module.exports = services;
