// Обработчик формы входа
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (!loginForm) {
    console.error('Форма входа не найдена');
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Получаем данные из формы
    const username = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;

    // Валидация
    if (!username || !password) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent || 'Войти';

    try {
      // Блокируем кнопку
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Вход...';
      }

      const response = await fetch('https://fastfoodmania-api.onrender.com/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok) {
        // Сохраняем данные пользователя
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('username', result.username);

        alert('Вход выполнен успешно!');
        
        // Закрываем модальное окно
        closeLoginModal();
        
        // Обновляем интерфейс
        updateLoginButtonToProfile();
        
        // Очищаем форму
        loginForm.reset();

        // Загружаем профиль если он открыт
        if (window.loadProfile) {
          window.loadProfile();
        }

      } else {
        alert('Ошибка входа: ' + result.message);
      }

    } catch (error) {
      console.error('Ошибка при входе:', error);
      alert('Ошибка сети. Проверьте подключение к интернету и попробуйте снова.');
    } finally {
      // Разблокируем кнопку
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });

  // Проверяем, авторизован ли пользователь при загрузке
  checkAuthStatus();
});

// Функция проверки статуса авторизации
function checkAuthStatus() {
  const userId = localStorage.getItem('userId');
  const accessToken = localStorage.getItem('accessToken');
  
  if (userId && accessToken) {
    updateLoginButtonToProfile();
  }
}

// Функция обновления кнопки входа на профиль
function updateLoginButtonToProfile() {
  const loginButton = document.getElementById('loginButton');
  
  if (!loginButton) return;

  // Меняем текст и ID кнопки
  loginButton.textContent = 'Профиль';
  loginButton.id = 'profileButton';
  
  // Удаляем старые обработчики и добавляем новый
  const newButton = loginButton.cloneNode(true);
  loginButton.parentNode.replaceChild(newButton, loginButton);
  
  newButton.addEventListener('click', (event) => {
    event.preventDefault();
    openProfileSidebar();
  });
}

// Функция открытия профиля
function openProfileSidebar() {
  const profileSidebar = document.getElementById('profileSidebar');
  const profileOverlay = document.getElementById('profileOverlay');
  
  if (profileSidebar) {
    profileSidebar.classList.add('open');
  }
  
  if (profileOverlay) {
    profileOverlay.style.display = 'block';
  }
  
  // Загружаем данные профиля
  if (window.loadProfile) {
    window.loadProfile();
  }
}

// Функция закрытия модального окна
function closeLoginModal() {
  const loginModal = document.getElementById('loginModal');
  const modalOverlay = document.getElementById('modalOverlay');
  
  if (loginModal) loginModal.style.display = 'none';
  if (modalOverlay) modalOverlay.style.display = 'none';
}

// Функция выхода из системы
async function logout() {
  const submitButton = document.getElementById('logoutButton');
  
  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Выход...';
    }

    // Отправляем запрос на сервер
    await fetch('https://fastfoodmania-api.onrender.com/logout', {
      method: 'POST',
      credentials: 'include'
    });

    // Очищаем локальные данные
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('cartData');

    alert('Вы успешно вышли из системы');
    
    // Перезагружаем страницу для сброса состояния
    location.reload();

  } catch (error) {
    console.error('Ошибка при выходе:', error);
    
    // Даже если запрос не прошел, очищаем локальные данные
    localStorage.clear();
    location.reload();
  }
}

// Экспортируем функции для использования в других файлах
window.updateLoginButtonToProfile = updateLoginButtonToProfile;
window.logout = logout;
window.closeLoginModal = closeLoginModal;
