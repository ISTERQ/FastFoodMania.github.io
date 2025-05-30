require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Joi = require("joi");

const User = require('./models/User'); 
const Order = require('./models/Order');

const app = express();

const corsOptions = {
  origin: true,       // или можно указать конкретный origin, если нужно
  credentials: true
};

// Подключаемся к MongoDB (один раз!)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(cors(corsOptions));      // Вызов cors — один раз
app.options("*", cors(corsOptions)); // Preflight
app.use(express.json());          // Один раз
app.use(cookieParser());          // Один раз

// Статические файлы
app.use(express.static(path.join(__dirname, "public")));

// HTTPS редирект для продакшена (если нужно)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}
// Joi-схемы для валидации
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Генерация access и refresh токенов
function generateTokens(user) {
  const accessToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30m' });
  const refreshToken = jwt.sign({ id: user._id, username: user.username }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}
// Регистрация
app.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(409).json({ message: 'Email или имя уже заняты' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Регистрация успешна',
      accessToken,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вход
app.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Неверный email или пароль' });

    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Вход выполнен',
      accessToken,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление access токена
app.post('/refresh-token', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(403).json({ message: 'Нет refresh токена' });

  try {
    const user = jwt.verify(token, process.env.REFRESH_SECRET);
    const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30m' });
    res.json({ accessToken });
  } catch (err) {
    console.error('Ошибка обновления токена:', err);
    res.status(403).json({ message: 'Недействительный refresh токен' });
  }
});

// Выход
app.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.json({ message: 'Вы вышли из аккаунта' });
});
// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ресурс не найден' });
});
fetch('https://fastfoodmania-api.onrender.com/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include'
});
