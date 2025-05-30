const registerForm = document.getElementById('registrationForm');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('https://fastfoodmania-api.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Регистрация успешна! Теперь войдите в свой аккаунт.');

      // Переключение на форму входа
      document.getElementById('registrationForm').style.display = 'none';
      document.getElementById('loginForm').style.display = 'block';

      // Подставляем email в форму входа для удобства
      document.getElementById('loginEmail').value = email;
    } else {
      alert('Ошибка регистрации: ' + (data.message || 'Попробуйте позже'));
    }
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    alert('Ошибка при регистрации. Проверьте соединение и попробуйте снова.');
  }
});
