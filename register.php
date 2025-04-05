<?php
require 'vendor/autoload.php'; // Ensure Composer's autoload file is included

// Подключение к базе данных MongoDB
$client = new MongoDB\Client("mongodb://localhost:27017"); // Убедитесь, что указали правильный URI
$collection = $client->fastfoodmania->users; // коллекция 'users' в базе данных 'fastfoodmania'

// Проверка, был ли отправлен POST-запрос
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    
    // Создание документа для вставки
    $document = [
        'username' => $username,
        'email' => $email,
        'password' => $password,
    ];
    
    try {
        // Вставка документа в коллекцию
        $result = $collection->insertOne($document);
        
        if ($result->getInsertedCount() === 1) {
            echo "Регистрация успешна!";
        } else {
            echo "Ошибка: Не удалось зарегистрировать пользователя.";
        }
    } catch (MongoDB\Driver\Exception\Exception $e) {
        echo "Ошибка при регистрации: ", $e->getMessage();
    }
}
?>