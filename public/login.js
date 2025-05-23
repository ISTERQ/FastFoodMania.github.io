document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Сохраняем введённые данные
  localStorage.setItem("accessToken", "fakeToken");
  localStorage.setItem("userId", "fakeUser");
  localStorage.setItem("username", email);
  localStorage.setItem("password", password); // сохраняем для проверки в профиле

  alert("Вход выполнен!");

  // Закрываем окно входа
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("modalOverlay").style.display = "none";
});
