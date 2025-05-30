// Функция загрузки профиля пользователя
async function loadProfile() {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const profileContent = document.getElementById('profileContent');
  
  if (!profileContent) {
    console.error('Элемент profileContent не найден');
    return;
  }

  if (!userId) {
    profileContent.innerHTML = `
      <div class="profile-error">
        <p>Пользователь не авторизован</p>
        <button onclick="closeProfileSidebar()">Закрыть</button>
      </div>
    `;
    return;
  }

  // Показываем загрузку
  profileContent.innerHTML = `
    <div class="profile-loading">
      <p>Загрузка профиля...</p>
    </div>
  `;

  try {
    // Загружаем заказы пользователя
    const response = await fetch(`https://fastfoodmania-api.onrender.com/orders/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const orders = await response.json();
    
    // Генерируем HTML профиля
    const profileHTML = generateProfileHTML(username, orders);
    profileContent.innerHTML = profileHTML;

  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    
    profileContent.innerHTML = `
      <div class="profile-error">
        <h3>Добро пожаловать, ${username || 'Пользователь'}!</h3>
        <p>Не удалось загрузить историю заказов</p>
        <p>Ошибка: ${error.message}</p>
        <button onclick="loadProfile()" class="retry-btn">Попробовать снова</button>
      </div>
    `;
  }
}

// Функция генерации HTML профиля
function generateProfileHTML(username, orders) {
  const userInfo = `
    <div class="profile-header">
      <h3>Добро пожаловать, ${username}!</h3>
      <button onclick="logout()" class="logout-btn">Выйти из аккаунта</button>
    </div>
  `;

  if (!orders || orders.length === 0) {
    return userInfo + `
      <div class="no-orders">
        <h4>История заказов</h4>
        <p>У вас пока нет заказов</p>
        <p>Оформите первый заказ, чтобы увидеть его здесь!</p>
      </div>
    `;
  }

  const ordersHTML = orders.map(order => {
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsList = order.items.map(item => 
      `<li class="order-item-detail">
        ${item.name} × ${item.quantity} 
        <span class="item-price">${(item.price * item.quantity)} ₽</span>
      </li>`
    ).join('');

    const statusClass = getStatusClass(order.status);
    const statusText = getStatusText(order.status);

    return `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">Заказ #${order._id.slice(-6)}</span>
          <span class="order-status ${statusClass}">${statusText}</span>
        </div>
        
        <div class="order-date">
          <strong>Дата:</strong> ${formattedDate}
        </div>
        
        ${order.address ? `<div class="order-address"><strong>Адрес:</strong> ${order.address}</div>` : ''}
        ${order.phone ? `<div class="order-phone"><strong>Телефон:</strong> ${order.phone}</div>` : ''}
        
        <div class="order-items">
          <strong>Состав заказа:</strong>
          <ul class="items-list">${itemsList}</ul>
        </div>
        
        <div class="order-total">
          <strong>Итого: ${order.total} ₽</strong>
        </div>
      </div>
    `;
  }).join('');

  return userInfo + `
    <div class="orders-section">
      <h4>История заказов (${orders.length})</h4>
      <div class="orders-list">
        ${ordersHTML}
      </div>
    </div>
  `;
}

// Функция получения класса статуса
function getStatusClass(status) {
  const statusClasses = {
    'pending': 'status-pending',
    'confirmed': 'status-confirmed',
    'preparing': 'status-preparing',
    'ready': 'status-ready',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  };
  return statusClasses[status] || 'status-default';
}

// Функция получения текста статуса
function getStatusText(status) {
  const statusTexts = {
    'pending': 'Ожидает подтверждения',
    'confirmed': 'Подтвержден',
    'preparing': 'Готовится',
    'ready': 'Готов к выдаче',
    'delivered': 'Доставлен',
    'cancelled': 'Отменен'
  };
  return statusTexts[status] || 'Неизвестный статус';
}

// Функция закрытия профиля
function closeProfileSidebar() {
  const profileSidebar = document.getElementById('profileSidebar');
  const profileOverlay = document.getElementById('profileOverlay');
  
  if (profileSidebar) {
    profileSidebar.classList.remove('open');
  }
  
  if (profileOverlay) {
    profileOverlay.style.display = 'none';
  }
  
  // Возвращаем прокрутку body
  document.body.style.overflow = '';
}

// Обработчики событий для профиля
document.addEventListener('DOMContentLoaded', function() {
  // Кнопка закрытия профиля
  const closeButton = document.getElementById('closeProfileSidebar');
  if (closeButton) {
    closeButton.addEventListener('click', closeProfileSidebar);
  }

  // Клик по оверлею для закрытия
  const profileOverlay = document.getElementById('profileOverlay');
  if (profileOverlay) {
    profileOverlay.addEventListener('click', (event) => {
      if (event.target === profileOverlay) {
        closeProfileSidebar();
      }
    });
  }

  // Закрытие по клавише Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const profileSidebar = document.getElementById('profileSidebar');
      if (profileSidebar && profileSidebar.classList.contains('open')) {
        closeProfileSidebar();
      }
    }
  });
});

// Экспортируем функции для использования в других файлах
window.loadProfile = loadProfile;
window.closeProfileSidebar = closeProfileSidebar;
