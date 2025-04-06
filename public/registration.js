const registerForm = document.getElementById('registrationForm');
registerForm.addEventListener('submit', registerUser);

function registerUser(event) {
    event.preventDefault(); // Остановите стандартное поведение формы

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    // Формируем данные для отправки
    const data = { username, email, password };

    // Отправляем данные на сервер
    fetch('https://fastfoodmania-github-io.onrender.com/api/register', { // Используйте правильный URL вашего сервера
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Регистрация успешна!'); // Успешная регистрация
        } else {
            alert('Ошибка: ' + data.message); // Ошибка регистрации
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
    });
}

document.getElementById('registrationForm').addEventListener('submit', registerUser);
