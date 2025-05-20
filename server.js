require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const fs = require('fs');
const reviewsFile = 'reviews.json';
const Joi = require("joi");
app.use(express.json());
const User = require("./models/User");
const Order = require("./models/Order");
const { MongoClient } = require("mongodb");

// ==== Middleware ====
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

const mongoUrl = "mongodb://sosaldbmoy_memberdeal:cf007c3511b5f6c64e2451ee67bfd0b4804acb52@fyghg.h.filess.io:61004/sosaldbmoy_memberdeal";
const client = new MongoClient(mongoUrl, { useUnifiedTopology: true });

let db;
client.connect()
  .then(() => {
    db = client.db("sosaldbmoy_memberdeal");
    console.log("✅ MongoDB подключена");
  })
  .catch(err => {
    console.error("❌ Ошибка подключения к MongoDB:", err);
  });


  

// Настройка CORS
const allowedOrigins = [
  'https://fastfoodmania-github-io.onrender.com', // Первый сайт
];

console.log("Отправка запроса на /refresh");

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            "https://fastfoodmania-github-io.onrender.com",
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Обязательно для передачи s!
};
app.use(express.json());
app.use(cors(corsOptions));
// Используем CORS с настройками
app.use(cors(corsOptions));
app.use(cookieParser());
// Подключение к MongoDB

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false
})
.then(() => console.log("✅ MongoDB connected по URI из .env"))
.catch((error) => console.error("❌ MongoDB connection error:", error));


mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false, // Включено SSL
})
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware для обработки JSON

// Функция проверки срока жизни токена
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Декодируем токен
        return payload.exp * 1000 < Date.now(); // Если exp в прошлом — токен истёк
    } catch (e) {
        return true; // Если ошибка — токен недействителен
    }
}


// Перенаправление HTTP на HTTPS
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
        console.log("Проверка протокола:", req.headers["x-forwarded-proto"]);
        if (req.headers["x-forwarded-proto"] !== "https") {
            console.log("🔄 Перенаправление на HTTPS...");
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
    }
    next();
});



// Указание папки со статическими файлами
app.use(express.static(path.join(__dirname, "public")));


function generateTokens(user, site) {
    const issuedAt = Math.floor(Date.now() / 1000);
    
    const accessToken = jwt.sign(
        { id: user._id, username: user.username, site: "https://fastfoodmania-api.onrender.com", iat: issuedAt },
        JWT_SECRET,
        { expiresIn: "30m" }  // ⏳ Access-токен на 30 минут
    );

    const refreshToken = jwt.sign(
        { id: user._id, username: user.username, site: "https://fastfoodmania-api.onrender.com", iat: issuedAt },
        REFRESH_SECRET,
        { expiresIn: "7d" }  // 🔄 Refresh-токен на 7 дней
    );

    return { accessToken, refreshToken };
}



// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    // Генерация токена
    const accessToken = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '30m' } // Токен действителен 30 минут
    );

    // Отправляем токен в ответ
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      accessToken, // Отправляем токен
      userId: newUser._id // Отправляем userId
    });

  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ message: 'Ошибка регистрации пользователя', error: err.message });
  }
});




// Обработка запроса на обновление токена для ПК-версии
app.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshTokenDesktop;

    if (!refreshToken) {
        console.error("❌ Refresh-токен отсутствует в cookies");
        return res.status(401).json({ message: "Не авторизован" });
    }

    console.log("🔍 Полученный refreshToken:", refreshToken);
    
    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            console.error("❌ Ошибка проверки refresh-токена:", err.message);
            
            res.clearCookie("refreshTokenDesktop", {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                path: "/"
            });

            return res.status(403).json({ message: "Refresh-токен недействителен или истёк" });
        }

        if (!decoded.exp || (decoded.exp * 1000 < Date.now())) {
            console.error("❌ Refresh-токен окончательно истёк!");
            res.clearCookie("refreshTokenDesktop", { path: "/" });
            return res.status(403).json({ message: "Refresh-токен истёк" });
        }

        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                console.error("❌ Пользователь не найден по ID:", decoded.id);
                return res.status(404).json({ message: "Пользователь не найден" });
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
            res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ Добавили заголовок
            res.cookie("refreshTokenDesktop", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000  // 30 дней
            });

            console.log("✅ Refresh-токен обновлён успешно");

            // 🚀 Отключаем кеширование
            res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ Добавили заголовок
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            res.json({ accessToken });

        } catch (error) {
            console.error("❌ Ошибка при поиске пользователя:", error);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    });
});


