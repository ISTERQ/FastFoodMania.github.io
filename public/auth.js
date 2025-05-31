// Authentication functionality
if (typeof currentUser === 'undefined') {
    let currentUser = null;
}

// Initialize authentication
function initAuth() {
    // Load user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    updateAuthDisplay();
    setupAuthEventListeners();
}

// Setup authentication event listeners
function setupAuthEventListeners() {
    // Profile dropdown toggle
    const profileBtn = document.getElementById('profile-btn');
    const dropdown = document.getElementById('dropdown-menu');
    
    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Login option
    const loginOption = document.getElementById('login-option');
    if (loginOption) {
        loginOption.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }

    // Register option
    const registerOption = document.getElementById('register-option');
    if (registerOption) {
        registerOption.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterModal();
        });
    }

    // Logout option
    const logoutOption = document.getElementById('logout-option');
    if (logoutOption) {
        logoutOption.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginForm);
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterForm);
    }

    // Modal switches
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideLoginModal();
            showRegisterModal();
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideRegisterModal();
            showLoginModal();
        });
    }

    // Modal close buttons
    const loginModalClose = document.getElementById('login-modal-close');
    const registerModalClose = document.getElementById('register-modal-close');
    
    if (loginModalClose) {
        loginModalClose.addEventListener('click', hideLoginModal);
    }
    
    if (registerModalClose) {
        registerModalClose.addEventListener('click', hideRegisterModal);
    }
}

// Update authentication display
function updateAuthDisplay() {
    const profileBtnText = document.getElementById('profile-btn-text');
    const authOptions = document.getElementById('auth-options');
    const userOptions = document.getElementById('user-options');
    
    if (currentUser) {
        // User is logged in
        if (profileBtnText) {
            profileBtnText.textContent = currentUser.firstName;
        }
        if (authOptions) {
            authOptions.style.display = 'none';
        }
        if (userOptions) {
            userOptions.style.display = 'block';
        }
    } else {
        // User is not logged in
        if (profileBtnText) {
            profileBtnText.textContent = 'Профиль';
        }
        if (authOptions) {
            authOptions.style.display = 'block';
        }
        if (userOptions) {
            userOptions.style.display = 'none';
        }
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Clear form
        const form = document.getElementById('login-form');
        if (form) {
            form.reset();
        }
    }
}

// Hide login modal
function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Show register modal
function showRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Clear form
        const form = document.getElementById('register-form');
        if (form) {
            form.reset();
        }
    }
}

// Hide register modal
function hideRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Handle login form submission
async function handleLoginForm(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // Send login request to API
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Login successful
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthDisplay();
            hideLoginModal();
            showNotification('Добро пожаловать!', 'success');
            
            // Hide dropdown
            const dropdownMenu = document.getElementById('dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        } else {
            // Login failed
            showNotification(data.error || 'Ошибка входа', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Ошибка подключения к серверу', 'error');
    }
}

// Handle register form submission
async function handleRegisterForm(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('register-firstName').value;
    const lastName = document.getElementById('register-lastName').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        // Send registration request to API
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Registration successful
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateAuthDisplay();
            hideRegisterModal();
            showNotification('Регистрация успешна! Добро пожаловать!', 'success');
            
            // Hide dropdown
            const dropdownMenu = document.getElementById('dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        } else {
            // Registration failed
            showNotification(data.error || 'Ошибка регистрации', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Ошибка подключения к серверу', 'error');
    }
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthDisplay();
    showNotification('Вы вышли из аккаунта', 'info');
    
    // Hide dropdown
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.classList.remove('show');
    }

     // Перенаправляем на главную страницу после небольшой задержки
    setTimeout(() => {
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = '../index.html';
        } else if (window.location.pathname.includes('/pages/')) {
            window.location.href = '../index.html';
        } else if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/';
        }
    }, 1500);
    
    // Clear cart if needed
    // localStorage.removeItem('cart');
    // updateCartDisplay();
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Require authentication for action
function requireAuth(action, message = 'Для этого действия необходимо войти в аккаунт') {
    if (!isAuthenticated()) {
        showNotification(message, 'warning');
        showLoginModal();
        return false;
    }
    return true;
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);