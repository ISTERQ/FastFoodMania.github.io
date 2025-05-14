// В profile.js
document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    alert("Пожалуйста, войдите в систему.");
    window.location.href = "/login"; // Перенаправление на страницу входа
  } else {
    loadProfile();
  }
});

async function loadProfile() {
  const userId = localStorage.getItem("userId");

  // Запрос на сервер для получения данных пользователя
  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
    }
  });

  const data = await response.json();
  if (response.ok) {
    // Отображаем данные профиля
    document.getElementById('profileContent').innerHTML = `
      <h3>Привет, ${data.username}!</h3>
      <p>Email: ${data.email}</p>
      <p>Город: ${data.city}</p>
      <h4>История заказов:</h4>
      <ul id="orderHistory"></ul>
    `;
    loadOrderHistory(data.orders); // Загрузим историю заказов
  } else {
    alert("Ошибка при загрузке данных профиля.");
  }
}

async function loadOrderHistory(orderIds) {
  const orderHistoryContainer = document.getElementById('orderHistory');

  for (const orderId of orderIds) {
    const response = await fetch(`/api/orders/${orderId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      }
    });

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
