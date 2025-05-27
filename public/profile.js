async function loadProfile() {
  // Получаем userId (авторизованного или временного)
  const userId = localStorage.getItem('userId') || localStorage.getItem('tempUserId');

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
      const response = await fetch(`https://fastfoodmania-api.onrender.com/api/orders/${userId}`);
      if (!response.ok) throw new Error('Ошибка сервера');
      const orders = await response.json();
      ordersHTML = generateOrdersHtml(orders);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      ordersHTML = '<p>Ошибка загрузки заказов.</p>';
    }
  }

  profileContent.innerHTML = ordersHTML;
}

// Вспомогательная функция для генерации HTML заказов
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
        <div class="order-item">
          <p><strong>Дата:</strong> ${date}</p>
          <p><strong>Адрес:</strong> ${order.address || 'Не указан'}</p>
          <p><strong>Телефон:</strong> ${order.phone || 'Не указан'}</p>
          <p><strong>Товары:</strong></p>
          <ul>${itemsList}</ul>
          <p><strong>Итого:</strong> ${order.total} ₽</p>
        </div>
      `;
    }).join('')}
  `;
}



// В начале функции loadProfile()
const userId = localStorage.getItem('userId');

// Заменить блок с ordersHTML на:
let ordersHTML = '';
if (userId === 'fakeUser') {
  const orders = JSON.parse(localStorage.getItem('fakeUserOrders') || []);
  ordersHTML = generateOrdersHtml(orders);
} else {
  try {
    const response = await fetch(`https://fastfoodmania-api.onrender.com/api/orders/${userId}`);
    const orders = await response.json();
    ordersHTML = generateOrdersHtml(orders);
  } catch (err) {
    ordersHTML = '<p>Ошибка загрузки заказов</p>';
  }
}

// Добавить новую функцию в конец файла:
function generateOrdersHtml(orders) {
  return orders.length > 0 ? orders.map(order => `
    <div class="order-item">
      <p><strong>Дата:</strong> ${new Date(order.date || order.createdAt).toLocaleString()}</p>
      <p><strong>Сумма:</strong> ${order.total} ₽</p>
      <div class="order-items">
        ${order.items.map(i => `<div>${i.name} × ${i.quantity}</div>`).join('')}
      </div>
    </div>
  `).join('') : '<p>Нет заказов</p>';
}

