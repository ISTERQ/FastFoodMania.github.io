const registerForm = document.getElementById('registrationForm');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  // Валидация
  if (!username || !email || !password) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  const data = { username, email, password };

  try {
    // ИСПРАВЛЕН URL - используем API сервер, а не GitHub Pages
    const response = await fetch('https://fastfoodmania-api.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      // Автоматически логиним пользователя после регистрации
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("username", result.username);

      alert("Регистрация успешна! Добро пожаловать!");

      // Закрываем модальное окно
      document.getElementById('loginModal').style.display = 'none';
      document.getElementById('modalOverlay').style.display = 'none';

      // Обновляем кнопку на "Профиль"
      updateLoginButtonToProfile();

    } else {
      alert("Ошибка: " + result.message);
    }
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Ошибка при регистрации. Проверьте подключение к интернету.');
  }
});
