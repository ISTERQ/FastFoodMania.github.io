document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Валидация данных
  if (!email || !password) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  try {
    const response = await fetch("https://fastfoodmania-github-io.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем данные пользователя
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", email);

      alert("Вход выполнен успешно!");

      // Закрываем модальное окно
      document.getElementById("loginModal").style.display = "none";
      document.getElementById("modalOverlay").style.display = "none";

      // Обновляем интерфейс
      updateLoginButtonToProfile();

    } else {
      alert("Ошибка входа: " + (data.message || "Неверные данные"));
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    
    // В случае ошибки сети используем локальный режим для тестирования
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
  const profileButton = document.getElementById("profileButton");
  
  if (loginButton) {
    // Скрываем кнопку входа
    loginButton.style.display = "none";
    
    // Показываем кнопку профиля
    if (profileButton) {
      profileButton.style.display = "flex";
      
      // Добавляем обработчик для кнопки профиля
      profileButton.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("profileSidebar").classList.add("open");
        document.getElementById("profileOverlay").style.display = "block";
        
        // Загружаем профиль если функция доступна
        if (window.loadProfile) {
          window.loadProfile();
        }
      });
    }
  }
}

// Переключение на форму регистрации
document.getElementById('showRegistrationForm').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registrationForm').style.display = 'block';
});

// Функция выхода из системы
function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  
  // Возвращаем кнопку входа
  const loginButton = document.getElementById("loginButton");
  const profileButton = document.getElementById("profileButton");
  
  if (loginButton && profileButton) {
    loginButton.style.display = "flex";
    profileButton.style.display = "none";
  }
  
  // Закрываем профиль если открыт
  document.getElementById("profileSidebar").classList.remove("open");
  document.getElementById("profileOverlay").style.display = "none";
  
  alert("Вы вышли из системы");
}

// Проверяем при загрузке страницы, если пользователь уже вошел
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    updateLoginButtonToProfile();
  }
  
  // Добавляем обработчик для кнопки выхода
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
});
