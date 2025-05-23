async function loadProfile() {
  const email = localStorage.getItem("username") || "demo@example.com";

  const ordersHTML = `
    <div class="order-item">
      <p><strong>Дата:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Сумма:</strong> 999 ₽</p>
      <div class="order-items">
        <div class="order-item-product">Big Burger × 2</div>
        <div class="order-item-product">Coca-Cola × 1</div>
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
