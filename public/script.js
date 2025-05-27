document.addEventListener('DOMContentLoaded', () => {
    // Навигация по секциям (обновленный код)
    document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
  
      if (!targetElement) return; // добавим защиту от пустых ссылок
  
      const header = document.querySelector('header');
      const headerOffset = header.offsetHeight;
  
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset
        - headerOffset
        - (window.innerHeight / 2.5)
        + (targetElement.offsetHeight / 2);
  
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
});  
document.addEventListener('DOMContentLoaded', () => {
  const profileButton = document.getElementById('profileButton');
  const profileSidebar = document.getElementById('profileSidebar');
  const profileOverlay = document.getElementById('profileOverlay');
  const closeProfileSidebar = document.getElementById('closeProfileSidebar');
  const logoutButton = document.getElementById('logoutButton');

  // Открытие панели профиля
  profileButton.addEventListener('click', () => {
    profileSidebar.classList.add('open');
    profileOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  // Закрытие профиля по клику на оверлей
  profileOverlay.addEventListener('click', () => {
    profileSidebar.classList.remove('open');
    profileOverlay.style.display = 'none';
    document.body.style.overflow = '';
  });

  // Закрытие профиля по кнопке "Закрыть"
  if (closeProfileSidebar) {
    closeProfileSidebar.addEventListener('click', () => {
      profileSidebar.classList.remove('open');
      profileOverlay.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  // Обработчик выхода
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      const userId = localStorage.getItem('userId');

      if (userId === 'fakeUser') {
        // Локальная очистка для фейкового пользователя
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('fakeUserOrders');

        clearCart();    // Ваша функция очистки корзины
        updateCartUI(); // Ваша функция обновления UI корзины
        loadProfile();  // Ваша функция загрузки профиля

        alert('Вы вышли из аккаунта');

        // Переключение кнопки "Профиль" обратно в "Войти"
        const loginButton = document.getElementById('profileButton');
        if (loginButton) {
          loginButton.textContent = 'Войти';
          loginButton.id = 'loginButton';

          // Удаляем все предыдущие обработчики, чтобы избежать дублирования
          loginButton.replaceWith(loginButton.cloneNode(true));
          const newLoginButton = document.getElementById('loginButton');
          newLoginButton.addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'block';
            document.getElementById('modalOverlay').style.display = 'block';
          });
        }

        // Закрываем профиль и затемнение
        profileSidebar.classList.remove('open');
        profileOverlay.style.display = 'none';
        document.body.style.overflow = '';

      } else {
        // Для реальных пользователей - запрос на сервер
        try {
          const response = await fetch('https://fastfoodmania-api.onrender.com/logout', {
            method: 'POST',
            credentials: 'include'
          });
          if (!response.ok) throw new Error(`Ошибка выхода: ${response.status}`);

          localStorage.clear();
          alert('Вы вышли из аккаунта');
          location.reload();
        } catch (err) {
          console.error('Ошибка при выходе:', err);
          alert('Не удалось выйти. Попробуйте позже.');
        }
      }
    });
  }
});


  // Модальные окна
  const modal = document.getElementById('foodModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const loginModal = document.getElementById('loginModal');

  function openModal(modalToOpen) {
      if (modalToOpen === modal) {
          document.getElementById('foodQuantity').value = 1; // Сбрасываем количество блюд на 1
      }
      modalToOpen.style.display = 'block';
      modalOverlay.style.display = 'block';
  }

  function closeModal(modalToClose) {
      modalToClose.style.display = 'none';
      if (modalToClose === modal || modalToClose === loginModal) {
          modalOverlay.style.display = 'none'; // Скрыть затемнение при закрытии
      }
  }

  // Открытие модального окна при клике на карточки меню
  let currentItem = null; // Хранит текущее выбранное блюдо
  document.querySelectorAll('.menu-card').forEach((card, index) => {
      card.setAttribute('data-id', `item${index + 1}`);
      card.addEventListener('click', function() {
          currentItem = {
              id: this.getAttribute('data-id'),
              name: this.querySelector('h4').innerText,
              price: parseInt(this.querySelector('.price').innerText.replace("Цена: ", "")),
              description: this.querySelector('p').textContent,
              image: this.querySelector('img').src
          };

          document.getElementById('modalName').innerText = currentItem.name;
          document.getElementById('modalImage').src = currentItem.image;
          document.getElementById('modalPrice').innerText = currentItem.price + ' ₽';
          document.getElementById('foodCalories').innerText = 'Калории: 500'; 
          document.getElementById('modalDescription').innerText = currentItem.description;

          openModal(modal); // Открытие модального окна с пищей
      });
  });

  // Закрытие модального окна по клику на "закрыть" или вне окна
  document.querySelector('.close').addEventListener('click', function() {
      closeModal(modal);
  });

  window.onclick = function(event) {
      if (event.target === modalOverlay) {
          closeModal(modal);
      } else if (event.target === loginModal) {
          closeModal(loginModal);
      }
  };

  // Логин/Регистрация
  const loginButton = document.getElementById('loginButton');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginForm = document.getElementById('loginForm');
  const registrationForm = document.getElementById('registrationForm');
  const showLoginForm = document.getElementById('showLoginForm');
  const showRegistrationForm = document.getElementById('showRegistrationForm');

  loginButton.addEventListener('click', function(event) {
      event.preventDefault();
      openModal(loginModal); // Открытие модального окна для входа/регистрации
  });

  closeLoginModal.addEventListener('click', function() {
      closeModal(loginModal);
  });

  showLoginForm.addEventListener('click', function(event) {
      event.preventDefault();
      registrationForm.style.display = 'none';
      loginForm.style.display = 'block';
  });

  showRegistrationForm.addEventListener('click', function(event) {
      event.preventDefault();
      loginForm.style.display = 'none';
      registrationForm.style.display = 'block';
  });



  // Корзина
  const cartButton = document.getElementById('cartButton');
  const cartOverlay = document.getElementById('cartOverlay');
  const cart = document.getElementById('cart');
  const closeCart = document.getElementById('closeCart');
  const cartItemsContainer = document.querySelector('.cart-items');
  const totalPriceElement = document.getElementById('totalPrice');
  const itemCountElement = document.getElementById('itemCount');
  const cartEmptyMessage = document.getElementById('cartEmptyMessage');

  let itemCount = 0; // Исходное количество элементов в корзине
  const cartData = {}; // Хранит элементы корзины

  cartButton.addEventListener('click', () => {
      cart.style.right = '0'; // Открываем корзину
      cartOverlay.style.display = 'block'; // Показываем затемненный фон
  });

  closeCart.addEventListener('click', () => {
      cart.style.right = '-40%'; // Закрываем корзину
      cartOverlay.style.display = 'none'; // Скрываем затемненный фон
  });

  cartOverlay.addEventListener('click', () => {
      cart.style.right = '-40%'; // Закрываем корзину
      cartOverlay.style.display = 'none'; // Скрываем затемненный фон
  });

  document.getElementById('addToCart').addEventListener('click', function() {
      const quantity = parseInt(document.getElementById('foodQuantity').value);
      if (currentItem) {
          addToCart({
              id: currentItem.id,
              name: currentItem.name,
              price: currentItem.price,
              quantity: quantity
          });
      }
  });

  function addToCart(item) {
      if (cartData[item.id]) {
          cartData[item.id].quantity += item.quantity; // Увеличиваем количество, если элемент уже в корзине
      } else {
          cartData[item.id] = { ...item }; // Добавляем новый элемент с его данными
      }
      itemCount += item.quantity; // Обновляем общее количество
      updateCartText(); // Обновляем текст корзины
      updateCartUI(); // Обновляем интерфейс корзины
  }

  function updateCartUI() {
      cartItemsContainer.innerHTML = ''; // Очищаем содержимое корзины
      let total = 0; // Инициализируем общую стоимость

      for (const itemId in cartData) {
          const item = cartData[itemId];
          const itemTotal = item.price * item.quantity; // Рассчитываем общую стоимость для каждого элемента
          total += itemTotal; // Обновляем общую стоимость

          // Создаем элемент для корзины и добавляем его в контейнер
          const itemElement = document.createElement('div');
          itemElement.className = 'cart-item';
          itemElement.innerHTML = `
              <div class="cart-item-info">
                  <strong>${item.name}</strong>
                  <span class="cart-item-price">- ${itemTotal} ₽</span>
                  <div class="cart-item-controls">
                      <button class="quantity-button decrease" data-id="${itemId}">-</button>
                      <input type="number" value="${item.quantity}" class="quantity-input" data-id="${itemId}" min="1" />
                      <button class="quantity-button increase" data-id="${itemId}">+</button>
                  </div>
              </div>
              <span class="remove-item" data-id="${itemId}">×</span>
          `;

          // Добавляем элемент в контейнер
          cartItemsContainer.appendChild(itemElement);
      }

      totalPriceElement.innerText = `Всего: ${total} ₽`; // Обновляем текст общей стоимости
      cartEmptyMessage.style.display = total > 0 ? 'none' : 'block'; // Показываем или скрываем сообщение о пустой корзине

      // Добавляем обработчики событий для новых кнопок "удалить"
      document.querySelectorAll('.remove-item').forEach(removeBtn => {
          removeBtn.addEventListener('click', () => {
              const itemId = removeBtn.dataset.id;
              removeFromCart(itemId);
          });
      });

      // Обработчики для кнопок увеличения и уменьшения количества
      document.querySelectorAll('.quantity-button').forEach(button => {
          button.addEventListener('click', () => {
              const itemId = button.dataset.id;
              const isIncrease = button.classList.contains('increase');
              updateItemQuantity(itemId, isIncrease);
          });
      });

      // Обработчик события для изменения количества через input
      document.querySelectorAll('.quantity-input').forEach(input => {
          input.addEventListener('change', () => {
              const itemId = input.dataset.id;
              const newQuantity = parseInt(input.value);
              if (newQuantity > 0) {
                  updateItemQuantity(itemId, newQuantity);
              }
          });
      });
  }

  function updateItemQuantity(itemId, newQuantity) {
      if (cartData[itemId]) {
          const quantityChange = (typeof newQuantity === 'boolean') ? (newQuantity ? 1 : -1) : (newQuantity - cartData[itemId].quantity);
          cartData[itemId].quantity += quantityChange;

          if (cartData[itemId].quantity <= 0) {
              removeFromCart(itemId);
          } else {
              itemCount += quantityChange;
              updateCartText();
              updateCartUI();
          }
      }
  }

  function removeFromCart(itemId) {
      if (cartData[itemId]) {
          itemCount -= cartData[itemId].quantity; // Уменьшаем общее количество
          delete cartData[itemId]; // Удаляем элемент из корзины
          
          // Обновляем визуальный индикатор количества элементов в корзине
          updateCartText();
          updateCartUI();
      }
  }

  function updateCartText() {
      itemCount = 0; // Сброс счетчика перед вычислением
      for (const itemId in cartData) {
          if (cartData[itemId]) {
              itemCount += cartData[itemId].quantity; // Суммируем все количества
          }
      }
      itemCountElement.innerText = itemCount; // Всегда отображаем количество
  }

  // Увеличение и уменьшение количества товара в модальном окне
  const decreaseButton = document.getElementById('decreaseQuantity');
  const increaseButton = document.getElementById('increaseQuantity');
  const quantityInput = document.getElementById('foodQuantity');

  decreaseButton.addEventListener('click', () => {
      let currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
      }
  });

  increaseButton.addEventListener('click', () => {
      let currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
  });

  // Обновление текста корзины при загрузке страницы
  updateCartText();

  // Анимация появления UI элементов
  const featureItems = document.querySelectorAll('.feature-item');

  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target); // Убираем наблюдение после появления
          }
      });
  });

  featureItems.forEach(item => {
      observer.observe(item); // Начинаем наблюдение за каждым элементом
  });

  // Добавляем обработчики для touch событий
  document.querySelectorAll('.menu-card').forEach(card => {
      card.addEventListener('touchstart', function() {
          // Обработка нажатия на карточку меню
          currentItem = {
              id: this.getAttribute('data-id'),
              name: this.querySelector('h4').innerText,
              price: parseInt(this.querySelector('.price').innerText.replace("Цена: ", "")),
              description: this.querySelector('p').textContent,
              image: this.querySelector('img').src
          };
          openModal(modal);
      });
  });

