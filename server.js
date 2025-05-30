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

// Environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret_key_here";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/fastfoodmania";
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:3000',
      'https://fastfoodmania-github-io.onrender.com',
      'https://fastfoodmania-api.onrender.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
};

// Middleware setup
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// HTTPS redirect in production
if (NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((error) => console.error("❌ MongoDB connection error:", error));

// Utility functions
function generateTokens(user) {
  const issuedAt = Math.floor(Date.now() / 1000);
  
  const accessToken = jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      email: user.email,
      iat: issuedAt 
    },
    JWT_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    { 
      id: user._id, 
      username: user.username,
      iat: issuedAt 
    },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
}

// Validation schemas
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

// Routes

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/connect", (req, res) => {
  res.json({ 
    message: "Server connection successful!",
    timestamp: new Date().toISOString(),
    status: "healthy"
  });
});

// Authentication routes
app.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword 
    });

    await newUser.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      message: 'Registration error', 
      error: err.message 
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/refresh-token', (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(403).json({ message: 'Refresh token not provided' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        id: decoded.id, 
        username: decoded.username 
      }, 
      JWT_SECRET, 
      { expiresIn: '30m' }
    );

    res.status(200).json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

app.post('/logout', (req, res) => {
  console.log("🔄 Logging out user...");
  
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    path: "/"
  });

  res.json({ message: 'Successfully logged out' });
});

// User routes
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'orders',
        options: { sort: { createdAt: -1 } }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if requesting user is the same as the requested user
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      orders: user.orders
    });

  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Order routes
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    // Validate input
    const { error } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { items, total } = req.body;
    const userId = req.user.id;

    // Create order
    const newOrder = new Order({ 
      userId, 
      items, 
      total,
      status: 'pending'
    });
    
    await newOrder.save();

    res.status(201).json({ 
      message: "Order created successfully",
      order: newOrder
    });

  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    res.json(orders);

  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if requesting user owns this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);

  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Legacy routes for backward compatibility (deprecated)
app.post('/order', authMiddleware, async (req, res) => {
  console.warn('⚠️ Using deprecated /order endpoint. Use /api/orders instead.');
  
  try {
    const { items, total } = req.body;
    const userId = req.user.id;

    const newOrder = new Order({ userId, items, total });
    await newOrder.save();

    res.status(201).json({ message: "Order created successfully" });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/orders/:userId', async (req, res) => {
  console.warn('⚠️ Using deprecated /orders/:userId endpoint. Use /api/orders instead.');
  
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      message: 'CORS error: Origin not allowed',
      error: err.message 
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Invalid token',
      error: err.message 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expired',
      error: err.message 
    });
  }

  // MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error',
      error: err.message 
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ 
      message: 'Duplicate key error',
      error: 'Resource already exists' 
    });
  }

  // Default error
  res.status(500).json({ 
    message: 'Internal server error',
    error: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: "Resource not found",
    path: req.path,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 MongoDB: ${MONGO_URI.includes('localhost') ? 'Local' : 'Remote'}`);
});

module.exports = app;
