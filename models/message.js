// === Переключение между формами ===
function showRegister() {
    document.getElementById("registerForm").classList.add("active");
    document.getElementById("loginForm").classList.remove("active");

    document.getElementById("toggleRegister").classList.add("active");
    document.getElementById("toggleLogin").classList.remove("active");
}

function showLogin() {
    document.getElementById("loginForm").classList.add("active");
    document.getElementById("registerForm").classList.remove("active");

    document.getElementById("toggleLogin").classList.add("active");
    document.getElementById("toggleRegister").classList.remove("active");
}

showLogin(); // По умолчанию

// === Регистрация ===
const registerForm = document.querySelector("#registerForm form");
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch("https://fastfoodmania-api.onrender.com/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Регистрация прошла успешно!");
            showLogin();
        } else {
            alert(data.message || "Ошибка регистрации.");
        }
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        alert("Произошла ошибка.");
    }
});

// === Вход ===
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("https://fastfoodmania-api.onrender.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password }),
            credentials: "include"
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("username", email);
            alert("Вход выполнен!");

            document.getElementById('loginModal').style.display = 'none';
            updateLoginButtonToProfile();
        } else {
            alert(data.message || "Ошибка входа.");
        }
    } catch (error) {
        console.error("Ошибка входа:", error);
        alert("Произошла ошибка. Попробуйте снова.");
    }
});

// === Выход ===
function logout() {
    fetch("https://fastfoodmania-api.onrender.com/logout", {
        method: "POST",
        credentials: "include"
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

    loginButton.textContent = "Профиль";
    loginButton.removeAttribute("href");
    loginButton.id = "profileButton";

    loginButton.addEventListener("click", async () => {
        document.getElementById("profileSidebar").style.right = "0";
        document.getElementById("profileOverlay").style.display = "block";
        await loadOrderHistory();
    });
}

// === Функция для авторизованных fetch-запросов ===
async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("accessToken");

    if (!token) {
        token = await refreshAccessToken();
        if (!token) return null;
    }

    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) return response;

        response = await fetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });
    }

    return response;
}

// === Функция для парсинга срока действия токена ===
function getTokenExp(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp;
    } catch (e) {
        return null;
    }
}

// === Обновляем кнопку "Войти" при загрузке, если пользователь уже вошёл ===
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("userId")) {
        updateLoginButtonToProfile();
    }
});
function updateLoginButtonToProfile() {
    const loginButton = document.getElementById("loginButton");
    if (!loginButton) return;
  
    loginButton.textContent = "Профиль";
    loginButton.removeAttribute("href");
    loginButton.id = "profileButton";
  
    loginButton.addEventListener("click", async () => {
      document.getElementById("profileSidebar").classList.add("open");
      document.getElementById("profileOverlay").style.display = "block";
      await loadOrderHistory();
    });
}
document.getElementById("closeProfileSidebar").addEventListener("click", () => {
    document.getElementById("profileSidebar").classList.remove("open");
    document.getElementById("profileOverlay").style.display = "none";
  });
  
  document.getElementById("profileOverlay").addEventListener("click", () => {
    document.getElementById("profileSidebar").classList.remove("open");
    document.getElementById("profileOverlay").style.display = "none";
});
async function loadOrderHistory() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
  
    try {
      const response = await fetch(`https://fastfoodmania-api.onrender.com/orders/${userId}`);
      const orders = await response.json();
  
      const container = document.getElementById("orderHistory");
      container.innerHTML = "";
  
      if (orders.length === 0) {
        container.innerHTML = "<p>История заказов пуста.</p>";
        return;
      }
  
      orders.forEach(order => {
        const div = document.createElement("div");
        div.classList.add("order-item");
        div.innerHTML = `
          <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Сумма:</strong> ${order.total} ₽</p>
          <p><strong>Заказ:</strong></p>
          <ul>${order.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join("")}</ul>
        `;
        container.appendChild(div);
      });
  
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
    }
}
     
