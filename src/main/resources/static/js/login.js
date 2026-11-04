// ==========================================
// CONFIGURACIÓN
// ==========================================
const API_BASE_URL = '/ecommerce';

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const navLinks = document.getElementById('navLinks');
const loginForm = document.getElementById('loginForm');
const loginErrorMsg = document.getElementById('loginErrorMsg');

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();

    // Si ya hay sesión activa, no tiene sentido mostrar Log In: redirigimos a Home
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    loginForm.addEventListener('submit', handleLogin);
});

// ==========================================
// NAVBAR (según estado de sesión)
// ==========================================
function renderNavbar() {
    const token = localStorage.getItem('token');

    if (token) {
        navLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="index.html">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="gestion.html">Gestión</a>
            </li>
            <li class="nav-item">
                <button class="btn btn-outline-danger ms-lg-2" id="logoutBtn">Log Out</button>
            </li>
        `;
        document.getElementById('logoutBtn').addEventListener('click', logout);
    } else {
        navLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="index.html">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="login.html">Log In</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="signin.html">Sign In</a>
            </li>
        `;
    }
}

function logout() {
    localStorage.removeItem('token');
    renderNavbar();
    window.location.href = 'index.html';
}

// ==========================================
// LOGIN
// ==========================================
async function handleLogin(event) {
    event.preventDefault();
    hideError();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value;

    const loginRequest = { email, password };

    try {
        const response = await fetch(`${API_BASE_URL}/login`, { // http://localhost:8080/ecommerce/login
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginRequest)
        });

        if (!response.ok) {
            showError('Credenciales inválidas. Intenta de nuevo.');
            return;
        }

        const data = await response.json(); // TokenAcceso: { token: "..." }

        if (!data.token) {
            showError('No se recibió un token válido. Intenta de nuevo.');
            return;
        }

        localStorage.setItem('token', data.token);
        window.location.href = 'index.html';

    } catch (error) {
        console.error(error);
        showError('El correo o la contraseña no son válidos.');
    }
}

// ==========================================
// UTILIDADES DE UI
// ==========================================
function showError(message) {
    loginErrorMsg.textContent = message;
    loginErrorMsg.classList.remove('d-none');
}

function hideError() {
    loginErrorMsg.classList.add('d-none');
}