const registerForm = document.getElementById('registrationForm');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  const data = { username, email, password };

  try {
    // ИСПРАВЛЕН URL
    const response = await fetch('https://fastfoodmania-api.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      // Сохраняем данные для автоматического входа
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("username", username);

      alert("Регистрация успешна!");
      
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
    alert('Ошибка при регистрации.');
  }
});
