// ==========================================
// CONFIGURACIÓN
// ==========================================
const API_BASE_URL = '/ecommerce';

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const navLinks = document.getElementById('navLinks');
const signinForm = document.getElementById('signinForm');
const signinErrorMsg = document.getElementById('signinErrorMsg');
const signinSuccessMsg = document.getElementById('signinSuccessMsg');

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();

    // Si ya hay sesión activa, no tiene sentido mostrar Sign In: redirigimos a Home
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    signinForm.addEventListener('submit', handleSignin);
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
                <a class="nav-link" href="login.html">Log In</a>
            </li>
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="signin.html">Sign In</a>
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
// SIGN IN (registro)
// ==========================================
async function handleSignin(event) {
    event.preventDefault();
    hideMessages();

    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPass').value;
    const passConfirm = document.getElementById('signinPassConfirm').value;

    // Validación en cliente: las contraseñas deben coincidir
    if (password !== passConfirm) {
        showError('Las contraseñas no coinciden.');
        return;
    }

    const usuarioRequest = { email, password }; // passConfirm NO se envía a la API

    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioRequest)
        });

        if (!response.ok) {
            showError('No se pudo completar el registro. Verifica los datos e intenta de nuevo.');
            return;
        }

        showSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
        signinForm.reset();

        // Pequeña pausa para que el usuario vea el mensaje antes de redirigir
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        console.error(error);
        showError('No se pudo conectar con el servidor. Intenta más tarde.');
    }
}

// ==========================================
// UTILIDADES DE UI
// ==========================================
function showError(message) {
    signinErrorMsg.textContent = message;
    signinErrorMsg.classList.remove('d-none');
    signinSuccessMsg.classList.add('d-none');
}

function showSuccess(message) {
    signinSuccessMsg.textContent = message;
    signinSuccessMsg.classList.remove('d-none');
    signinErrorMsg.classList.add('d-none');
}

function hideMessages() {
    signinErrorMsg.classList.add('d-none');
    signinSuccessMsg.classList.add('d-none');
}