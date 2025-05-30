require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const Order = require('./models/Order'); // если есть

const app = express();
const PORT = process.env.PORT || 3000;

const { MONGO_URI, JWT_SECRET, REFRESH_SECRET } = process.env;

// Подключение к MongoDB — один раз!
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// CORS — только один вызов с нужными опциями
app.use(cors({
  origin: 'https://fastfoodmania-github-io.onrender.com',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.options('*', cors());

// Функция генерации токенов
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, username: user.username },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

// Хранилище refresh токенов (лучше заменить на БД)
let refreshTokens = [];

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email уже используется' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser);
    refreshTokens.push(refreshToken);

    // Устанавливаем refresh токен в httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // true если HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      accessToken,
      userId: newUser._id,
      username: newUser.username,
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// Логин
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Неверный email или пароль' });

    const { accessToken, refreshToken } = generateTokens(user);
    refreshTokens.push(refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // true для HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Вход выполнен',
      accessToken,
      userId: user._id,
      username: user.username,
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

// Обновление access токена с помощью refresh токена
app.post('/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Нет refresh токена' });
  if (!refreshTokens.includes(token)) return res.status(403).json({ message: 'Недействительный refresh токен' });

  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Ошибка проверки refresh токена' });

    const accessToken = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30m' });
    res.json({ accessToken });
  });
});

// Выход — удаление refresh токена
app.post('/logout', (req, res) => {
  const token = req.cookies.refreshToken;
  refreshTokens = refreshTokens.filter(t => t !== token);
  res.clearCookie('refreshToken');
  res.json({ message: 'Вы вышли из аккаунта' });
});

// Middleware для проверки access токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Нет access токена' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Неверный access токен' });
    req.user = user;
    next();
  });
}

// Получение данных текущего пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Твой остальной код (заказы и прочее)...

// Старт сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
