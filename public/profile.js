function loadProfile() {
  const email = localStorage.getItem("username") || "гость";
  const userId = localStorage.getItem('userId');

  let ordersHTML = '<p>Нет заказов</p>';

  if (userId === 'fakeUser') {
    const orders = JSON.parse(localStorage.getItem('fakeUserOrders') || '[]');
    if (orders.length > 0) {
      ordersHTML = orders.map(order => {
        const dateStr = new Date(order.date).toLocaleString();
        const itemsList = order.items.map(i => `<div>${i.name} × ${i.quantity}</div>`).join('');
        return `
          <div class="order-item" style="margin-bottom:15px; padding:10px; border:1px solid #ccc; border-radius:10px;">
            <p><strong>Дата:</strong> ${dateStr}</p>
            <p><strong>Сумма:</strong> ${order.total} ₽</p>
            <div class="order-items">${itemsList}</div>
          </div>
        `;
      }).join('');
    }
  } else {
    // Для реальных пользователей, если есть, загрузка заказов с сервера
    ordersHTML = '<p>Загрузка заказов...</p>';
  }

  document.getElementById('profileContent').innerHTML = `
    <div class="profile-info">
      <h3>👋 Привет, ${email}!</h3>
      <p>📧 Email: ${email}</p>
    </div>
    <div class="order-history">
      <h4>📦 История заказов:</h4>
      ${ordersHTML}
    </div>
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
