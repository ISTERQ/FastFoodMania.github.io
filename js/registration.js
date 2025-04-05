// registration.js
document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("loginButton");
    const closeModal = document.getElementById("closeLoginModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const loginModal = document.getElementById("loginModal");
    const showLoginForm = document.getElementById("showLoginForm");
    const showRegistrationForm = document.getElementById("showRegistrationForm");
    const registrationForm = document.getElementById("registrationForm");
    const loginForm = document.getElementById("loginForm");

    loginButton.onclick = function () {
        loginModal.style.display = "block";
    }

    closeModal.onclick = function () {
        loginModal.style.display = "none";
    }

    modalOverlay.onclick = function () {
        loginModal.style.display = "none";
    }

    showLoginForm.onclick = function () {
        registrationForm.style.display = "none";
        loginForm.style.display = "block";
    }

    showRegistrationForm.onclick = function () {
        loginForm.style.display = "none";
        registrationForm.style.display = "block";
    }
});