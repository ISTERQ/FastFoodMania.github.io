async function loadProfile() {
  const userId = localStorage.getItem("userId") || localStorage.getItem("tempUserId");
  const profileContent = document.getElementById('profileContent');
  
  if (!userId) {
    profileContent.innerHTML = '<p>Пользователь не найден. Пожалуйста, войдите в систему.</p>';
    return;
  }

  let ordersHTML = '';

  if (userId === 'fakeUser') {
    // Загружаем заказы из localStorage для fakeUser
    const orders = JSON.parse(localStorage.getItem('fakeUserOrders') || '[]');
    ordersHTML = generateOrdersHtml(orders);
  } else {
    // Запрос к серверу для обычного пользователя
    try {
      console.log("Загрузка заказов для пользователя:", userId);
      const response = await fetch(`https://fastfoodmania-api.onrender.com/api/orders/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const orders = await response.json();
      console.log("Получены заказы:", orders);
      ordersHTML = generateOrdersHtml(orders);
      
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      ordersHTML = '<p>Ошибка загрузки заказов. Попробуйте позже.</p>';
    }
  }

  profileContent.innerHTML = ordersHTML;
}

// Функция для генерации HTML заказов
function generateOrdersHtml(orders) {
  if (!orders || orders.length === 0) {
    return '<p>У вас пока нет заказов.</p>';
  }

  return `
    <h3>История заказов:</h3>
    ${orders.map(order => {
      const date = new Date(order.date || order.createdAt).toLocaleString();
      const itemsList = order.items.map(item =>
        `<li>${item.name} × ${item.quantity} (${item.price * item.quantity} ₽)</li>`
      ).join('');

      return `
        <div class="order-item" style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; background: #f9f9f9;">
          <p><strong>Дата:</strong> ${date}</p>
          ${order.address ? `<p><strong>Адрес:</strong> ${order.address}</p>` : ''}
          ${order.phone ? `<p><strong>Телефон:</strong> ${order.phone}</p>` : ''}
          ${order.customerName ? `<p><strong>Имя:</strong> ${order.customerName}</p>` : ''}
          <p><strong>Товары:</strong></p>
          <ul style="margin-left: 20px;">${itemsList}</ul>
          <p><strong>Итого:</strong> ${order.total} ₽</p>
        </div>
      `;
    }).join('')}
  `;
}

// Экспортируем функцию для использования в других файлах
window.loadProfile = loadProfile;
