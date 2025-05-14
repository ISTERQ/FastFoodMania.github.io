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

      // Скрываем форму регистрации и показываем профиль
      document.getElementById("registrationForm").style.display = "none";
      document.getElementById("profileSidebar").style.display = "block"; // Показываем профиль
      loadProfile(); // Загружаем данные профиля

      alert("Регистрация успешна! Добро пожаловать!");
    } else {
      alert("Ошибка: " + result.message);
    }
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Ошибка при регистрации.');
  }
});
