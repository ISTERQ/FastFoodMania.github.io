async function loadProfile() {
  const email = localStorage.getItem("username");

  if (email !== "test@gmail.com") {
    document.getElementById('profileContent').innerHTML = "<p>Доступ разрешён только для demo пользователя.</p>";
    return;
  }

  const ordersHTML = `
    <div class="order-item">
      <p><strong>Дата:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Сумма:</strong> 1450 ₽</p>
      <div class="order-items">
        <div class="order-item-product">Chicken Burger × 3</div>
        <div class="order-item-product">Pepperoni Pizza × 1</div>
        <div class="order-item-product">Coca-Cola × 2</div>
        <div class="order-item-product">Cheese Toast × 1</div>
      </div>
    </div>
  `;

  document.getElementById('profileContent').innerHTML = `
    <div class="profile-info">
      <h3>👋 Привет, DemoUser!</h3>
      <p>📧 Email: ${email}</p>
    </div>
    <div class="order-history">
      <h4>📦 История заказов:</h4>
      ${ordersHTML}
    </div>
  `;
}
