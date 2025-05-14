const registerForm = document.getElementById('registrationForm');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  const data = { username, email, password };

  try {
    const response = await fetch('https://fastfoodmania-api.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      // Сохраняем токен и userId в localStorage
      localStorage.setItem("accessToken", result.accessToken); // Сохраняем токен
      localStorage.setItem("userId", result.userId); // Сохраняем userId

      // Перенаправляем пользователя на страницу профиля
      alert("Регистрация успешна! Добро пожаловать!");
      window.location.href = "/profile"; // Перенаправление на профиль
    } else {
      alert("Ошибка: " + result.message);
    }
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Ошибка при регистрации.');
  }
});