app.post('/logout', (req, res) => {
    console.log("🔄 Выход из аккаунта...");
    
    res.clearCookie("refreshTokenDesktop", {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: "/",
        domain: "https://fastfoodmania-github-io.onrender.com"
    });

    res.json({ message: 'Вы вышли из системы' });
});


// Обновление токена
app.post('/-token', (req, res) => {
  const { token: Token } = req.body;

  if (!Token) {
    return res.status(403).json({ message: 'Токен обновления не предоставлен' });
  }

  try {
    const user = jwt.verify(Token, JWT_SECRET);
    const newAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Недействительный токен обновления' });
  }
});

// Обработка корневого маршрута
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Проверка соединения
app.get("/connect", (req, res) => {
  res.send("Соединение с сервером успешно!");
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!', error: err.message });
});



// ==== Запуск сервера ====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});


app.post('/order', async (req, res) => {
  try {
    const { userId, items, total } = req.body;

    const newOrder = new Order({ userId, items, total });
    await newOrder.save();

    res.status(201).json({ message: "Заказ успешно оформлен" });
  } catch (err) {
    console.error("Ошибка при создании заказа:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Ошибка при получении заказов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
async function loadOrders(userId) {
  const res = await fetch(`https://fastfoodmania-github-io.onrender.com/orders/${userId}`);
  const orders = await res.json();
  // отображаем в модальном окне или отдельной секции
}
app.get('/orders/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Ошибка при получении истории заказов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


app.get('/api/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Ошибка получения заказов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


// server.js
app.get('/api/orders', async (req, res) => {
    const userId = req.userId;  // Получаем userId из JWT
    if (!userId) return res.status(401).json({ error: 'Пользователь не авторизован' });

    try {
        const orders = await Order.find({ userId }).populate('items');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении заказов', message: err.message });
    }
});





// В сервере (например, в server.js)
app.post('/api/orders', async (req, res) => {
  const { userId, items, total } = req.body;

  try {
    const newOrder = new Order({
      userId,   // Связь с пользователем
      items,    // Товары в заказе
      total     // Общая стоимость
    });

    // Сохраняем заказ в базе
    await newOrder.save();

    // Обновляем пользователя, добавляя заказ в его историю
    const user = await User.findById(userId);
    if (user) {
      user.orders.push(newOrder._id); // Добавляем ID нового заказа в историю пользователя
      await user.save();
    }

    res.status(201).json(newOrder); // Возвращаем новый заказ
  } catch (err) {
    console.error("Ошибка при добавлении заказа:", err);
    res.status(500).json({ message: "Ошибка при создании заказа" });
  }
});


app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({ path: 'orders', options: { sort: { createdAt: -1 } } });

    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    res.json({
      username: user.username,
      email: user.email,
      orders: user.orders
    });
  } catch (err) {
    console.error('Ошибка при получении профиля:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    // Добавляем заказ к пользователю
    await User.findByIdAndUpdate(
      req.body.userId,
      { $push: { orders: newOrder._id } }
    );

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Ошибка при добавлении заказа:", err);
    res.status(500).json({ message: "Ошибка при создании заказа" });
  }
});

// ==== Получение профиля и заказов пользователя ====
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({ path: "orders", options: { sort: { createdAt: -1 } } });

    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    res.json({
      username: user.username,
      email: user.email,
      orders: user.orders
    });
  } catch (err) {
    console.error("Ошибка при получении профиля:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ==== Создание заказа ====
app.post("/api/orders", async (req, res) => {
  const { userId, items, total } = req.body;
  try {
    const order = new Order({ userId, items, total });
    await order.save();

    await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });

    res.status(201).json({ message: "Заказ добавлен" });
  } catch (err) {
    console.error("Ошибка при создании заказа:", err);
    res.status(500).json({ message: "Ошибка при заказе" });
  }
});

// ==== Получение заказов пользователя ====
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Ошибка получения заказов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ==== Статические файлы и запуск ====
app.use(express.static(path.join(__dirname, "public")));


