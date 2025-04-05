// Импортируем необходимый модуль для работы с MongoDB
const { MongoClient } = require('mongodb');

// URL вашей базы данных
const uri = "mongodb://sosaldbmoy_seemsbarup:977ce0757b6cd6d527c6351fd12595a1a7145196@37z9g.h.filess.io:61004/sosaldbmoy_seemsbarup";

// Создаем новый экземпляр клиента MongoDB
const client = new MongoClient(uri);

async function run() {
    try {
        // Подключаемся к MongoDB
        await client.connect();
        console.log("Подключено к базе данных");

        // Выбираем базу данных и коллекцию
        const database = client.db('sosaldbmoy_seemsbarup');
        const usersCollection = database.collection('users');

        // Обработчик регистрации
        const express = require('express');
        const bodyParser = require('body-parser');
        const bcrypt = require('bcrypt');
        
        const app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // Эндпоинт для регистрации пользователя
        app.post('/register', async (req, res) => {
            const { username, email, password } = req.body;

            // Хэшируем пароль перед сохранением
            const hashedPassword = await bcrypt.hash(password, 10);

            // Создаем нового пользователя
            const newUser = {
                username,
                email,
                password: hashedPassword,
            };

            try {
                const result = await usersCollection.insertOne(newUser);
                res.status(201).json({ message: "Пользователь успешно зарегистрирован", userId: result.insertedId });
            } catch (error) {
                console.error("Ошибка при регистрации пользователя:", error);
                res.status(500).json({ message: "Ошибка регистрации" });
            }
        });

        // Запускаем сервер
        const PORT = process.env.PORT || 3000; // используем 3000 порт или указанный в переменной окружения
        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
        
    } catch (error) {
        console.error("Ошибка подключения к базе данных:", error);
    } finally {
        // Важно не закрывать соединение пока сервер работает
        // await client.close();
    }
}

// Запускаем функцию
run().catch(console.dir);