document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Изменено: получаем значение как username (может быть email или username)
  const username = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  try {
    const response = await fetch("https://fastfoodmania-api.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), // ИСПРАВЛЕНО: отправляем username
      credentials: "include"
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем данные пользователя
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);

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
    alert("Ошибка сети. Проверьте подключение к интернету.");
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
