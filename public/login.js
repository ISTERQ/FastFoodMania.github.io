const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user');  // твоя модель User.js
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Подключение к MongoDB
mongoose.connect('mongodb://sosaldbmoy_memberdeal:cf007c3511b5f6c64e2451ee67bfd0b4804acb52@fyghg.h.filess.io:61004/sosaldbmoy_memberdeal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const JWT_SECRET = 'b3f59c77c06c2d4b6c0d81514f4e4fd7dc17d0f143e8f0bddc4f9306edb969e6';

// Эндпоинт для логина
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;  // или username, если в системе так
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    // Ищем пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Сравниваем пароль (bcrypt)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    // Создаем JWT токен (если нужно)
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Отправляем токен и данные пользователя клиенту
    res.json({
      accessToken: token,
      userId: user._id,
      username: user.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
