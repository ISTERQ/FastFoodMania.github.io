document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("https://fastfoodmania-api.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }), // отправляем email как username
      credentials: "include"
    });

    if (!response.ok) {
      const raw = await response.text(); // получаем текст ошибки от сервера
      console.error("Ошибка входа (текст):", raw);
      alert("Ошибка входа: " + raw);
      return;
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("userId", data.userId);
    alert("Вход выполнен!");
    window.location.href = "/profile";

  } catch (error) {
    console.error("Ошибка входа (catch):", error);
    alert("Произошла ошибка. Попробуйте снова.\n" + error.message);
  }
});
