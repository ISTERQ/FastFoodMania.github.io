document.addEventListener('DOMContentLoaded', () => {
    // Навигация по секциям
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href');

            // Скрываем все секции
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });

            // Показываем целевую секцию
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Навигация по категориям меню
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // Убираем активный класс у всех кнопок
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Скрываем все категории меню
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });

            // Показываем выбранную категорию
            const targetCategory = document.getElementById(category);
            if (targetCategory) {
                targetCategory.classList.add('active');
            }
        });
    });

    // Добавление в корзину
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.menu-card');
            const id = card.getAttribute('data-id');
            const name = card.getAttribute('data-name');
            const price = parseInt(card.getAttribute('data-price'));

            addToCart({ id, name, price });
        });
    });

    // Функция добавления в корзину
    function addToCart(item) {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        updateCartDisplay();
        saveCart();

        // Показываем уведомление
        showNotification(`${item.name} добавлен в корзину!`);
    }

    // Обновление отображения корзины
    function updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Сохранение корзины в localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Показ уведомления
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Модальные окна
    const modals = document.querySelectorAll('.modal');
    const overlay = document.getElementById('modalOverlay');
    const profileOverlay = document.getElementById('profileOverlay');

    // Открытие модального окна входа
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                // Если пользователь уже вошел, показываем профиль
                openProfile();
            } else {
                // Иначе показываем форму входа
                openModal('loginModal');
            }
        });
    }

    // Открытие корзины
    const cartButton = document.getElementById('cartButton');
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            openCartModal();
        });
    }

    // Функция открытия модального окна
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && overlay) {
            modal.style.display = 'block';
            overlay.style.display = 'block';
        }
    }

    // Функция закрытия модального окна
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && overlay) {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }
    }

    // Обработчики закрытия модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
            if (overlay) overlay.style.display = 'none';
        });
    });

    // Закрытие при клике на overlay
    if (overlay) {
        overlay.addEventListener('click', () => {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
            overlay.style.display = 'none';
        });
    }

    // Переключение между формами входа и регистрации
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');

    if (showRegister && showLogin && loginForm && registrationForm) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registrationForm.style.display = 'block';
        });

        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registrationForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // Открытие корзины
    function openCartModal() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartItems || !cartTotal) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Корзина пуста</p>';
            cartTotal.textContent = 'Итого: 0 ₽';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity('${item.id}', 1)">+</button>
                    </div>
                    <span>${item.price * item.quantity} ₽</span>
                    <button onclick="removeFromCart('${item.id}')" class="remove-btn">×</button>
                </div>
            `).join('');

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = `Итого: ${total} ₽`;
        }

        openModal('cartModal');
    }

    // Глобальные функции для работы с корзиной
    window.changeQuantity = function(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCartDisplay();
                saveCart();
                openCartModal(); // Обновляем отображение
            }
        }
    };

    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartDisplay();
        saveCart();
        openCartModal(); // Обновляем отображение
    };

    // Оформление заказа
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }

            closeModal('cartModal');
            openOrderModal();
        });
    }

    // Открытие модального окна заказа
    function openOrderModal() {
        const orderSummary = document.getElementById('orderSummary');
        if (orderSummary) {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            orderSummary.innerHTML = `
                <h3>Ваш заказ:</h3>
                ${cart.map(item => `
                    <div class="order-item">
                        ${item.name} × ${item.quantity} = ${item.price * item.quantity} ₽
                    </div>
                `).join('')}
                <div class="order-total"><strong>Итого: ${total} ₽</strong></div>
            `;
        }

        openModal('orderModal');
    }

    // Подтверждение заказа
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('customerName').value;
            const phone = document.getElementById('customerPhone').value;
            const address = document.getElementById('customerAddress').value;

            const userId = localStorage.getItem('userId') || generateTempUserId();
            const orderData = {
                userId,
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                customerName: name,
                phone,
                address,
                date: new Date().toISOString()
            };

            try {
                const response = await fetch('https://fastfoodmania-api.onrender.com/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                if (response.ok) {
                    // Сохраняем заказ локально для fakeUser
                    if (userId === 'fakeUser' || userId.startsWith('temp_')) {
                        const localOrders = JSON.parse(localStorage.getItem('fakeUserOrders') || '[]');
                        localOrders.push(orderData);
                        localStorage.setItem('fakeUserOrders', JSON.stringify(localOrders));
                    }

                    alert('Заказ успешно оформлен!');
                    cart = [];
                    updateCartDisplay();
                    saveCart();
                    closeModal('orderModal');
                } else {
                    throw new Error('Ошибка сервера');
                }
            } catch (error) {
                console.error('Ошибка при оформлении заказа:', error);

                // Локальное сохранение в случае ошибки
                const localOrders = JSON.parse(localStorage.getItem('fakeUserOrders') || '[]');
                localOrders.push(orderData);
                localStorage.setItem('fakeUserOrders', JSON.stringify(localOrders));

                alert('Заказ сохранен локально!');
                cart = [];
                updateCartDisplay();
                saveCart();
                closeModal('orderModal');
            }
        });
    }

    // Генерация временного ID пользователя
    function generateTempUserId() {
        return 'temp_' + Math.random().toString(36).substr(2, 9);
    }

    // Профиль
    function openProfile() {
        const profileSidebar = document.getElementById('profileSidebar');
        const profileOverlay = document.getElementById('profileOverlay');

        if (profileSidebar && profileOverlay) {
            profileSidebar.classList.add('open');
            profileOverlay.style.display = 'block';

            if (window.loadProfile) {
                window.loadProfile();
            }
        }
    }

    // Закрытие профиля
    const closeProfile = document.getElementById('closeProfile');
    if (closeProfile) {
        closeProfile.addEventListener('click', () => {
            const profileSidebar = document.getElementById('profileSidebar');
            const profileOverlay = document.getElementById('profileOverlay');

            if (profileSidebar && profileOverlay) {
                profileSidebar.classList.remove('open');
                profileOverlay.style.display = 'none';
            }
        });
    }

    // Закрытие профиля при клике на overlay
    if (profileOverlay) {
        profileOverlay.addEventListener('click', () => {
            const profileSidebar = document.getElementById('profileSidebar');
            if (profileSidebar) {
                profileSidebar.classList.remove('open');
                profileOverlay.style.display = 'none';
            }
        });
    }

    // Выход из аккаунта
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userId');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');

            // Возвращаем кнопку входа
            const profileButton = document.getElementById('profileButton');
            if (profileButton) {
                profileButton.textContent = 'Войти';
                profileButton.id = 'loginButton';

                // Добавляем обработчик для кнопки входа
                profileButton.addEventListener('click', () => {
                    openModal('loginModal');
                });
            }

            // Закрываем профиль
            const profileSidebar = document.getElementById('profileSidebar');
            const profileOverlay = document.getElementById('profileOverlay');

            if (profileSidebar && profileOverlay) {
                profileSidebar.classList.remove('open');
                profileOverlay.style.display = 'none';
            }

            alert('Вы вышли из аккаунта');
        });
    }

    // Проверяем при загрузке, если пользователь уже вошел
    const userId = localStorage.getItem('userId');
    if (userId) {
        updateLoginButtonToProfile();
    }

    // Функция обновления кнопки входа на профиль
    function updateLoginButtonToProfile() {
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.textContent = 'Профиль';
            loginButton.id = 'profileButton';

            // Удаляем старые обработчики и добавляем новый
            const newButton = loginButton.cloneNode(true);
            loginButton.parentNode.replaceChild(newButton, loginButton);

            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                openProfile();
            });
        }
    }

    // Экспортируем функцию для использования в других файлах
    window.updateLoginButtonToProfile = updateLoginButtonToProfile;

    // Инициализация корзины при загрузке
    updateCartDisplay();
});

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
  let cartData = JSON.parse(localStorage.getItem('cartData')) || {};
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
let cartData = JSON.parse(localStorage.getItem('cartData')) || {};
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
let cartData = {}; // Хранит элементы корзины

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
        addToCartOld({
            id: currentItem.id,
            name: currentItem.name,
            price: currentItem.price,
            quantity: quantity
        });
    }
});

function addToCartOld(item) {
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
            removeFromCartOld(itemId);
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
            removeFromCartOld(itemId);
        } else {
            itemCount += quantityChange;
            updateCartText();
            updateCartUI();
        }
    }
}

function removeFromCartOld(itemId) {
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
            observer.unobserve(entry.target); // Убираем наблюдение послеявления
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

// Функция расчета общей суммы
function calculateTotal() {
    return Object.values(cartData).reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Клик по кнопке "Оформить заказ"
  document.getElementById('checkoutButton').addEventListener('click', () => {
      if (Object.keys(cartData).length === 0) {
          alert('Корзина пуста!');
          return;
      }

      // Показываем форму заказа
      const orderModal = document.getElementById('orderFormModal');
      if (orderModal) {
          orderModal.style.display = 'block';
      }
  });

  // Обработка формы заказа
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
      orderForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          const name = document.getElementById('orderName').value;
          const phone = document.getElementById('orderPhone').value;
          const address = document.getElementById('orderAddress').value;

          // Подготавливаем данные заказа
          const orderData = {
              items: Object.values(cartData),
              total: calculateTotal(),
              customerInfo: { name, phone, address },
              userId: localStorage.getItem('userId') || 'guest_' + Date.now()
          };

          // Показываем подтверждение
          alert(`Заказ оформлен!\nИмя: ${name}\nТелефон: ${phone}\nАдрес: ${address}\nСумма: ${calculateTotal()} ₽`);

          // Очищаем корзину
          Object.keys(cartData).forEach(key => delete cartData[key]);
          updateCartDisplay();

          // Закрываем модальные окна
          document.getElementById('orderFormModal').style.display = 'none';
          closeCartModal();

          // Очищаем форму
          orderForm.reset();
      });
  }

  // Закрытие формы заказа
  const closeOrderForm = document.getElementById('closeOrderForm');
  if (closeOrderForm) {
      closeOrderForm.addEventListener('click', () => {
          document.getElementById('orderFormModal').style.display = 'none';
      });
  }

// Клик по кнопке "Оформить заказ"
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
