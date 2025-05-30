
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("https://fastfoodmania-github-io.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
      credentials: "include"
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем данные пользователя
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", email);

      alert("Вход выполнен!");

      // Закрываем модальное окно
      document.getElementById("loginModal").style.display = "none";
      document.getElementById("modalOverlay").style.display = "none";

      // Обновляем кнопку входа на кнопку профиля
      updateLoginButtonToProfile();

    } else {
      alert("Ошибка входа: " + (data.message || "Неверные данные"));
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    
    // В случае ошибки сети используем локальный режим
    localStorage.setItem("accessToken", "fakeToken");
    localStorage.setItem("userId", "fakeUser");
    localStorage.setItem("username", email);
    
    alert("Вход выполнен в локальном режиме!");
    
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("modalOverlay").style.display = "none";
    
    updateLoginButtonToProfile();
  }
});

// Функция обновления кнопки входа на профиль
function updateLoginButtonToProfile() {
  const loginButton = document.getElementById("loginButton");
  if (loginButton) {
    loginButton.textContent = "Профиль";
    loginButton.id = "profileButton";
    
    // Удаляем старые обработчики и добавляем новый
    const newButton = loginButton.cloneNode(true);
    loginButton.parentNode.replaceChild(newButton, loginButton);
    
    newButton.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("profileSidebar").classList.add("open");
      document.getElementById("profileOverlay").style.display = "block";
      if (window.loadProfile) {
        window.loadProfile();
      }
    });
  }
}

// Проверяем при загрузке страницы, если пользователь уже вошел
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    updateLoginButtonToProfile();
  }
});
