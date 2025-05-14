// В login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("https://fastfoodmania-api.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
      credentials: "include"
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("accessToken", data.accessToken); // Сохраняем токен
      localStorage.setItem("userId", data.userId); // Сохраняем userId
      alert("Вход выполнен!");
      window.location.href = "/profile"; // Перенаправление на страницу профиля
    } else {
      alert(data.message || "Ошибка входа.");
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    alert("Произошла ошибка. Попробуйте снова.");
  }
});
