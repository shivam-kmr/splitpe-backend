const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  // You can add more fields as per your requirements
});

const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend;
