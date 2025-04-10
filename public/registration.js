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
      alert("Регистрация успешна! Теперь войдите в свой аккаунт.");

      // Переключение на форму входа
      document.getElementById('registrationForm').style.display = 'none';
      document.getElementById('loginForm').style.display = 'block';

      // Подставляем email в форму входа
      document.getElementById('loginEmail').value = email;
    } else {
      alert("Ошибка: " + result.message);
    }
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Ошибка при регистрации.');
  }
});
