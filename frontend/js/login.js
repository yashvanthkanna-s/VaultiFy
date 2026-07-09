/**
 * login.js — Handles login form submission
 * Communicates with POST /api/auth/login
 */

const BASE_URL = 'http://localhost:8080';

// ========== Auth Guard ==========
// If already logged in, go straight to dashboard
if (localStorage.getItem('vaultify_token')) {
    window.location.href = 'dashboard.html';
}

// ========== DOM References ==========
const loginForm    = document.getElementById('login-form');
const emailInput   = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn     = document.getElementById('login-btn');
const loginBtnText = document.getElementById('login-btn-text');
const loginSpinner = document.getElementById('login-spinner');
const errorBox     = document.getElementById('login-error');
const togglePwd    = document.getElementById('toggle-pwd');

// ========== Password Toggle ==========
togglePwd.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
});

// ========== Validation ==========

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + '-error');
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('is-error');
}

function clearFieldError(fieldId) {
    const errorEl = document.getElementById(fieldId + '-error');
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('is-error');
}

function clearAllErrors() {
    clearFieldError('email');
    clearFieldError('password');
    errorBox.style.display = 'none';
}

function showGlobalError(message) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
}

function validateForm() {
    let valid = true;
    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
        showFieldError('email', 'Email is required');
        valid = false;
    } else if (!validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        valid = false;
    }

    if (!password) {
        showFieldError('password', 'Password is required');
        valid = false;
    }

    return valid;
}

// ========== Submit Handler ==========

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    if (!validateForm()) return;

    setLoading(true);

    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailInput.value.trim().toLowerCase(),
                password: passwordInput.value
            })
        });

        const result = await response.json();

        if (!response.ok) {
            showGlobalError(result.message || 'Login failed. Please try again.');
            return;
        }

        // Save auth data to localStorage
        localStorage.setItem('vaultify_token', result.data.token);
        localStorage.setItem('vaultify_user', JSON.stringify({
            id:       result.data.userId,
            fullName: result.data.fullName,
            email:    result.data.email
        }));

        // Redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (err) {
        showGlobalError('Cannot connect to server. Make sure the backend is running.');
    } finally {
        setLoading(false);
    }
});

// ========== Loading State ==========

function setLoading(loading) {
    loginBtn.disabled    = loading;
    loginBtnText.style.display = loading ? 'none' : 'inline';
    loginSpinner.style.display = loading ? 'inline-block' : 'none';
}

// ========== Clear errors on input ==========

emailInput.addEventListener('input', () => clearFieldError('email'));
passwordInput.addEventListener('input', () => clearFieldError('password'));
