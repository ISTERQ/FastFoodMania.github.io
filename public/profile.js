
async function loadProfile() {
  const email = localStorage.getItem("userEmail");
  const password = localStorage.getItem("password");

  const isDemoUser = email === "test@gmail.com" && password === "testtesttest";

  const ordersHTML = isDemoUser ? `
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
  ` : `<p>Нет заказов</p>`;

  document.getElementById('profileContent').innerHTML = `
    <div class="profile-info">
      <h3>👋 Привет, ${email || "гость"}!</h3>
      <p>📧 Email: ${email}</p>
    </div>
    <div class="order-history">
      <h4>📦 История заказов:</h4>
      ${ordersHTML}
    </div>
  `;
}
