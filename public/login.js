const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const data = { email, password };

  try {
    const response = await fetch('https://fastfoodmania-github-io.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include' // если сервер использует куки для сессий
    });

    const result = await response.json();

    if (response.ok) {
      alert("Вход выполнен!");

      // Здесь можешь сохранить токен или данные пользователя по необходимости
      // Например:
      // localStorage.setItem('accessToken', result.accessToken);
      // localStorage.setItem('userId', result.userId);

      // Закрываем окно входа
      document.getElementById('loginModal').style.display = 'none';
      document.getElementById('modalOverlay').style.display = 'none';

      // Обновить интерфейс — показать профиль и т.п.
      updateLoginButtonToProfile();

    } else {
      alert("Ошибка входа: " + (result.message || "Неверные данные"));
    }
  } catch (err) {
    console.error('Ошибка при входе:', err);
    alert('Ошибка при входе. Проверьте соединение и попробуйте снова.');
  }
});

function updateLoginButtonToProfile() {
  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.textContent = 'Профиль';
    loginButton.id = 'profileButton';

    // Переключаем обработчики событий, если нужно
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
