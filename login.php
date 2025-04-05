<?php
session_start();
require 'vendor/autoload.php';  // Загрузка Composer

$client = new MongoDB\Client("mongodb://sosaldbmoy_seemsbarup:977ce0757b6cd6d527c6351fd12595a1a7145196@37z9g.h.filess.io:61004/sosaldbmoy_seemsbarup");

$db = $client->sosaldbmoy_seemsbarup;
$collection = $db->FastFoodMania; // Название коллекции в MongoDB

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $user = $collection->findOne(['email' => $email]);

    if ($user) {
        if (password_verify($password, $user['password'])) {
            $_SESSION['username'] = $user['username'];
            echo "Вход успешен";
        } else {
            echo "Неправильный пароль";
        }
    } else {
        echo "Пользователь не найден";
    }
}
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'register') {
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Хэшируем пароль

    // Проверка на уникальность email
    if ($collection->findOne(['email' => $email])) {
        echo "Пользователь с таким email уже существует.";
    } else {
        // Вставляем нового пользователя в коллекцию
        $collection->insertOne([
            'email' => $email,
            'password' => $password,
            'username' => $_POST['username'] // Допустим, поле username также есть
        ]);
        echo "Регистрация успешна!";
    }
}
?>