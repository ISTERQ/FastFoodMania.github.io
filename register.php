<?php
$uri = "mongodb://sosaldbmoy_seemsbarup:977ce0757b6cd6d527c6351fd12595a1a7145196@37z9g.h.filess.io:61004/sosaldbmoy_seemsbarup";
$client = new MongoDB\Client($uri);
$collection = $client->sosaldbmoy_seemsbarup->users;

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['username']) && isset($data['email']) && isset($data['password'])) {
    $result = $collection->insertOne([
        'username' => $data['username'],
        'email' => $data['email'],
        'password' => password_hash($data['password'], PASSWORD_DEFAULT) // Не забывайте хэшировать пароли
    ]);
    
    if ($result->getInsertedCount() === 1) {
        echo json_encode(['success' => true, 'message' => 'Пользователь успешно зарегистрирован.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при регистрации.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Не все поля заполнены.']);
}
?>
