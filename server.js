require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Pool } = require('pg');

const PORT = 10000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

// Load products and categories
const products = require('./products.js');



// Initialize database
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Users table
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
    
    // Cart table
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
    
    // Wishlist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);
    
    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        items TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    client.release();
    console.log('✅ База данных инициализирована');
    return true;
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
    return false;
  }
}

// API handler
async function handleApiRequest(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json');

  // Status
  if (pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK', message: 'FishShop API работает' }));
    return;
  }

  // Products
  if (pathname === '/api/products' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(products));
    return;
  }

  // Categories
  if (pathname === '/api/categories' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(categories));
    return;
  }

  // Registration
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { email, password, firstName, lastName } = JSON.parse(body);
        
        const client = await pool.connect();
        const result = await client.query(
          'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
          [email, password, firstName, lastName]
        );
        client.release();
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, user: result.rows[0] }));
      } catch (error) {
        if (error.code === '23505') {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Email уже используется' }));
        } else {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Ошибка регистрации' }));
        }
      }
    });
    return;
  }

  // Login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);
        
        const client = await pool.connect();
        const result = await client.query(
          'SELECT id, email, first_name, last_name FROM users WHERE email = $1 AND password = $2',
          [email, password]
        );
        client.release();
        
        if (result.rows.length === 0) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Неверные данные' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, user: result.rows[0] }));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Ошибка входа' }));
      }
    });
    return;
  }

  // Get user profile
  if (pathname.match(/^\/api\/users\/\d+$/) && req.method === 'GET') {
    const userId = pathname.split('/')[3];
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
        [userId]
      );
      client.release();
      
      if (result.rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Пользователь не найден' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, user: result.rows[0] }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Ошибка получения профиля' }));
    }
    return;
  }

  // Update user profile - PUT
  if (pathname.match(/^\/api\/users\/\d+$/) && req.method === 'PUT') {
    const userId = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { firstName, lastName, email } = JSON.parse(body);
        
        const client = await pool.connect();
        const result = await client.query(
          'UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING id, email, first_name, last_name',
          [firstName, lastName, email, userId]
        );
        client.release();
        
        if (result.rows.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Пользователь не найден' }));
          return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          user: result.rows[0],
          message: 'Профиль обновлен' 
        }));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Ошибка обновления профиля' }));
      }
    });
    return;
  }

  // Get cart
  if (pathname.match(/^\/api\/cart\/\d+$/) && req.method === 'GET') {
    const userId = pathname.split('/')[3];
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT product_id, quantity FROM cart WHERE user_id = $1',
        [userId]
      );
      client.release();
      
      const cartItems = result.rows.map(row => ({
        productId: row.product_id,
        quantity: row.quantity
      }));
      
      res.writeHead(200);
      res.end(JSON.stringify(cartItems));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Ошибка корзины' }));
    }
    return;
  }

  // Add to cart
  if (pathname.match(/^\/api\/cart\/\d+$/) && req.method === 'POST') {
    const userId = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { productId, quantity } = JSON.parse(body);
        
        const client = await pool.connect();
        
        // Update or insert
        const updateResult = await client.query(
          'UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
          [quantity, userId, productId]
        );
        
        if (updateResult.rows.length === 0) {
          await client.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
            [userId, productId, quantity]
          );
        }
        
        client.release();
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Товар добавлен в корзину' }));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Ошибка добавления в корзину' }));
      }
    });
    return;
  }

  // Remove from cart
  if (pathname.match(/^\/api\/cart\/\d+\/\d+$/) && req.method === 'DELETE') {
    const [,, , userId, productId] = pathname.split('/');
    try {
      const client = await pool.connect();
      await client.query(
        'DELETE FROM cart WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      client.release();
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: 'Товар удален' }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Ошибка удаления' }));
    }
    return;
  }

  // Get wishlist
  if (pathname.match(/^\/api\/wishlist\/\d+$/) && req.method === 'GET') {
    const userId = pathname.split('/')[3];
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT product_id FROM wishlist WHERE user_id = $1',
        [userId]
      );
      client.release();
      
      const wishlistItems = result.rows.map(row => ({
        productId: row.product_id
      }));
      
      res.writeHead(200);
      res.end(JSON.stringify(wishlistItems));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Ошибка избранного' }));
    }
    return;
  }

  // Handle preflight requests for wishlist
  if (pathname.match(/^\/api\/wishlist\/\d+$/) && req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Add to wishlist
  if (pathname.match(/^\/api\/wishlist\/\d+$/) && req.method === 'POST') {
    const userId = pathname.split('/')[3];
    console.log('POST wishlist request for user:', userId);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        console.log('Received body:', body);
        const { productId } = JSON.parse(body);
        console.log('Parsed productId:', productId, 'userId:', userId);
        
        const client = await pool.connect();
        console.log('Database connected for wishlist insert');
        
        // Проверяем, есть ли уже запись
        const existingResult = await client.query(
          'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
          [userId, productId]
        );
        
        if (existingResult.rows.length === 0) {
          // Добавляем только если записи нет
          const result = await client.query(
            'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING *',
            [userId, productId]
          );
          console.log('Insert result:', result.rows);
        } else {
          console.log('Item already in wishlist');
        }

        client.release();
        console.log('Database connection released');
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Добавлено в избранное' }));
      } catch (error) {
        console.error('Ошибка wishlist POST:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Ошибка избранного', details: error.message }));
      }
    });
    return;
  }

  // Remove from wishlist
  if (pathname.match(/^\/api\/wishlist\/\d+\/\d+$/) && req.method === 'DELETE') {
    const [,, , userId, productId] = pathname.split('/');
    try {
      const client = await pool.connect();
      await client.query(
        'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      client.release();
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: 'Удалено из избранного' }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Ошибка удаления' }));
    }
    return;
  }

  // Create order
  if (pathname.match(/^\/api\/orders\/\d+$/) && req.method === 'POST') {
    const userId = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { items, total, totalPrice } = JSON.parse(body);
        const finalTotal = total || totalPrice;
        
        const client = await pool.connect();
        
        // Create order
        const orderResult = await client.query(
          'INSERT INTO orders (user_id, total, items, status) VALUES ($1, $2, $3, $4) RETURNING *',
          [userId, finalTotal, JSON.stringify(items), 'pending']
        );
        
        // Clear cart after successful order
        await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);
        
        client.release();
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          order: orderResult.rows[0],
          message: 'Заказ успешно создан' 
        }));
      } catch (error) {
        console.error('❌ Ошибка создания заказа:', error);
        console.error('Body:', body);
        console.error('UserId:', userId);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Ошибка создания заказа: ' + error.message }));
      }
    });
    return;
  }

  // Get user orders
  if (pathname.match(/^\/api\/orders\/\d+$/) && req.method === 'GET') {
    const userId = pathname.split('/')[3];
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      client.release();
      
      const orders = result.rows.map(row => ({
        ...row,
        items: JSON.parse(row.items || '[]')
      }));
      
      res.writeHead(200);
      res.end(JSON.stringify(orders));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Ошибка получения заказов' }));
    }
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Не найдено' }));
}

// Main server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, pathname);
    return;
  }

  // Static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('Страница не найдена');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Ошибка сервера');
      }
    } else {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Start server
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🎣 FishShop сервер запущен на порту ${PORT}`);
  console.log(`🌐 Сайт: http://localhost:${PORT}`);
  
  const dbReady = await initDatabase();
  if (dbReady) {
    console.log(`🚀 PostgreSQL база данных готова!`);
    console.log(`📊 API готов для:`);
    console.log(`   ✓ Профили пользователей с реальными данными`);
    console.log(`   ✓ История заказов из базы данных`);
    console.log(`   ✓ Корзина покупок`);
    console.log(`   ✓ Избранные товары`);
    console.log(`   ✓ ${products.length} товар в ${categories.length} категориях`);
  }
});
