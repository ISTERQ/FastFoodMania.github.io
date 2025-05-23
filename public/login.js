document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (email === "test@gmail.com" && password === "testtesttest") {
    localStorage.setItem("accessToken", "demoToken");
    localStorage.setItem("userId", "demoUser");
    localStorage.setItem("username", email);

    alert("Вход выполнен!");

    // Закрываем модальное окно
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("modalOverlay").style.display = "none";
  } else {
    alert("❌ Неверный email или пароль.\nДопустим только demo-доступ:\nEmail: test@gmail.com\nПароль: testtesttest");
  }
});
