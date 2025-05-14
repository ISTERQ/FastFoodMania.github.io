document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("accessToken");

  // Проверка, есть ли токен в localStorage
  if (!accessToken) {
    // Если нет токена, показываем форму входа
    document.getElementById("loginForm").style.display = "block";
  } else {
    // Если есть токен, показываем выдвижной профиль
    document.getElementById("profileSidebar").style.display = "block";
    loadProfile(); // Загрузка данных профиля
  }

  // Обработчик отправки формы входа
  const loginForm = document.querySelector('#loginForm form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const response = await fetch('https://fastfoodmania-api.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
        credentials: "include" // Для обеспечения передачи cookie (если нужно)
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем токен и userId в localStorage
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", email);

        // Закрытие модального окна входа и отображение профиля
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById("profileSidebar").style.display = "block"; // Показываем профиль
        loadProfile(); // Загружаем данные профиля

        alert("Вход выполнен!");
      } else {
        alert(data.message || "Ошибка входа.");
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Ошибка при входе.');
    }
  });

  // Обработчик для закрытия профиля
  document.getElementById("closeProfileSidebar").addEventListener("click", () => {
    document.getElementById("profileSidebar").style.display = "none";
  });
});

// Функция для загрузки профиля
async function loadProfile() {
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");

  // Запрос на сервер для получения данных профиля
  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  if (response.ok) {
    document.getElementById('profileContent').innerHTML = `
      <h3>Привет, ${data.username}!</h3>
      <p>Email: ${data.email}</p>
      <p>Город: ${data.city}</p>
      <h4>История заказов:</h4>
      <ul id="orderHistory"></ul>
    `;
    loadOrderHistory(data.orders); // Загружаем историю заказов
  } else {
    alert("Ошибка при загрузке данных профиля.");
  }
}

// Функция для загрузки истории заказов
async function loadOrderHistory(orderIds) {
  const orderHistoryContainer = document.getElementById('orderHistory');
  
  for (const orderId of orderIds) {
    const response = await fetch(`/api/orders/${orderId}`);
    const orderData = await response.json();
    
    if (response.ok) {
      const orderElement = document.createElement('li');
      orderElement.textContent = `Заказ №${orderData._id} - Общая сумма: ${orderData.total}₽`;
      orderHistoryContainer.appendChild(orderElement);
    } else {
      console.error("Ошибка при загрузке заказа:", orderData.message);
    }
  }
}
