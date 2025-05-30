
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showNotification("Пожалуйста, заполните все поля", "error");
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", email);

      showNotification("Добро пожаловать! Вход выполнен успешно", "success");

      // Закрываем модальное окно
      closeModal();

      // Обновляем кнопку входа на кнопку профиля
      updateLoginButtonToProfile();

      // Загружаем профиль
      setTimeout(() => {
        if (window.loadProfile) {
          window.loadProfile();
        }
      }, 500);

    } else {
      showNotification("Ошибка входа: " + (data.message || "Неверные данные"), "error");
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    showNotification("Произошла ошибка при входе. Попробуйте позже", "error");
  }
});

// Функция закрытия модального окна
function closeModal() {
  const loginModal = document.getElementById("loginModal");
  const modalOverlay = document.getElementById("modalOverlay");
  
  if (loginModal) loginModal.style.display = "none";
  if (modalOverlay) modalOverlay.style.display = "none";
}

// Функция показа уведомлений
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Функция обновления кнопки входа на профиль
function updateLoginButtonToProfile() {
  const loginButton = document.getElementById("loginButton");
  if (loginButton) {
    loginButton.textContent = "👤 Профиль";
    loginButton.id = "profileButton";
    
    const newButton = loginButton.cloneNode(true);
    loginButton.parentNode.replaceChild(newButton, loginButton);
    
    newButton.addEventListener("click", (e) => {
      e.preventDefault();
      openProfile();
    });
  }
}

// Функция открытия профиля
function openProfile() {
  const profileSidebar = document.getElementById("profileSidebar");
  const profileOverlay = document.getElementById("profileOverlay");
  
  if (profileSidebar && profileOverlay) {
    profileSidebar.classList.add("open");
    profileOverlay.style.display = "block";
    document.body.style.overflow = "hidden";
    
    if (window.loadProfile) {
      window.loadProfile();
    }
  }
}

// Проверяем при загрузке страницы, если пользователь уже вошел
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");
  
  if (userId && accessToken) {
    updateLoginButtonToProfile();
  }
  
  // Добавляем обработчик переключения между формами
  setupFormSwitching();
});

// Функция настройки переключения между формами
function setupFormSwitching() {
  const switchToRegister = document.getElementById("switchToRegister");
  const switchToLogin = document.getElementById("switchToLogin");
  const loginForm = document.getElementById("loginForm");
  const registrationForm = document.getElementById("registrationForm");
  
  if (switchToRegister) {
    switchToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginForm) loginForm.style.display = "none";
      if (registrationForm) registrationForm.style.display = "block";
    });
  }
  
  if (switchToLogin) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      if (registrationForm) registrationForm.style.display = "none";
      if (loginForm) loginForm.style.display = "block";
    });
  }
}

// Обработчик ESC для закрытия модального окна
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});
