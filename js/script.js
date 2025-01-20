document.addEventListener('DOMContentLoaded', () => {
  // Навигация по секциям
  document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      const headerOffset = 400; // Высота заголовка
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

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
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', function () {
      const foodName = this.querySelector('h4').innerText;
      const foodImage = this.querySelector('img').src;
      const foodPrice = this.querySelector('.price').innerText;
      const foodCalories = 'Калории: 500'; // Предполагаемая информация о калориях
      const foodDescription = this.querySelector('p').textContent;

      document.getElementById('modalName').innerText = foodName;
      document.getElementById('modalImage').src = foodImage;
      document.getElementById('modalPrice').innerText = foodPrice;
      document.getElementById('foodCalories').innerText = foodCalories;
      document.getElementById('modalDescription').innerText = foodDescription;

      openModal(modal); // Открытие модального окна с едой
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

  loginButton.addEventListener('click', function (event) {
    event.preventDefault();
    openModal(loginModal); // Открытие модального окна для входа/регистрации
  });

  closeLoginModal.addEventListener('click', function () {
    closeModal(loginModal);
  });

  showLoginForm.addEventListener('click', function (event) {
    event.preventDefault();
    registrationForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  showRegistrationForm.addEventListener('click', function (event) {
    event.preventDefault();
    loginForm.style.display = 'none';
    registrationForm.style.display = 'block';
  });

  // Обработка отправки форм
  [registrationForm, loginForm].forEach(form => {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const actionUrl = form.id === 'registrationForm' ? 'register.php' : 'login.php';
      const formData = new FormData(this);
      fetch(actionUrl, {
        method: 'POST',
        body: formData
      })
        .then(response => response.text())
        .then(data => {
          alert(data);
          closeModal(loginModal);
          form.reset();
        })
        .catch(error => console.error('Ошибка:', error));
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
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
});

document.addEventListener('DOMContentLoaded', function() {
  const cartButton = document.getElementById('cartButton');
  const cart = document.getElementById('cart');

  cartButton.addEventListener('click', function(event) {
      event.preventDefault(); // Предотвращаем переход по ссылке
      cart.classList.toggle('show'); // Переключаем класс show для отображения корзины
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const cartButton = document.getElementById('cartButton');
  const cartOverlay = document.getElementById('cartOverlay');
  const cart = document.getElementById('cart');
  const closeCart = document.getElementById('closeCart');

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
});


document.addEventListener('DOMContentLoaded', () => {
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
});


const cart = {};

function addToCart(item) {
    // Проверка, существует ли уже элемент в корзине
    if (cart[item.id]) {
        cart[item.id].quantity += item.quantity; // Увеличиваем количество
    } else {
        cart[item.id] = { ...item, quantity: item.quantity }; // Добавляем новый элемент
    }
    updateCartUI();
}

function updateCartUI() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.getElementById('totalPrice');
    cartItemsContainer.innerHTML = ''; // Очищаем существующие элементы

    let total = 0;
    for (const itemId in cart) {
        const item = cart[itemId];
        const itemTotal = item.price * item.quantity; // Подсчет стоимости каждого блюда
        total += itemTotal;
        
        // Создание элемента для корзины
        const itemElement = document.createElement('div');
        itemElement.textContent = `${item.name} x${item.quantity} - ${itemTotal}`;
        cartItemsContainer.appendChild(itemElement);
    }

    // Обновление общего значения
    totalPriceElement.textContent = `Всего: ${total}`; // Обновление текста на кнопке
    document.getElementById('cartEmptyMessage').style.display = total > 0 ? 'none' : 'block'; // Прятать сообщение о пустой корзине
}

const menuItems = [
  { id: 'burger1', name: 'Mexican Burger', price: 350 },
  { id: 'burger2', name: 'Double Burger', price: 350 },
  { id: 'burger3', name: 'California Burger', price: 350 },
  { id: 'burger4', name: 'Mini Burger', price: 350 },
  { id: 'burger5', name: 'Classic Burger', price: 350 },
  { id: 'burger6', name: 'Chicken Burger', price: 350 },
  // Добавьте сюда остальные блюда
];

document.getElementById('addToCart').addEventListener('click', function() {
  const quantity = parseInt(document.getElementById('foodQuantity').value); // Получаем количество из инпута
  const menuItem = menuItems.find(item => item.id === 'burger1'); // Пример для одного блюда
  if (menuItem) {
      addToCart({
          id: menuItem.id, // Используем реальный ID блюда
          name: menuItem.name,
          price: menuItem.price,
          quantity: quantity
      });
  }
});