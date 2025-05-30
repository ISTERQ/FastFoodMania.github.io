require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();

// Импорт моделей
const User = require('./models/User'); 
const Order = require('./models/Order');

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS настройки
const corsOptions = {
  origin: true,
  credentials: true
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// MongoDB подключение
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((error) => console.error("❌ MongoDB connection error:", error));

// Статические файлы
app.use(express.static(path.join(__dirname)));

// JWT секреты
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// Функция генерации токенов
function generateTokens(user) {
    const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
        { id: user._id, username: user.username },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
}

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким именем или email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      accessToken,
      userId: newUser._id
    });

  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ message: 'Ошибка регистрации пользователя', error: err.message });
  }
});

// Авторизация пользователя
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Пользователь с таким email не найден' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: 'Вход выполнен',
      accessToken,
      userId: user._id
    });

  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

// Выход из системы
app.post('/logout', (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    });

    res.json({ message: 'Вы вышли из системы' });
});

// Создание заказа
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, total, phone, address, customerName } = req.body;

    const newOrder = new Order({
      userId,
      items,
      total,
      phone,
      address,
      customerName
    });

    await newOrder.save();

    // Если пользователь авторизован, добавляем заказ к его профилю
    if (userId && !userId.startsWith('temp_')) {
      await User.findByIdAndUpdate(userId, {
        $push: { orders: newOrder._id }
      });
    }

    res.status(201).json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение заказов пользователя
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Ошибка получения заказов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Получение данных пользователя
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('orders');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({
      username: user.username,
      email: user.email,
      orders: user.orders
    });
  } catch (err) {
    console.error('Ошибка при получении данных пользователя:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Корневой маршрут
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!', error: err.message });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Ресурс не найден" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
