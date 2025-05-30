document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // ИСПОЛЬЗУЕМ USERNAME ВМЕСТО EMAIL
  const username = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("https://fastfoodmania-api.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), // ИСПРАВЛЕНО
      credentials: "include"
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", username);

      alert("Вход выполнен!");
      
      document.getElementById("loginModal").style.display = "none";
      document.getElementById("modalOverlay").style.display = "none";
      
      updateLoginButtonToProfile();
    } else {
      alert("Ошибка входа: " + (data.message || "Неверные данные"));
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    alert("Ошибка сети. Попробуйте позже.");
  }
});
