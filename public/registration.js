// Обработчик формы регистрации
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registrationForm');
  
  if (!registerForm) {
    console.error('Форма регистрации не найдена');
    return;
  }

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Получаем данные из формы
    const username = document.getElementById('registerUsername')?.value?.trim();
    const email = document.getElementById('registerEmail')?.value?.trim();
    const password = document.getElementById('registerPassword')?.value;

    // Валидация
    if (!username || !email || !password) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (username.length < 3) {
      alert('Имя пользователя должно содержать минимум 3 символа');
      return;
    }

    if (password.length < 6) {
      alert('Пароль должен содержать минимум 6 символов');
      return;
    }

    // Простая проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Введите корректный email адрес');
      return;
    }

    const submitButton = registerForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
      // Блокируем кнопку
      submitButton.disabled = true;
      submitButton.textContent = 'Регистрация...';

      const response = await fetch('https://fastfoodmania-api.onrender.com/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const result = await response.json();

      if (response.ok) {
        // Сохраняем данные пользователя
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('username', result.username);

        alert('Регистрация успешна! Добро пожаловать!');
        
        // Закрываем модальное окно
        closeLoginModal();
        
        // Обновляем интерфейс
        updateLoginButtonToProfile();
        
        // Очищаем форму
        registerForm.reset();

      } else {
        alert('Ошибка регистрации: ' + result.message);
      }

    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      alert('Ошибка сети. Проверьте подключение к интернету и попробуйте снова.');
    } finally {
      // Разблокируем кнопку
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
});

// Функция закрытия модального окна
function closeLoginModal() {
  const loginModal = document.getElementById('loginModal');
  const modalOverlay = document.getElementById('modalOverlay');
  
  if (loginModal) loginModal.style.display = 'none';
  if (modalOverlay) modalOverlay.style.display = 'none';
}

// Функция переключения на форму входа
function showLogin() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const toggleRegister = document.getElementById('toggleRegister');
  const toggleLogin = document.getElementById('toggleLogin');

  if (registerForm) registerForm.classList.remove('active');
  if (loginForm) loginForm.classList.add('active');
  if (toggleRegister) toggleRegister.classList.remove('active');
  if (toggleLogin) toggleLogin.classList.add('active');
}

// Функция переключения на форму регистрации
function showRegister() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const toggleRegister = document.getElementById('toggleRegister');
  const toggleLogin = document.getElementById('toggleLogin');

  if (registerForm) registerForm.classList.add('active');
  if (loginForm) loginForm.classList.remove('active');
  if (toggleRegister) toggleRegister.classList.add('active');
  if (toggleLogin) toggleLogin.classList.remove('active');
}
