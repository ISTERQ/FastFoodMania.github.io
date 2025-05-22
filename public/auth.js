document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registrationForm = document.getElementById("registrationForm");

  // Переключение между формами
  document.getElementById("showLoginForm").addEventListener("click", (e) => {
    e.preventDefault();
    registrationForm.style.display = "none";
    loginForm.style.display = "block";
  });

  document.getElementById("showRegistrationForm").addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    registrationForm.style.display = "block";
  });

  // === Регистрация ===
  registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const response = await fetch("https://fastfoodmania-api.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Регистрация успешна! Войдите в аккаунт.");
        registrationForm.reset();
        loginForm.style.display = "block";
        registrationForm.style.display = "none";
        document.getElementById("loginEmail").value = email;
      } else {
        alert("Ошибка регистрации: " + data.message);
      }
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      alert("Произошла ошибка при регистрации.");
    }
  });

  // === Вход ===
  loginForm.addEventListener("submit", async (e) => {
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

      if (!response.ok) {
        const raw = await response.text();
        console.error("Ошибка входа:", raw);
        alert("Ошибка входа: " + raw);
        return;
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.userId);
      alert("🎉 Вход выполнен!");
      window.location.href = "/profile";

    } catch (error) {
      console.error("Ошибка входа:", error);
      alert("Произошла ошибка при входе.");
    }
  });
});