// Закрытие корзины вручную
function closeCartModal() {
    const cart = document.getElementById('cart');
    const cartOverlay = document.getElementById('cartOverlay');
    cart.style.right = '-40%';
    cartOverlay.style.display = 'none';
  }
  
  // Клик по кнопке "Оформить заказ"
  document.getElementById('checkoutButton').addEventListener('click', () => {
    const userId = localStorage.getItem("userId");
  
    if (!userId) {
      // ❗ Если пользователь не авторизован
      closeCartModal(); // ⬅️ Закрываем корзину
      document.getElementById('loginModal').style.display = 'block';
      document.getElementById('modalOverlay').style.display = 'block';
      return;
    }
  
    // ✅ Пользователь авторизован — показываем форму
    showOrderConfirmationForm();
  });
  
  // Показ формы подтверждения заказа
  function showOrderConfirmationForm() {
    document.getElementById('orderConfirmModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
  }
  
  // Закрытие формы подтверждения
  document.getElementById('closeOrderConfirm').addEventListener('click', () => {
    document.getElementById('orderConfirmModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
  });
  

// В файле script.js обновляем обработчик оформления заказа
document.getElementById('finalOrderForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  let userId = localStorage.getItem("userId");
  const isTempUser = !userId;

  // Генерируем временный ID если пользователь не авторизован
  if (isTempUser) {
    userId = `temp_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('tempUserId', userId);
  }

  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const items = Object.values(cartData);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const response = await fetch('https://fastfoodmania-api.onrender.com/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total,
        phone,
        address
      })
    });

    const result = await response.json();

    if (response.ok) {
      // Очистка корзины
      Object.keys(cartData).forEach(key => delete cartData[key]);
      itemCount = 0;
      updateCartText();
      updateCartUI();

      // Обновление профиля
      if (!isTempUser) {
        await loadProfile();
      }

      // Закрытие модальных окон
      document.getElementById('orderConfirmModal').style.display = 'none';
      document.getElementById('modalOverlay').style.display = 'none';

      // Уведомление об успехе
      showOrderSuccessNotification();

      // Для временных пользователей сохраняем заказ в localStorage
      if (isTempUser) {
        const tempOrders = JSON.parse(localStorage.getItem('tempOrders') || '[]');
        tempOrders.push(result);
        localStorage.setItem('tempOrders', JSON.stringify(tempOrders));
      }
    } else {
      alert("Ошибка: " + (result.message || "Не удалось оформить заказ"));
    }
  } catch (err) {
    console.error(err);
    alert("Произошла ошибка при оформлении заказа.");
  }
});

// Добавляем функцию для показа уведомления
function showOrderSuccessNotification() {
  const notification = document.createElement('div');
  notification.className = 'order-notification';
  notification.innerHTML = `
    <p>✅ Заказ успешно оформлен!</p>
    <p>Детали заказа сохранены в вашем профиле</p>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// В файле profile.js обновляем загрузку профиля
async function loadProfile() {
  let userId = localStorage.getItem("userId") || localStorage.getItem("tempUserId");
  if (!userId) return;

  try {
    // Загружаем заказы с сервера
    const serverOrders = await fetch(`https://fastfoodmania-api.onrender.com/api/orders/${userId}`)
      .then(res => res.json());

    // Загружаем временные заказы из localStorage
    const tempOrders = JSON.parse(localStorage.getItem('tempOrders') || '[]');

    // Объединяем заказы
    const allOrders = [...serverOrders, ...tempOrders];

    // Отображаем заказы
    const container = document.getElementById('profileContent');
    container.innerHTML = allOrders.map(order => `
      <div class="order-item">
        <p>Дата: ${new Date(order.createdAt).toLocaleString()}</p>
        <p>Сумма: ${order.total} ₽</p>
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-product">
              ${item.name} × ${item.quantity}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
  }
}

// В server.js добавляем обработчик для временных пользователей
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, total, phone, address } = req.body;

    // Для временных пользователей сохраняем в отдельную коллекцию
    if (userId.startsWith('temp_')) {
      const tempOrder = new TempOrder({
        userId,
        items,
        total,
        phone,
        address,
        createdAt: new Date()
      });
      await tempOrder.save();
    } else {
      // Для авторизованных пользователей
      const order = new Order({
        userId,
        items,
        total,
        phone,
        address,
        createdAt: new Date()
      });
      await order.save();
    }

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сохранения заказа' });
  }
});
// Генерация временного ID пользователя для неавторизованных пользователей
function generateTempUserId() {
  return 'temp_' + Math.random().toString(36).substr(2, 9);
}
async function openProfileModal() {
    document.getElementById('profileModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
  
    const userId = localStorage.getItem("userId");
    const container = document.getElementById('orderHistoryContainer');
    container.innerHTML = 'Загрузка...';
  
    try {
      const res = await fetch(`https://fastfoodmania-api.onrender.com/orders/${userId}`);
      const orders = await res.json();
  
      if (orders.length === 0) {
        container.innerHTML = '<p>У вас пока нет заказов.</p>';
        return;
      }
  
      container.innerHTML = orders.map(order => {
        const date = new Date(order.createdAt).toLocaleString();
        const itemsList = order.items.map(i => `${i.name} ×${i.quantity}`).join('<br>');
        return `
          <div style="border:1px solid #ccc; padding: 10px; margin-bottom: 15px; border-radius: 8px;">
            <strong>Дата:</strong> ${date}<br>
            <strong>Адрес:</strong> ${order.address}<br>
            <strong>Телефон:</strong> ${order.phone}<br>
            <strong>Заказ:</strong><br>${itemsList}<br>
            <strong>Сумма:</strong> ${order.total} ₽
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
      container.innerHTML = '<p>Ошибка загрузки заказов.</p>';
    }
  }
  
  document.getElementById('closeProfileModal').addEventListener('click', () => {
    document.getElementById('profileModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
});




document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    try {
      const response = await fetch("https://fastfoodmania-github-io.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.error || "Ошибка входа");
        return;
      }
  
      // Успешный вход
      localStorage.setItem("user", JSON.stringify(data));
      updateUIAfterLogin(data);
    } catch (err) {
      console.error(err);
      alert("Ошибка запроса");
    }
  });
  
  function updateUIAfterLogin(user) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("profile-button").style.display = "block";
    document.getElementById("profile-name").textContent = user.username;
    document.getElementById("profile-email").textContent = user.email;
}
  

// Создаём и добавляем модальное окно уведомления один раз
const orderSuccessModal = document.createElement('div');
orderSuccessModal.id = 'orderSuccessModal';
orderSuccessModal.style = `
  position: fixed;
  z-index: 2000;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  display: none;
  text-align: center;
`;
orderSuccessModal.innerHTML = `
  <p>Подробности заказа отправлены на вашу почту.</p>
  <button id="closeOrderSuccessBtn">Закрыть</button>
`;
document.body.appendChild(orderSuccessModal);

// Показать уведомление
function showOrderSuccessModal() {
  orderSuccessModal.style.display = 'block';
}

// Закрытие уведомления и очистка корзины
document.getElementById('closeOrderSuccessBtn').addEventListener('click', () => {
  orderSuccessModal.style.display = 'none';
  clearCart();
  updateCartUI();
  closeCartModal();
  loadProfile();  // Обновляем профиль после очистки корзины
});

// Очистка корзины
function clearCart() {
  for (const key in cartData) {
    if (cartData.hasOwnProperty(key)) {
      delete cartData[key];
    }
  }
  itemCount = 0;
  updateCartText();
}






async function loadOrderHistory() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
  
    const apiUrl = 'https://fastfoodmania-api.onrender.com/api/orders/'; // Новый API адрес (используется в первую очередь)
  
    try {
      // Пробуем запросить данные с нового API
      const response = await fetch(`${apiUrl}${userId}`);
      const orders = await response.json();
  
      const container = document.getElementById("profileContent");
      if (!orders.length) {
        container.innerHTML = "<p>Заказов пока нет.</p>";
        return;
      }
  
      container.innerHTML = orders.map(order => {
        const itemsHtml = order.items.map(i =>
          `<li>${i.name} — ${i.quantity} шт. (${i.price}₽)</li>`
        ).join("");
  
        return `
          <div class="order-block">
            <h4>Заказ от ${new Date(order.createdAt).toLocaleString()}</h4>
            <ul>${itemsHtml}</ul>
            <p><strong>Итого:</strong> ${order.total}₽</p>
          </div>
        `;
      }).join("");
    } catch (error) {
      console.error("Ошибка загрузки заказов с основного API:", error);
  
      // Если ошибка с основным API, пробуем старый URL
      try {
        const oldApiUrl = 'https://fastfoodmania-github-io.onrender.com/api/orders/';
        const response = await fetch(`${oldApiUrl}${userId}`);
        const orders = await response.json();
  
        const container = document.getElementById("profileContent");
        if (!orders.length) {
          container.innerHTML = "<p>Заказов пока нет.</p>";
          return;
        }
  
        container.innerHTML = orders.map(order => {
          const itemsHtml = order.items.map(i =>
            `<li>${i.name} — ${i.quantity} шт. (${i.price}₽)</li>`
          ).join("");
  
          return `
            <div class="order-block">
              <h4>Заказ от ${new Date(order.createdAt).toLocaleString()}</h4>
              <ul>${itemsHtml}</ul>
              <p><strong>Итого:</strong> ${order.total}₽</p>
            </div>
          `;
        }).join("");
      } catch (error) {
        console.error("Ошибка загрузки заказов с резервного API:", error);
        document.getElementById("profileContent").innerHTML = "<p>Ошибка при загрузке.</p>";
      }
    }
  }
  
async function loadOrderHistory() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const response = await fetch('/api/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        const orders = await response.json();
        if (response.ok) {
            displayOrders(orders);
        } else {
            alert("Ошибка при загрузке истории заказов");
        }
    } catch (error) {
        console.error('Ошибка при получении истории заказов:', error);
        alert("Произошла ошибка при загрузке данных.");
    }
}

function displayOrders(orders) {
    const profileContent = document.getElementById('profileContent');
    if (orders.length === 0) {
        profileContent.innerHTML = '<p>У вас нет заказов.</p>';
        return;
    }

    profileContent.innerHTML = '<h3>История заказов:</h3>';
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');
        orderElement.innerHTML = `
            <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Сумма:</strong> ${order.total} ₽</p>
            <ul>
                ${order.items.map(item => `<li>${item.name} - ${item.quantity} x ${item.price} ₽</li>`).join('')}
            </ul>
        `;
        profileContent.appendChild(orderElement);
    });
}



document.getElementById('checkoutButton').addEventListener('click', () => {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    // Пользователь не вошёл — открыть окно логина
    closeCartModal();
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
    return;
  }

  if (userId === 'fakeUser') {
    // Сохраняем заказ в локальное хранилище
    saveOrderToProfile();

    // Показываем окно с уведомлением
    showOrderSuccessModal();

    // Закрываем корзину
    closeCartModal();

    return;
  }

  // Для реальных пользователей — обычное оформление
  showOrderConfirmationForm();
});


// Новая функция показа подтверждения заказа
function showOrderConfirmation() {
  const orderItems = Object.values(cartData).map(item => 
    `${item.name} × ${item.quantity} — ${item.price * item.quantity} ₽`
  ).join('<br>');
  
  const total = Object.values(cartData).reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  document.getElementById('orderSummary').innerHTML = `
    <p><strong>Ваш заказ:</strong></p>
    ${orderItems}
    <hr>
    <p><strong>Итого:</strong> ${total} ₽</p>
    <p>Данные о заказе будут отправлены на email: ${localStorage.getItem('username')}</p>
  `;
  
  openModal(document.getElementById('orderConfirmModal'));
}

// Обработчик фейкового подтверждения
document.getElementById('fakeConfirmButton').addEventListener('click', () => {
  closeModal(document.getElementById('orderConfirmModal'));
  alert('Заказ успешно оформлен! На вашу почту отправлено подтверждение.');
  // Очищаем корзину
  Object.keys(cartData).forEach(key => delete cartData[key]);
  itemCount = 0;
  updateCartUI();
  updateCartText();
});

// Обновим функцию закрытия модальных окон
window.onclick = function(event) {
  const modals = [modal, loginModal, document.getElementById('orderConfirmModal')];
  modals.forEach(modal => {
    if (event.target === modal || event.target === modalOverlay) {
      closeModal(modal);
    }
  });
};


// Код для обработки кнопки оформления заказа
// Вставьте в конец script.js после описания корзины и логики модальных окон
document.addEventListener('DOMContentLoaded', function() {
  // Селекторы элементов модальных окон и кнопок
  const loginModal = document.getElementById('loginModal');
  const orderModal = document.getElementById('orderConfirmModal');
  const overlay = document.getElementById('modalOverlay');
  const orderSummary = document.getElementById('orderSummary');
  const confirmBtn = document.getElementById('fakeConfirmButton');
  // Кнопка оформления (замените селектор на свой, если отличается)
  const orderBtn = document.getElementById('placeOrderBtn');

  // Проверяем наличие необходимых элементов
  if (!loginModal || !orderModal || !overlay || !orderSummary || !confirmBtn) {
    console.warn('Не найдены элементы модального окна или кнопки подтверждения заказа');
  }
  if (!orderBtn) {
    console.warn('Не найдена кнопка оформления заказа (проверьте селектор)');
    return;
  }

  // Обработчик клика по кнопке оформления заказа
  orderBtn.addEventListener('click', function() {
    const userId = localStorage.getItem('userId'); // проверка авторизации
    if (!userId) {
      // Пользователь не вошёл — открыть окно входа
      loginModal.style.display = 'block';
      overlay.style.display = 'block';
      return;
    }
    // Пользователь вошёл — подготовка и отображение окна подтверждения
    let cartData = JSON.parse(localStorage.getItem('cartData')) || []; // данные корзины
    orderSummary.innerHTML = ''; // очищаем блок обзора заказа
    let total = 0;
    // Заполняем обзор заказа данными из корзины
    cartData.forEach(item => {
      const name = item.name || item.title || 'Блюдо';
      const qty = item.quantity || item.count || 1;
      const price = item.price || item.cost || 0;
      const sum = qty * price;
      total += sum;
      const row = `<p>${name} x ${qty} — ${sum} руб.</p>`;
      orderSummary.insertAdjacentHTML('beforeend', row);
    });
    // Добавляем итоговую сумму
    const totalRow = `<p><strong>Итого: ${total} руб.</strong></p>`;
    orderSummary.insertAdjacentHTML('beforeend', totalRow);
    // Показываем окно подтверждения и оверлей
    orderModal.style.display = 'block';
    overlay.style.display = 'block';
  });

  // Обработчик на кнопку подтверждения заказа в модалке
  confirmBtn.addEventListener('click', function() {
    alert('Ваш заказ успешно отправлен! Все детали отправлены вам на почту');
    // Закрываем модальное окно и оверлей
    orderModal.style.display = 'none';
    overlay.style.display = 'none';
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const loginModal = document.getElementById('loginModal');
  const orderModal = document.getElementById('orderConfirmModal');
  const overlay = document.getElementById('modalOverlay');
  const orderSummary = document.getElementById('orderSummary');
  const confirmBtn = document.getElementById('fakeConfirmButton');
  const orderBtn = document.getElementById('checkoutButton');

  function closeOrderModal() {
    orderModal.style.display = 'none';
    overlay.style.display = 'none';
  }

  orderBtn.addEventListener('click', () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      // Не залогинен — открыть окно входа
      loginModal.style.display = 'block';
      overlay.style.display = 'block';
      return;
    }

    // Пользователь залогинен — формируем заказ
    if (Object.keys(cartData).length === 0) {
      alert('Корзина пуста!');
      return;
    }

    let html = '';
    let total = 0;
    for (const key in cartData) {
      const item = cartData[key];
      const qty = item.quantity;
      const price = item.price;
      const sum = qty * price;
      total += sum;
      html += `<p>${item.name} × ${qty} — ${sum} ₽</p>`;
    }
    html += `<p><strong>Итого: ${total} ₽</strong></p>`;
    html += `<p style="margin-top: 15px; font-style: italic;">Все данные по заказу отправлены на вашу почту.</p>`;

    orderSummary.innerHTML = html;

    orderModal.style.display = 'block';
    overlay.style.display = 'block';
  });

  confirmBtn.addEventListener('click', () => {
    alert('Ваш заказ успешно отправлен! Все детали отправлены вам на почту.');
    closeOrderModal();
  });

  // Закрытие модалки по крестику
  const closeConfirmBtn = document.getElementById('closeOrderConfirm');
  closeConfirmBtn.addEventListener('click', () => {
    closeOrderModal();
  });
});



function saveOrderToProfile() {
  // Получаем текущие заказы из localStorage или пустой массив
  let orders = JSON.parse(localStorage.getItem('fakeUserOrders') || '[]');

  // Формируем массив текущих блюд из корзины
  const items = Object.values(cartData).map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price
  }));

  // Считаем итоговую сумму
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Добавляем новый заказ с текущей датой
  orders.push({
    date: new Date().toISOString(),
    items,
    total
  });

  // Сохраняем обратно в localStorage
  localStorage.setItem('fakeUserOrders', JSON.stringify(orders));
}


