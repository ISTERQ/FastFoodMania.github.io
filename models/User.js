const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, default: "" },
  city: { type: String, default: "" },

  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],   // Связь с заказами
  tempUserId: { type: String, unique: true, sparse: true },           // Для временных пользователей
  mergedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] // Объединённые заказы
});

const User = mongoose.model('User', userSchema);
module.exports = User;
