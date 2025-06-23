const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  idNumber: { type: String, required: true },
  item: { type: String, required: true },
  sn: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
