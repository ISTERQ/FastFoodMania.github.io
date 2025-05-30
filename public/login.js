const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('https://fastfoodmania-api.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      alert('Ошибка входа: ' + (data.message || 'Неверные данные'));
      return;
    }

    // Обработка успешного входа...

  } catch (error) {
    alert('Ошибка сети или сервера. Попробуйте позже.');
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
