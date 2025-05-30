
async function loadProfile() {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  
  if (!userId) {
    showNotification("Пожалуйста, войдите в систему", "error");
    return;
  }

  // Обновляем информацию о пользователе
  const profileInfo = document.getElementById('profileInfo');
  if (profileInfo) {
    profileInfo.innerHTML = `
      <div class="user-info">
        <h3>👤 Добро пожаловать!</h3>
        <p><strong>Email:</strong> ${username || 'Не указан'}</p>
        <p><strong>ID:</strong> ${userId}</p>
      </div>
    `;
  }

  // Загружаем историю заказов
  await loadOrderHistory();
}

async function loadOrderHistory() {
  const userId = localStorage.getItem('userId');
  
  if (!userId) return;

  try {
    const response = await fetch(`/api/orders/${userId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const orders = await response.json();
      displayOrderHistory(orders);
    } else {
      console.error('Ошибка загрузки заказов:', response.status);
      displayOrderHistory([]);
    }
  } catch (error) {
    console.error('Ошибка при загрузке истории заказов:', error);
    displayOrderHistory([]);
  }
}

function displayOrderHistory(orders) {
  const orderHistoryDiv = document.getElementById('orderHistory');
  
  if (!orderHistoryDiv) return;

  if (!orders || orders.length === 0) {
    orderHistoryDiv.innerHTML = `
      <div class="no-orders">
        <h3>📋 История заказов</h3>
        <p>У вас пока нет заказов</p>
        <p>Сделайте свой первый заказ!</p>
      </div>
    `;
    return;
  }

  let historyHTML = '<h3>📋 История заказов</h3>';
  
  orders.forEach((order, index) => {
    const orderDate = new Date(order.createdAt).toLocaleString('ru-RU');
    
    historyHTML += `
      <div class="order-item">
        <div class="order-header">
          <div>
            <strong>Заказ #${orders.length - index}</strong>
            <div class="order-date">${orderDate}</div>
          </div>
          <div class="order-status">✅ Выполнен</div>
        </div>
        
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item-product">
              • ${item.name} x${item.quantity} - ${item.price * item.quantity}₽
            </div>
          `).join('')}
        </div>
        
        <div class="order-info">
          ${order.customerName ? `<p><strong>Имя:</strong> ${order.customerName}</p>` : ''}
          ${order.phone ? `<p><strong>Телефон:</strong> ${order.phone}</p>` : ''}
          ${order.address ? `<p><strong>Адрес:</strong> ${order.address}</p>` : ''}
        </div>
        
        <div class="order-total">
          Итого: ${order.total}₽
        </div>
      </div>
    `;
  });

  orderHistoryDiv.innerHTML = historyHTML;
}

// Функция выхода из системы
async function logout() {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      // Очищаем localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('accessToken');

      showNotification("👋 Вы успешно вышли из системы", "success");

      // Закрываем профиль
      closeProfile();

      // Возвращаем кнопку "Войти"
      updateProfileButtonToLogin();

      // Очищаем корзину (если нужно)
      if (window.clearCart) {
        window.clearCart();
      }

    } else {
      throw new Error('Ошибка выхода');
    }
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    showNotification("Произошла ошибка при выходе", "error");
  }
}

function closeProfile() {
  const profileSidebar = document.getElementById("profileSidebar");
  const profileOverlay = document.getElementById("profileOverlay");
  
  if (profileSidebar) profileSidebar.classList.remove("open");
  if (profileOverlay) profileOverlay.style.display = "none";
  document.body.style.overflow = "";
}

function updateProfileButtonToLogin() {
  const profileButton = document.getElementById("profileButton");
  if (profileButton) {
    profileButton.textContent = "🔑 Войти";
    profileButton.id = "loginButton";
    
    const newButton = profileButton.cloneNode(true);
    profileButton.parentNode.replaceChild(newButton, profileButton);
    
    newButton.addEventListener("click", (e) => {
      e.preventDefault();
      const loginModal = document.getElementById("loginModal");
      const modalOverlay = document.getElementById("modalOverlay");
      
      if (loginModal) loginModal.style.display = "block";
      if (modalOverlay) modalOverlay.style.display = "block";
    });
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
  const closeProfileSidebar = document.getElementById('closeProfileSidebar');
  const profileOverlay = document.getElementById('profileOverlay');
  const logoutButton = document.getElementById('logoutButton');

  if (closeProfileSidebar) {
    closeProfileSidebar.addEventListener('click', closeProfile);
  }

  if (profileOverlay) {
    profileOverlay.addEventListener('click', closeProfile);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
});

// Экспортируем функции для использования в других файлах
window.loadProfile = loadProfile;
window.loadOrderHistory = loadOrderHistory;
window.logout = logout;
