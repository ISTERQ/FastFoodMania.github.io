document.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    alert("Пожалуйста, войдите в систему.");
    window.location.href = "/login"; // Перенаправление на страницу входа
  } else {
    // Если пользователь авторизован, показываем профиль
    loadProfile();
  }
});

async function loadProfile() {
  const userId = localStorage.getItem("userId");

  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
    }
  });

  const data = await response.json();
  if (response.ok) {
    // Отображаем данные профиля
    document.getElementById('profileContent').innerHTML = `
      <h3>Привет, ${data.username}!</h3>
      <p>Email: ${data.email}</p>
      <p>Город: ${data.city}</p>
    `;
  } else {
    alert("Ошибка при загрузке данных профиля.");
  }
}
