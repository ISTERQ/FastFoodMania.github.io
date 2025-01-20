<?php
$conn = new mysqli('localhost', 'username', 'password', 'fastfoodmania');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Используйте подготовленные выражения для безопасности
    $stmt = $conn->prepare("INSERT INTO FastFoodMania (username, email, password) VALUES (?, ?, ?)");
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    
    $stmt->bind_param("sss", $username, $email, $password);
    
    if ($stmt->execute()) {
        echo "Регистрация успешна";
    } else {
        echo "Ошибка: " . $stmt->error;
    }
    
    $stmt->close();
}

$conn->close();
?>