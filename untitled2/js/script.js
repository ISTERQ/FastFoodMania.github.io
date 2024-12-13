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
