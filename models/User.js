// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  tz: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  class: { type: String, required: false },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  resetPasswordOTP: { type: String, default: null },
  resetPasswordOTPExpires: { type: Date, default: null }

});

module.exports = mongoose.model('User', userSchema);