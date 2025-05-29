// auth.js - Единая система управления авторизацией
class AuthManager {
  constructor() {
    this.baseURL = 'https://fastfoodmania-api.onrender.com';
    this.init();
  }

  init() {
    // Проверяем состояние авторизации при загрузке
    document.addEventListener('DOMContentLoaded', () => {
      this.checkAuthState();
      this.setupFormSwitching();
      this.setupModalHandlers();
    });
  }

  // Проверка состояния авторизации
  checkAuthState() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.updateUIToLoggedIn();
    }
  }

  // Настройка переключения форм
  setupFormSwitching() {
    const showLoginForm = document.getElementById('showLoginForm');
    const showRegistrationForm = document.getElementById('showRegistrationForm');

    if (showLoginForm) {
      showLoginForm.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginForm();
      });
    }

    if (showRegistrationForm) {
      showRegistrationForm.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegistrationForm();
      });
    }

    // Настройка обработчиков форм
    this.setupLoginForm();
    this.setupRegistrationForm();
  }

  // Показать форму входа
  showLoginForm() {
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
  }

  // Показать форму регистрации
  showRegistrationForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'block';
  }

  // Настройка формы входа
  setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin(e);
      });
    }
  }

  // Обработка входа
  async handleLogin(e) {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем данные пользователя
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username || email);
        localStorage.setItem('userEmail', email);

        alert('Вход выполнен успешно!');
        
        // Закрываем модальное окно
        this.closeModal();
        
        // Обновляем интерфейс
        this.updateUIToLoggedIn();

      } else {
        alert('Ошибка входа: ' + (data.message || 'Неверные данные'));
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      
      // Fallback - локальный режим для тестирования
      localStorage.setItem('accessToken', 'fakeToken');
      localStorage.setItem('userId', 'fakeUser');
      localStorage.setItem('username', email);
      
      alert('Вход выполнен в локальном режиме!');
      this.closeModal();
      this.updateUIToLoggedIn();
    }
  }

  // Настройка формы регистрации
  setupRegistrationForm() {
    const registerForm = document.getElementById('registrationForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleRegistration(e);
      });
    }
  }

  // Обработка регистрации
  async handleRegistration(e) {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Регистрация успешна! Теперь войдите в свой аккаунт.');
        
        // Переключаемся на форму входа
        this.showLoginForm();
        
        // Подставляем email в форму входа
        document.getElementById('loginEmail').value = email;
      } else {
        alert('Ошибка: ' + result.message);
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Ошибка при регистрации.');
    }
  }

  // Обновление интерфейса для залогиненного пользователя
  updateUIToLoggedIn() {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
      loginButton.textContent = 'Профиль';
      loginButton.id = 'profileButton';
      
      // Удаляем старые обработчики
      const newButton = loginButton.cloneNode(true);
      loginButton.parentNode.replaceChild(newButton, loginButton);
      
      // Добавляем новый обработчик
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.openProfile();
      });
    }
  }

  // Открытие профиля
  openProfile() {
    document.getElementById('profileSidebar').classList.add('open');
    document.getElementById('profileOverlay').style.display = 'block';
    if (window.loadProfile) {
      window.loadProfile();
    }
  }

  // Настройка обработчиков модальных окон
  setupModalHandlers() {
    // Кнопка "Войти" в навигации
    const loginButton = document.getElementById('loginButton');
    if (loginButton && !localStorage.getItem('userId')) {
      loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    }

    // Кнопка закрытия модального окна
    const closeButton = document.getElementById('closeLoginModal');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this
