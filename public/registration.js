const registerForm = document.getElementById('registrationForm');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const data = { username, email, password };

    try {
        const response = await fetch('https://fastfoodmania-github-io.onrender.com/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Регистрация успешна!");
            document.getElementById('loginModal').style.display = 'none';
        } else {
            alert("Ошибка: " + result.message);
        }
    } catch (err) {
        console.error('Ошибка:', err);
        alert('Ошибка при регистрации.');
    }
});
