document.addEventListener('DOMContentLoaded', () => {
// Навигация по секциям (обновленный код)
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // Динамически получаем высоту заголовка
        const header = document.querySelector('header');
        const headerOffset = header.offsetHeight; 
        
        // Расчет позиции для центрирования
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset 
            - headerOffset // Учет высоты заголовка
            - (window.innerHeight / 2.5) // Центрирование по вертикали
            + (targetElement.offsetHeight / 2); // Учет высоты элемента

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
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
});
