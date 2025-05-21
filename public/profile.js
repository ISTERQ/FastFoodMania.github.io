async function loadProfile() {
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");

  try {
    const response = await fetch(`/api/users/${userId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const ordersHTML = data.orders && data.orders.length > 0 
        ? data.orders.map(order => `
            <div class="order-item">
              <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Сумма:</strong> ${order.total} ₽</p>
              <div class="order-items">
                ${order.items.map(item => `
                  <div class="order-item-product">
                    ${item.name} × ${item.quantity}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')
        : '<p>У вас пока нет заказов</p>';

      document.getElementById('profileContent').innerHTML = `
        <div class="profile-info">
          <h3>👋 Привет, ${data.username}!</h3>
          <p>📧 Email: ${data.email}</p>
        </div>
        <div class="order-history">
          <h4>📦 История заказов:</h4>
          ${ordersHTML}
        </div>
      `;
    }
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    alert('Ошибка при загрузке данных');
  }
}
