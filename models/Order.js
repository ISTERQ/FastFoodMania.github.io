
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  phone: String,
  address: String,
  customerName: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
