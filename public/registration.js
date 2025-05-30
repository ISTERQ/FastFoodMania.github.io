
const registerForm = document.getElementById('registrationForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    // Валидация
    if (!username || !email || !password) {
      showNotification("Пожалуйста, заполните все поля", "error");
      return;
    }

    if (password.length < 6) {
      showNotification("Пароль должен содержать минимум 6 символов", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showNotification("Пожалуйста, введите корректный email", "error");
      return;
    }

    const data = { username, email, password };

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        showNotification("🎉 Регистрация успешна! Теперь войдите в свой аккаунт", "success");

        // Переключение на форму входа
        document.getElementById('registrationForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';

        // Подставляем email в форму входа
        document.getElementById('loginEmail').value = email;
        
        // Очищаем форму регистрации
        registerForm.reset();
        
      } else {
        showNotification("❌ Ошибка: " + result.message, "error");
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Произошла ошибка при регистрации. Попробуйте позже', "error");
    }
  });
}

// Функция валидации email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Функция показа уведомлений
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Добавляем реальную валидацию полей в реальном времени
document.addEventListener('DOMContentLoaded', () => {
  const usernameField = document.getElementById('registerUsername');
  const emailField = document.getElementById('registerEmail');
  const passwordField = document.getElementById('registerPassword');

  if (usernameField) {
    usernameField.addEventListener('blur', () => {
      const username = usernameField.value.trim();
      if (username.length < 3) {
        usernameField.style.borderColor = '#f44336';
      } else {
        usernameField.style.borderColor = '#4CAF50';
      }
    });
  }

  if (emailField) {
    emailField.addEventListener('blur', () => {
      const email = emailField.value.trim();
      if (!isValidEmail(email)) {
        emailField.style.borderColor = '#f44336';
      } else {
        emailField.style.borderColor = '#4CAF50';
      }
    });
  }

  if (passwordField) {
    passwordField.addEventListener('input', () => {
      const password = passwordField.value;
      if (password.length < 6) {
        passwordField.style.borderColor = '#f44336';
      } else {
        passwordField.style.borderColor = '#4CAF50';
      }
    });
  }
});
