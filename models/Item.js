// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  idNumber: String,
  item: String,
  sn: String,
  status: {
    type: String,
    enum: ['working', 'defective'], // מצב תקין או לא כשיר
    default: 'working',
  },
  // שדות נוספים לפי הצורך
});

module.exports = mongoose.model('Item', itemSchema);
