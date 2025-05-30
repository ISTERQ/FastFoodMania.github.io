
document.addEventListener('DOMContentLoaded', () => {
    // Навигация по секциям
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                event.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const header = document.querySelector('header');
                    const headerOffset = header.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Слайдшоу
    let slideIndex = 0;
    const slides = document.getElementsByClassName("mySlides");
    
    function showSlides() {
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove("active");
        }
        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        slides[slideIndex - 1].classList.add("active");
        setTimeout(showSlides, 4000);
    }
    
    if (slides.length > 0) {
        showSlides();
    }

    // Анимация появления элементов
    const featureItems = document.querySelectorAll('.feature-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    });

    featureItems.forEach(item => {
        observer.observe(item);
    });

    // Модальные окна
    const modal = document.getElementById('foodModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const loginModal = document.getElementById('loginModal');
    const orderConfirmModal = document.getElementById('orderConfirmModal');

    function openModal(modalToOpen) {
        if (modalToOpen === modal) {
            document.getElementById('foodQuantity').value = 1;
        }
        modalToOpen.style.display = 'block';
        if (modalOverlay) {
            modalOverlay.style.display = 'block';
        }
    }

    function closeModal(modalToClose) {
        modalToClose.style.display = 'none';
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    }

    // Открытие модального окна при клике на карточки меню
    let currentItem = null;
    document.querySelectorAll('.menu-card').forEach((card, index) => {
        card.setAttribute('data-id', `item${index + 1}`);
        card.addEventListener('click', function() {
            currentItem = {
                id: this.getAttribute('data-id'),
                name: this.querySelector('h4').innerText,
                price: parseInt(this.querySelector('.price').innerText.replace("Цена: ", "")),
                description: this.querySelector('p:not(.price)').textContent,
                image: this.querySelector('img').src
            };

            document.getElementById('modalName').innerText = currentItem.name;
            document.getElementById('modalImage').src = currentItem.image;
            document.getElementById('modalPrice').innerText = currentItem.price + ' ₽';
            document.getElementById('modalDescription').innerText = currentItem.description;

            openModal(modal);
        });
    });

    // Закрытие модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modalToClose = this.closest('.modal');
            closeModal(modalToClose);
        });
    });

    // Закрытие по клику на оверлей
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function() {
            closeModal(modal);
            closeModal(loginModal);
            closeModal(orderConfirmModal);
        });
    }

    // Логин/Регистрация
    const loginButton = document.getElementById('loginButton');
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    const showLoginForm = document.getElementById('showLoginForm');
    const showRegistrationForm = document.getElementById('showRegistrationForm');

    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
            event.preventDefault();
            openModal(loginModal);
        });
    }

    if (showLoginForm) {
        showLoginForm.addEventListener('click', function(event) {
            event.preventDefault();
            registrationForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    if (showRegistrationForm) {
        showRegistrationForm.addEventListener('click', function(event) {
            event.preventDefault();
            loginForm.style.display = 'none';
            registrationForm.style.display = 'block';
        });
    }

    // Регистрация
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            // Симуляция регистрации
            localStorage.setItem('user', JSON.stringify({
                username: username,
                email: email,
                id: 'local_' + Date.now()
            }));

            alert('Регистрация успешна! Теперь войдите в свой аккаунт.');
            registrationForm.style.display = 'none';
            loginForm.style.display = 'block';
            document.getElementById('loginEmail').value = email;
        });
    }

    // Вход
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('loginEmail').value;
            
            // Симуляция входа
            localStorage.setItem('currentUser', JSON.stringify({
                email: email,
                id: 'local_' + Date.now()
            }));

            alert('Вход выполнен!');
            closeModal(loginModal);
            updateUIAfterLogin();
        });
    }

    // Обновление UI после входа
    function updateUIAfterLogin() {
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.textContent = 'Профиль';
            loginButton.onclick = function(e) {
                e.preventDefault();
                openProfile();
            };
        }
    }

    // Профиль
    const profileSidebar = document.getElementById('profileSidebar');
    const profileOverlay = document.getElementById('profileOverlay');
    const closeProfileSidebar = document.getElementById('closeProfileSidebar');
    const logoutButton = document.getElementById('logoutButton');

    function openProfile() {
        profileSidebar.classList.add('open');
        profileOverlay.style.display = 'block';
        loadProfile();
    }

    function closeProfile() {
        profileSidebar.classList.remove('open');
        profileOverlay.style.display = 'none';
    }

    if (closeProfileSidebar) {
        closeProfileSidebar.addEventListener('click', closeProfile);
    }

    if (profileOverlay) {
        profileOverlay.addEventListener('click', closeProfile);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userOrders');
            clearCart();
            alert('Вы вышли из аккаунта');
            closeProfile();
            
            const loginButton = document.getElementById('loginButton');
            if (loginButton) {
                loginButton.textContent = 'Войти';
                loginButton.onclick = function(e) {
                    e.preventDefault();
                    openModal(loginModal);
                };
            }
        });
    }

    function loadProfile() {
        const profileContent = document.getElementById('profileContent');
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');

        if (!user.email) {
            profileContent.innerHTML = '<p>Пользователь не найден. Пожалуйста, войдите в систему.</p>';
            return;
        }

        let html = `<p><strong>Email:</strong> ${user.email}</p>`;
        
        if (orders.length === 0) {
            html += '<h4>История заказов:</h4><p>У вас пока нет заказов.</p>';
        } else {
            html += '<h4>История заказов:</h4>';
            orders.forEach(order => {
                html += `
                    <div class="order-item">
                        <p><strong>Дата:</strong> ${new Date(order.date).toLocaleString()}</p>
                        <p><strong>Сумма:</strong> ${order.total} ₽</p>
                        <p><strong>Товары:</strong></p>
                        <ul>
                            ${order.items.map(item => `<li>${item.name} × ${item.quantity}</li>`).join('')}
                        </ul>
                    </div>
                `;
            });
        }

        profileContent.innerHTML = html;
    }

    // Проверяем, авторизован ли пользователь при загрузке страницы
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        updateUIAfterLogin();
    }

    // Корзина
    const cartButton = document.getElementById('cartButton');
    const cartOverlay = document.getElementById('cartOverlay');
    const cart = document.getElementById('cart');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.getElementById('totalPrice');
    const itemCountElement = document.getElementById('itemCount');
    const cartEmptyMessage = document.getElementById('cartEmptyMessage');
    const checkoutButton = document.getElementById('checkoutButton');

    let itemCount = 0;
    const cartData = {};

    if (cartButton) {
        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            cart.style.right = '0';
            cartOverlay.style.display = 'block';
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cart.style.right = '-40%';
            cartOverlay.style.display = 'none';
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            cart.style.right = '-40%';
            cartOverlay.style.display = 'none';
        });
    }

    // Добавление в корзину
    const addToCartBtn = document.getElementById('addToCart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('foodQuantity').value);
            if (currentItem) {
                addToCart({
                    id: currentItem.id,
                    name: currentItem.name,
                    price: currentItem.price,
                    quantity: quantity
                });
                closeModal(modal);
            }
        });
    }

    function addToCart(item) {
        if (cartData[item.id]) {
            cartData[item.id].quantity += item.quantity;
        } else {
            cartData[item.id] = { ...item };
        }
        itemCount += item.quantity;
        updateCartText();
        updateCartUI();
    }

    function updateCartUI() {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        let total = 0;

        for (const itemId in cartData) {
            const item = cartData[itemId];
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span class="cart-item-price">${itemTotal} ₽</span>
                    <div class="cart-item-controls">
                        <button class="quantity-button decrease" data-id="${itemId}">-</button>
                        <input type="number" value="${item.quantity}" class="quantity-input" data-id="${itemId}" min="1" />
                        <button class="quantity-button increase" data-id="${itemId}">+</button>
                    </div>
                </div>
                <span class="remove-item" data-id="${itemId}">×</span>
            `;

            cartItemsContainer.appendChild(itemElement);
        }

        if (totalPriceElement) {
            totalPriceElement.innerText = `Всего: ${total} ₽`;
        }
        
        if (cartEmptyMessage) {
            cartEmptyMessage.style.display = total > 0 ? 'none' : 'block';
        }

        // Добавляем обработчики для кнопок в корзине
        document.querySelectorAll('.remove-item').forEach(removeBtn => {
            removeBtn.addEventListener('click', () => {
                const itemId = removeBtn.dataset.id;
                removeFromCart(itemId);
            });
        });

        document.querySelectorAll('.quantity-button').forEach(button => {
            button.addEventListener('click', () => {
                const itemId = button.dataset.id;
                const isIncrease = button.classList.contains('increase');
                updateItemQuantity(itemId, isIncrease);
            });
        });

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', () => {
                const itemId = input.dataset.id;
                const newQuantity = parseInt(input.value);
                if (newQuantity > 0) {
                    setItemQuantity(itemId, newQuantity);
                }
            });
        });
    }

    function updateItemQuantity(itemId, isIncrease) {
        if (cartData[itemId]) {
            const change = isIncrease ? 1 : -1;
            cartData[itemId].quantity += change;

            if (cartData[itemId].quantity <= 0) {
                removeFromCart(itemId);
            } else {
                itemCount += change;
                updateCartText();
                updateCartUI();
            }
        }
    }

    function setItemQuantity(itemId, newQuantity) {
        if (cartData[itemId]) {
            const change = newQuantity - cartData[itemId].quantity;
            cartData[itemId].quantity = newQuantity;
            itemCount += change;
            updateCartText();
            updateCartUI();
        }
    }

    function removeFromCart(itemId) {
        if (cartData[itemId]) {
            itemCount -= cartData[itemId].quantity;
            delete cartData[itemId];
            updateCartText();
            updateCartUI();
        }
    }

    function updateCartText() {
        itemCount = 0;
        for (const itemId in cartData) {
            if (cartData[itemId]) {
                itemCount += cartData[itemId].quantity;
            }
        }
        if (itemCountElement) {
            itemCountElement.innerText = itemCount;
        }
    }

    function clearCart() {
        for (const key in cartData) {
            delete cartData[key];
        }
        itemCount = 0;
        updateCartText();
        updateCartUI();
    }

    // Управление количеством в модальном окне
    const decreaseButton = document.getElementById('decreaseQuantity');
    const increaseButton = document.getElementById('increaseQuantity');
    const quantityInput = document.getElementById('foodQuantity');

    if (decreaseButton) {
        decreaseButton.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }

    if (increaseButton) {
        increaseButton.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }

    // Оформление заказа
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

            if (!user.email) {
                cart.style.right = '-40%';
                cartOverlay.style.display = 'none';
                openModal(loginModal);
                return;
            }

            if (Object.keys(cartData).length === 0) {
                alert('Корзина пуста!');
                return;
            }

            showOrderConfirmation();
        });
    }

    function showOrderConfirmation() {
        const orderItems = Object.values(cartData).map(item => 
            `<p>${item.name} × ${item.quantity} — ${item.price * item.quantity} ₽</p>`
        ).join('');
        
        const total = Object.values(cartData).reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        const orderSummary = document.getElementById('orderSummary');
        if (orderSummary) {
            orderSummary.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h4>Ваш заказ:</h4>
                    ${orderItems}
                    <hr>
                    <p style="font-size: 1.2rem; font-weight: bold;">Итого: ${total} ₽</p>
                </div>
            `;
        }
        
        openModal(orderConfirmModal);
    }

    // Подтверждение заказа
    const confirmOrderButton = document.getElementById('confirmOrderButton');
    if (confirmOrderButton) {
        confirmOrderButton.addEventListener('click', () => {
            saveOrderToProfile();
            clearCart();
            closeModal(orderConfirmModal);
            cart.style.right = '-40%';
            cartOverlay.style.display = 'none';
            alert('Заказ успешно оформлен! Детали сохранены в вашем профиле.');
        });
    }

    function saveOrderToProfile() {
        const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        const items = Object.values(cartData).map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        orders.push({
            date: new Date().toISOString(),
            items,
            total
        });

        localStorage.setItem('userOrders', JSON.stringify(orders));
    }

    // Инициализация
    updateCartText();
});
