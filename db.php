<?php
$servername = "localhost"; // Хост
$username = "root"; // Имя пользователя по умолчанию в MAMP
$password = "root"; // Пароль по умолчанию в MAMP
$dbname = "axmedovij1"; // Убедитесь, что эта база данных существует в phpMyAdmin

// Создаем соединение
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Проверяем соединение
if (!$conn) {
    die("Ошибка подключения: " . mysqli_connect_error());
} echo "Успех"; // Можно комментировать, если вывод в этом файле не нужен
?>