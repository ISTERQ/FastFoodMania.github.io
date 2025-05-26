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
