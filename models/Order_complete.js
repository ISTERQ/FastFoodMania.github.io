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
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  customerName: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);