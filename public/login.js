document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Отменяем стандартное поведение формы

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    // Отправка данных на сервер для проверки логина и пароля
    const response = await fetch("https://fastfoodmania-api.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
      credentials: "include"
    });

    const data = await response.json();

    if (response.ok) {
      // Если вход успешный, сохраняем данные в localStorage
      localStorage.setItem("accessToken", data.accessToken); // Сохраняем токен
      localStorage.setItem("userId", data.userId); // Сохраняем ID пользователя

      console.log(localStorage.getItem("accessToken")); // Проверяем токен
      console.log(localStorage.getItem("userId")); // Проверяем userId

      // Перенаправляем на страницу профиля
      alert("Вход выполнен!");
      window.location.href = "/profile"; // Редирект на страницу профиля
    } else {
      alert(data.message || "Ошибка входа."); // Сообщение об ошибке
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    alert("Произошла ошибка. Попробуйте снова.");
  }
});
