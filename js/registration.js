const registerForm = document.getElementById('registrationForm');
registerForm.addEventListener('submit', registerUser);

function registerUser(event) {
    event.preventDefault(); // Останавливаем стандартное поведение формы

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Регистрация успешна!');
        } else {
            alert('Ошибка: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
    });
}
