<?php
header('Content-Type: application/json');

require 'vendor/autoload.php'; // Подключите Composer автозагрузчик

// MongoDB подключение
$mongoURI = "mongodb://sosaldbmoy_seemsbarup:977ce0757b6cd6d527c6351fd12595a1a7145196@37z9g.h.filess.io:61004/sosaldbmoy_seemsbarup";
$client = new MongoDB\Client($mongoURI);
$collection = $client->sosaldbmoy_seemsbarup->users; // Предполагается, что коллекция называется 'users'

$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'];
$email = $input['email'];
$password = password_hash($input['password'], PASSWORD_BCRYPT); // Хеширование пароля

// Проверка на уникальность email
$user = $collection->findOne(['email' => $email]);
if ($user) {
    echo json_encode(['success' => false, 'message' => 'Этот email уже используется.']);
    exit();
}

// Вставка нового пользователя
$result = $collection->insertOne([
    'username' => $username,
    'email' => $email,
    'password' => $password
]);

if ($result->getInsertedCount() === 1) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка регистрации.']);
}
?>
