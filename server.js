require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS настройки
const corsOptions = {
  origin: [
    "https://fastfoodmania-github-io.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Модели данных
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  phone: String,
  address: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB подключена"))
.catch((error) => console.error("❌ Ошибка подключения к MongoDB:", error));

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Маршруты

// Регистрация
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверка обязательных полей
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    // Проверка существования пользователя
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({ 
        message: 'Пользователь с таким именем или email уже существует' 
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создание пользователя
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Генерация токена
    const accessToken = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`✅ Пользователь ${username} зарегистрирован`);

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      accessToken,
      userId: newUser._id,
      username: newUser.username
    });

  } catch (error) {
    console.error("❌ Ошибка регистрации:", error);
    res.status(500).json({ 
      message: 'Ошибка сервера при регистрации',
      error: error.message 
    });
  }
});

// Вход
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Имя пользователя и пароль обязательны' });
    }

    // Поиск пользователя по username или email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    // Генерация токена
    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`✅ Пользователь ${user.username} вошел в систему`);

    res.status(200).json({
      message: 'Вход выполнен успешно',
      accessToken,
      userId: user._id,
      username: user.username
    });

  } catch (error) {
    console.error("❌ Ошибка входа:", error);
    res.status(500).json({ 
      message: 'Ошибка сервера при входе',
      error: error.message 
    });
  }
});

// Создание заказа
app.post('/order', authenticateToken, async (req, res) => {
  try {
    const { items, total, phone, address } = req.body;
    const userId = req.user.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Товары не указаны' });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ message: 'Сумма заказа должна быть больше 0' });
    }

    const newOrder = new Order({
      userId,
      items,
      total,
      phone,
      address
    });

    await newOrder.save();

    console.log(`✅ Заказ создан для пользователя ${req.user.username}: ${total}₽`);

    res.status(201).json({
      message: 'Заказ успешно создан',
      orderId: newOrder._id
    });

  } catch (error) {
    console.error("❌ Ошибка создания заказа:", error);
    res.status(500).json({ 
      message: 'Ошибка сервера при создании заказа',
      error: error.message 
    });
  }
});

// Получение заказов пользователя
app.get('/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(orders);

  } catch (error) {
    console.error("❌ Ошибка получения заказов:", error);
    res.status(500).json({ 
      message: 'Ошибка сервера при получении заказов',
      error: error.message 
    });
  }
});

// Выход
app.post('/logout', (req, res) => {
  console.log("🔄 Пользователь вышел из системы");
  res.json({ message: 'Выход выполнен успешно' });
});

// Проверка соединения
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error("🚨 Ошибка сервера:", err);
  res.status(500).json({ 
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
// В server.js добавьте или обновите CORS настройки
const corsOptions = {
  origin: [
    "https://fastfoodmania-github-io.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
