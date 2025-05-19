document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`https://fastfoodmania-api.onrender.com/api/users/${userId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
    credentials: "include" // если нужен доступ к cookie (на случай future updates)
  });

  const data = await res.json();

  if (res.ok) {
    document.getElementById("profileContent").innerHTML = `
      <h3>Привет, ${data.username}</h3>
      <p>Email: ${data.email}</p>
      <h4>Заказы:</h4>
      ${data.orders.map(order => `
        <div>
          <strong>${new Date(order.createdAt).toLocaleString()}</strong>
          <ul>${order.items.map(item => `<li>${item.name} × ${item.quantity}</li>`).join('')}</ul>
          <p>Итого: ${order.total} ₽</p>
        </div>
      `).join('')}
    `;
  } else {
    alert(data.message || "Ошибка загрузки профиля");
  }
});
