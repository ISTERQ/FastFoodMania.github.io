const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('https://fastfoodmania-api.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем accessToken и userId в localStorage (если нужен)
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', email);

      alert('Вход выполнен!');

      // Закрываем модальное окно
      document.getElementById('loginModal').style.display = 'none';
      document.getElementById('modalOverlay').style.display = 'none';

      // Обновляем кнопку входа на профиль
      updateLoginButtonToProfile();
    } else {
      alert('Ошибка входа: ' + (data.message || 'Неверные данные'));
    }
  } catch (error) {
    console.error('Ошибка входа:', error);
    alert('Ошибка входа. Проверьте соединение и попробуйте снова.');
  }
});

function updateLoginButtonToProfile() {
  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.textContent = 'Профиль';
    loginButton.id = 'profileButton';

    // Удаляем старые обработчики и добавляем новый
    const newButton = loginButton.cloneNode(true);
    loginButton.parentNode.replaceChild(newButton, loginButton);

    newButton.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('profileSidebar').classList.add('open');
      document.getElementById('profileOverlay').style.display = 'block';
      if (window.loadProfile) {
        window.loadProfile();
      }
    });
  }
}

// При загрузке проверяем, залогинен ли пользователь
document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    updateLoginButtonToProfile();
  }
});
