/**
 * signup.js — Handles signup form submission
 * Communicates with POST /api/auth/signup
 */

const BASE_URL = 'http://localhost:8080';

// ========== Auth Guard ==========
if (localStorage.getItem('vaultify_token')) {
    window.location.href = 'dashboard.html';
}

// ========== DOM References ==========
const signupForm       = document.getElementById('signup-form');
const fullNameInput    = document.getElementById('fullName');
const emailInput       = document.getElementById('email');
const passwordInput    = document.getElementById('password');
const confirmPwdInput  = document.getElementById('confirmPassword');
const signupBtn        = document.getElementById('signup-btn');
const signupBtnText    = document.getElementById('signup-btn-text');
const signupSpinner    = document.getElementById('signup-spinner');
const errorBox         = document.getElementById('signup-error');
const togglePwd        = document.getElementById('toggle-pwd');

// ========== Password Toggle ==========
togglePwd.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
});

// ========== Validation Helpers ==========

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
    ['fullName', 'email', 'password', 'confirmPassword'].forEach(clearFieldError);
    errorBox.style.display = 'none';
}

function showGlobalError(message) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
}

function validateForm() {
    let valid = true;

    const fullName    = fullNameInput.value.trim();
    const email       = emailInput.value.trim();
    const password    = passwordInput.value;
    const confirmPwd  = confirmPwdInput.value;

    if (!fullName) {
        showFieldError('fullName', 'Full name is required');
        valid = false;
    } else if (fullName.length < 2) {
        showFieldError('fullName', 'Name must be at least 2 characters');
        valid = false;
    }

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
    } else if (password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters');
        valid = false;
    }

    if (!confirmPwd) {
        showFieldError('confirmPassword', 'Please confirm your password');
        valid = false;
    } else if (password !== confirmPwd) {
        showFieldError('confirmPassword', 'Passwords do not match');
        valid = false;
    }

    return valid;
}

// ========== Submit Handler ==========

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    if (!validateForm()) return;

    setLoading(true);

    try {
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName:        fullNameInput.value.trim(),
                email:           emailInput.value.trim().toLowerCase(),
                password:        passwordInput.value,
                confirmPassword: confirmPwdInput.value
            })
        });

        const result = await response.json();

        if (!response.ok) {
            showGlobalError(result.message || 'Signup failed. Please try again.');
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
    signupBtn.disabled = loading;
    signupBtnText.style.display = loading ? 'none' : 'inline';
    signupSpinner.style.display = loading ? 'inline-block' : 'none';
}

// ========== Clear errors on input ==========
fullNameInput.addEventListener('input',   () => clearFieldError('fullName'));
emailInput.addEventListener('input',      () => clearFieldError('email'));
passwordInput.addEventListener('input',   () => clearFieldError('password'));
confirmPwdInput.addEventListener('input', () => clearFieldError('confirmPassword'));
