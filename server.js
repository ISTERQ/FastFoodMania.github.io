require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();

// Настройка CORS
const allowedOrigins = [
  'https://isterq.github.io/FastFoodMania.github.io/',
  'http://localhost:3000'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
app.use(express.json());
app.use(cors(corsOptions));

// Подключение к MongoDB
const mongoURI = "mongodb://sosaldbmoy_seemsbarup:977ce0757b6cd6d527c6351fd12595a1a7145196@37z9g.h.filess.io:61004/sosaldbmoy_seemsbarup";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Определение модели пользователя
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ success: false, message: 'Все поля обязательны для заполнения.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, password: hashedPassword, email });

    await newUser.save();
    return res.status(201).json({ success: true, message: 'Пользователь успешно зарегистрирован' });
    
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    return res.status(500).json({ success: false, message: 'Ошибка регистрации пользователя', error: err.message });
  }
});

// Слушаем на порту
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
