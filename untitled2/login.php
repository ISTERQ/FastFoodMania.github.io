<?php
   session_start();
   $conn = new mysqli('localhost', 'username', 'password', 'fastfoodmania');

   if ($conn->connect_error) {
       die("Connection failed: " . $conn->connect_error);
   }

   if ($_SERVER["REQUEST_METHOD"] == "POST") {
       $email = $_POST['email'];
       $password = $_POST['password'];

       $sql = "SELECT * FROM FastFoodMania WHERE email='$email'";
       $result = $conn->query($sql);

       if ($result->num_rows > 0) {
           $row = $result->fetch_assoc();
           if (password_verify($password, $row['password'])) {
               $_SESSION['username'] = $row['username'];
               echo "Вход успешен";
           } else {
               echo "Неправильный пароль";
           }
       } else {
           echo "Пользователь не найден";
       }
   }

   $conn->close();
   ?>