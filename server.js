const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// Подключаемся к базе данных MongoDB
const mongoURI = "mongodb://sosaldbmoy_seemsbarup:977ce0757b6cd6d527c6351fd12595a1a7145196@37z9g.h.filess.io:61004/sosaldbmoy_seemsbarup";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB подключен'))
    .catch(err => console.log(err));

// Подключаем body-parser для парсинга JSON
app.use(bodyParser.json());

// Создаем схему пользователя
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Создаем модель пользователя
const User = mongoose.model('User', userSchema);

// Маршрут для регистрации
app.post('/register.php', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Проверяем, существует ли пользователь с таким email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Пользователь с таким email уже существует.');
        }

        // Хэшируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем нового пользователя
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).send('Регистрация успешна!');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Ошибка сервера.');
    }
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

async function registerUser() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('mongodb://sosaldbmoy_seemsbarup:977ce0757b6cd6d527c6351fd12595a1a7145196@37z9g.h.filess.io:61004/sosaldbmoy_seemsbarup', { // Замените на ваш URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });

    const result = await response.text();
    alert(result);
}