require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://fastfoodmania-github-io.onrender.com', // ваш фронтенд
  credentials: true,
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Инициализация таблиц (перенесите initDatabase сюда и вызовите)
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        items JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
}

initDatabase().catch(console.error);

// Middleware для проверки JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Нет токена' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Неверный токен' });
    req.user = user;
    next();
  });
}

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Заполните email и пароль' });
  try {
    const client = await pool.connect();
    const exists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (exists.rows.length) {
      client.release();
      return res.status(409).json({ message: 'Email уже используется' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await client.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
      [email, hashedPassword, firstName, lastName]
    );
    client.release();
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Заполните email и пароль' });
  try {
    const client = await pool.connect();
    const userRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    client.release();
    if (!userRes.rows.length) return res.status(401).json({ message: 'Пользователь не найден' });

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Неверный пароль' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ success: true, accessToken: token, userId: user.id, email: user.email });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить профиль пользователя (только авторизованные)
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ message: 'Доступ запрещён' });
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    client.release();
    if (!result.rows.length) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});



// Получить заказы пользователя
app.get('/api/orders/:userId', authMiddleware, async (req, res) => {
  if (parseInt(req.params.userId) !== req.user.id) {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  try {
    const client = await pool.connect();
    const ordersRes = await client.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    client.release();
    res.json(ordersRes.rows.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    })));
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

