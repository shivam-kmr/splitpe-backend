const fs = require('fs');
const path = require('path');
const files = {};
fs.readdirSync(__dirname).forEach(file => {
  if (file === 'index.js') return;
  const ext = path.extname(file);
  if (ext === '.js') {
    const moduleName = path.basename(file, ext).split(".")[0];
    files[moduleName] = require(path.join(__dirname, file));
  }
});
module.exports = files;