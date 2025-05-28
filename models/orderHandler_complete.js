// Обработчик заказов для интеграции с существующим кодом

// Функция для создания заказа
async function createOrder(orderData) {
  try {
    const { userId, items, total, phone, address, customerName } = orderData;
    
    console.log('Отправка заказа:', { userId, items, total, phone, address, customerName });

    const response = await fetch('https://fastfoodmania-api.onrender.com/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        items,
        total,
        phone: phone || '',
        address: address || '',
        customerName: customerName || ''
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Заказ успешно создан:', result);
      
      // Сохраняем заказ локально для fakeUser
      if (userId === 'fakeUser') {
        const orders = JSON.parse(localStorage.getItem('fakeUserOrders') || '[]');
        orders.push({
          date: new Date().toISOString(),
          items,
          total,
          phone,
          address,
          customerName,
          createdAt: new Date()
        });
        localStorage.setItem('fakeUserOrders', JSON.stringify(orders));
      }
      
      return { success: true, data: result };
    } else {
      console.error('Ошибка создания заказа:', result);
      return { success: false, error: result.message };
    }
    
  } catch (error) {
    console.error('Ошибка сети при создании заказа:', error);
    return { success: false, error: 'Ошибка сети' };
  }
}

// Функция для обработки оформления заказа
async function handleOrderSubmission() {
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    alert('Необходимо войти в аккаунт для оформления заказа');
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
    return;
  }

  // Проверяем корзину
  const cartData = window.cartData || {};
  if (Object.keys(cartData).length === 0) {
    alert('Корзина пуста!');
    return;
  }

  // Показываем форму оформления заказа
  showOrderForm();
}

// Функция отображения формы заказа
function showOrderForm() {
  const orderFormModal = document.getElementById('orderFormModal');
  const modalOverlay = document.getElementById('modalOverlay');
  
  if (orderFormModal) {
    orderFormModal.style.display = 'block';
    modalOverlay.style.display = 'block';
  }
}

// Обработчик отправки формы заказа
async function processOrderForm(event) {
  event.preventDefault();
  
  const userId = localStorage.getItem('userId');
  const cartData = window.cartData || {};
  
  // Получаем данные из формы
  const customerName = document.getElementById('orderName').value;
  const phone = document.getElementById('orderPhone').value;
  const address = document.getElementById('orderAddress').value;
  
  // Формируем массив товаров
  const items = Object.values(cartData).map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));
  
  // Считаем общую сумму
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Создаем заказ
  const orderResult = await createOrder({
    userId,
    items,
    total,
    phone,
    address,
    customerName
  });
  
  if (orderResult.success) {
    alert('Заказ успешно оформлен!');
    
    // Очищаем корзину
    if (window.clearCart) {
      window.clearCart();
    }
    if (window.updateCartUI) {
      window.updateCartUI();
    }
    
    // Закрываем модальное окно
    document.getElementById('orderFormModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    
    // Обновляем профиль если он открыт
    if (window.loadProfile) {
      window.loadProfile();
    }
    
  } else {
    alert('Ошибка при оформлении заказа: ' + orderResult.error);
  }
}

// Инициализация обработчиков при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Обработчик формы заказа
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', processOrderForm);
  }
  
  // Обработчик кнопки закрытия формы заказа
  const closeOrderForm = document.getElementById('closeOrderForm');
  if (closeOrderForm) {
    closeOrderForm.addEventListener('click', function() {
      document.getElementById('orderFormModal').style.display = 'none';
      document.getElementById('modalOverlay').style.display = 'none';
    });
  }
});

// Экспортируем функции для использования в других файлах
window.handleOrderSubmission = handleOrderSubmission;
window.createOrder = createOrder;