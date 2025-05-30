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
const { authMiddleware } = require('./middleware/auth');

const app = express();

const {
  JWT_SECRET = "your_jwt_secret_key_here",
  REFRESH_SECRET = "your_refresh_secret_key_here",
  MONGO_URI = "mongodb://localhost:27017/fastfoodmania",
  NODE_ENV = "development",
  PORT = 5000
} = process.env;

// CORS конфигурация (актуализируй список origin, если нужно)
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  'https://fastfoodmania-github-io.onrender.com',
  'https://fastfoodmania-api.onrender.com'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Статика
app.use(express.static(path.join(__dirname, "public")));

// HTTPS редирект в продакшене (оставь, если используешь HTTP -> HTTPS)
if (NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// MongoDB подключение
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Валидация Joi
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
const orderSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().integer().min(1).required()
  })).required(),
  total: Joi.number().required()
});

// JWT генерация
function generateTokens(user) {
  const accessToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '30m' });
  const refreshToken = jwt.sign({ id: user._id, username: user.username }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// --- Роуты ---

// Главная страница (если нужна отдача статики)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Регистрация
app.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ message: 'Email или имя занято' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7*24*60*60*1000
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

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Неверный email или пароль' });

    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7*24*60*60*1000
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

// Обновление токена
app.post('/refresh-token', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(403).json({ message: 'Нет refresh токена' });

  try {
    const user = jwt.verify(token, REFRESH_SECRET);
    const accessToken = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30m' });
    res.json({ accessToken });
  } catch (err) {
    console.error('Ошибка обновления токена:', err);
    res.status(403).json({ message: 'Неверный refresh токен' });
  }
});

// Выход
app.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.json({ message: 'Успешный выход' });
});

// Пример защищённого маршрута с middleware
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  res.json(user);
});

// Другие маршруты, например для заказов — оставь по необходимости

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ресурс не найден' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
