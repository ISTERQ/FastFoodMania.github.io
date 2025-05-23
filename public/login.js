document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;

  // Сохраняем фейковые данные
  localStorage.setItem("accessToken", "fakeToken");
  localStorage.setItem("userId", "demoUser");
  localStorage.setItem("username", email);

  alert("Вход выполнен!");

  // Закрываем модальное окно входа
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("modalOverlay").style.display = "none";
});
