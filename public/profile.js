document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("accessToken");

  // Проверка наличия токена, но без перенаправления
  if (!accessToken) {
    console.log("Токен не найден, пользователь не авторизован.");
    // Вместо перенаправления, например, показать форму входа:
    document.getElementById("loginForm").style.display = "block"; // Покажите форму входа
  } else {
    loadProfile(); // Если токен есть, загружаем профиль
  }
});

async function loadProfile() {
  const userId = localStorage.getItem("userId");

  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("accessToken")}` // Используем токен для авторизации
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
    loadOrderHistory(data.orders); // Загружаем историю заказов
  } else {
    alert("Ошибка при загрузке данных профиля.");
  }
}



async function loadOrderHistory(orderIds) {
  const orderHistoryContainer = document.getElementById('orderHistory');

  // Проходим по каждому заказу и загружаем его данные
  for (const orderId of orderIds) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}` // Используем токен для авторизации
        }
      });

      const orderData = await response.json();
      if (response.ok) {
        // Отображаем данные заказа
        const orderElement = document.createElement('li');
        orderElement.textContent = `Заказ №${orderData._id} - Общая сумма: ${orderData.total}₽`;
        orderHistoryContainer.appendChild(orderElement);
      } else {
        console.error("Ошибка при загрузке заказа:", orderData.message);
      }
    } catch (error) {
      console.error("Ошибка при загрузке заказа:", error);
    }
  }
}
