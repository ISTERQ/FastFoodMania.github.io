// Система аутентификации для FastFoodMania

// === Переключение между формами ===
function showRegister() {
    document.getElementById("registrationForm").style.display = "block";
    document.getElementById("loginForm").style.display = "none";
}

function showLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registrationForm").style.display = "none";
}

// Инициализация - показать форму входа по умолчанию
document.addEventListener("DOMContentLoaded", () => {
    showLogin();
    
    // Проверяем, есть ли уже авторизованный пользователь
    const token = localStorage.getItem("authToken");
    if (token) {
        updateLoginButtonToProfile();
    }
});

// === Регистрация ===
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registrationForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("registerUsername").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;

            try {
                const response = await fetch("https://fastfoodmania-api.onrender.com/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Регистрация прошла успешно!");
                    
                    // Сохраняем токен и данные пользователя
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("userId", data.user.id);
                    localStorage.setItem("username", data.user.username);
                    localStorage.setItem("userEmail", data.user.email);
                    
                    // Обновляем интерфейс
                    updateLoginButtonToProfile();
                    
                    // Закрываем модальное окно
                    document.getElementById("loginModal").style.display = "none";
                } else {
                    alert(data.message || "Ошибка регистрации.");
                }
            } catch (error) {
                console.error("Ошибка регистрации:", error);
                alert("Произошла ошибка при регистрации.");
            }
        });
    }
});

// === Вход ===
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const response = await fetch("https://fastfoodmania-api.onrender.com/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Сохраняем токен и данные пользователя
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("userId", data.user.id);
                    localStorage.setItem("username", data.user.username);
                    localStorage.setItem("userEmail", data.user.email);

                    alert("Вход выполнен!");
                    
                    // Обновляем интерфейс
                    updateLoginButtonToProfile();
                    
                    // Закрываем модальное окно
                    document.getElementById("loginModal").style.display = "none";
                } else {
                    alert(data.message || "Ошибка входа.");
                }
            } catch (error) {
                console.error("Ошибка входа:", error);
                alert("Произошла ошибка. Попробуйте снова.");
            }
        });
    }
});

// === Выход ===
function logout() {
    fetch("https://fastfoodmania-api.onrender.com/api/auth/logout", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
    })
    .then(() => {
        localStorage.clear();
        alert("Выход выполнен.");
        location.reload();
    })
    .catch((error) => console.error("Ошибка выхода:", error));
}

// === Функция обновления кнопки Войти → Профиль ===
function updateLoginButtonToProfile() {
    const loginButton = document.getElementById("loginButton");
    if (!loginButton) return;

    const username = localStorage.getItem("username");
    loginButton.textContent = username || "Профиль";
    loginButton.removeAttribute("href");
    loginButton.id = "profileButton";

    // Удаляем старые обработчики и добавляем новый
    const newButton = loginButton.cloneNode(true);
    loginButton.parentNode.replaceChild(newButton, loginButton);
    
    newButton.addEventListener("click", async (e) => {
        e.preventDefault();
        document.getElementById("profileSidebar").classList.add("open");
        document.getElementById("profileOverlay").style.display = "block";
        await loadOrderHistory();
    });
}

// === Функция для авторизованных fetch-запросов ===
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
        throw new Error("Пользователь не авторизован");
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            "Authorization": `Bearer ${token}`,
        },
    });

    return response;
}

// === Загрузка истории заказов ===
async function loadOrderHistory() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const response = await fetchWithAuth("https://fastfoodmania-api.onrender.com/api/orders");
        
        if (response.ok) {
            const orders = await response.json();
            displayOrderHistory(orders);
        } else {
            console.error("Ошибка загрузки заказов");
        }
    } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
    }
}

// === Отображение истории заказов ===
function displayOrderHistory(orders) {
    const container = document.getElementById("profileContent");
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = "<p>История заказов пуста.</p>";
        return;
    }

    let html = "<h3>История заказов:</h3>";
    orders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleString();
        const itemsList = order.items.map(item =>
            `<li>${item.name} × ${item.quantity} (${item.price * item.quantity} ₽)</li>`
        ).join('');

        html += `
            <div class="order-item" style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; background: #f9f9f9;">
                <p><strong>Дата:</strong> ${date}</p>
                ${order.address ? `<p><strong>Адрес:</strong> ${order.address}</p>` : ''}
                ${order.phone ? `<p><strong>Телефон:</strong> ${order.phone}</p>` : ''}
                ${order.customerName ? `<p><strong>Имя:</strong> ${order.customerName}</p>` : ''}
                <p><strong>Товары:</strong></p>
                <ul style="margin-left: 20px;">${itemsList}</ul>
                <p><strong>Итого:</strong> ${order.total} ₽</p>
            </div>
        `;
    });

    container.innerHTML = html;
}

// === Обработчики переключения форм ===
document.addEventListener("DOMContentLoaded", () => {
    const showLoginLink = document.getElementById("showLoginForm");
    const showRegisterLink = document.getElementById("showRegistrationForm");
    
    if (showLoginLink) {
        showLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            showLogin();
        });
    }
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener("click", (e) => {
            e.preventDefault();
            showRegister();
        });
    }
});

// === Обработчики модального окна ===
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const loginModal = document.getElementById("loginModal");
    const closeModal = document.getElementById("closeLoginModal");
    
    if (loginButton && loginModal) {
        loginButton.addEventListener("click", (e) => {
            e.preventDefault();
            loginModal.style.display = "block";
        });
    }
    
    if (closeModal && loginModal) {
        closeModal.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }
    
    // Закрытие модального окна при клике вне его
    if (loginModal) {
        loginModal.addEventListener("click", (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = "none";
            }
        });
    }
});

// === Обработчики профиля ===
document.addEventListener("DOMContentLoaded", () => {
    const closeProfileSidebar = document.getElementById("closeProfileSidebar");
    const profileOverlay = document.getElementById("profileOverlay");
    const logoutButton = document.getElementById("logoutButton");
    
    if (closeProfileSidebar) {
        closeProfileSidebar.addEventListener("click", () => {
            document.getElementById("profileSidebar").classList.remove("open");
            document.getElementById("profileOverlay").style.display = "none";
        });
    }
    
    if (profileOverlay) {
        profileOverlay.addEventListener("click", () => {
            document.getElementById("profileSidebar").classList.remove("open");
            profileOverlay.style.display = "none";
        });
    }
    
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
});

// Экспортируем функции для использования в других файлах
window.showLogin = showLogin;
window.showRegister = showRegister;
window.updateLoginButtonToProfile = updateLoginButtonToProfile;
window.loadOrderHistory = loadOrderHistory;
window.fetchWithAuth = fetchWithAuth;
window.logout = logout;