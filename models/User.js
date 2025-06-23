// Server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false } // שדה חדש
});

module.exports = mongoose.model('User', userSchema);



