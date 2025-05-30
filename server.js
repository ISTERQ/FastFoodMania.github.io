require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // <-- только здесь!
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const User = require('./models/User');



const app = express();
const PORT = process.env.PORT || 3000;

const { MONGO_URI, JWT_SECRET, REFRESH_SECRET } = process.env;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(console.error);

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'https://fastfoodmania-github-io.onrender.com',
  credentials: true,
}));

// Временное хранилище Refresh токенов (для примера)
let refreshTokens = [];

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '15m' });
}
function generateRefreshToken(user) {
  const token = jwt.sign({ id: user._id, username: user.username }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.push(token);
  return token;
}

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Все поля обязательны' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email уже занят' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hash });
    await user.save();

    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Логин
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Все поля обязательны' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Неверный email или пароль' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // true если HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, username: user.username });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление access token
app.post('/api/auth/token', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Нет токена' });
  if (!refreshTokens.includes(token)) return res.status(403).json({ message: 'Недействительный токен' });

  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Ошибка токена' });
    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  });
});

// Выход
app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.refreshToken;
  refreshTokens = refreshTokens.filter(t => t !== token);
  res.clearCookie('refreshToken');
  res.json({ message: 'Вы вышли из аккаунта' });
});

// Middleware для проверки access токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Нет токена' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Неверный токен' });
    req.user = user;
    next();
  });
}

// Получение текущего пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json({ username: user.username, email: user.email });
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
