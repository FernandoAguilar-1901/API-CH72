// ==========================================
// CONFIGURACIÓN
// ==========================================
const API_BASE_URL = '/ecommerce'; // Ajusta host/puerto según tu configuración de Spring Boot

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const navLinks = document.getElementById('navLinks');
const btnShowProductos = document.getElementById('btnShowProductos');
const btnShowCategorias = document.getElementById('btnShowCategorias');
const btnShowUsuarios = document.getElementById('btnShowUsuarios');

const vistaProductos = document.getElementById('vistaProductos');
const vistaCategorias = document.getElementById('vistaCategorias');
const vistaUsuarios = document.getElementById('vistaUsuarios');

const productosContainer = document.getElementById('productosContainer');
const categoriasContainer = document.getElementById('categoriasContainer');
const usuariosTableBody = document.getElementById('usuariosTableBody');
const usuariosRestringidoMsg = document.getElementById('usuariosRestringidoMsg');

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    showProductos(); // vista por default al cargar la página

    btnShowProductos.addEventListener('click', showProductos);
    btnShowCategorias.addEventListener('click', showCategorias);
    btnShowUsuarios.addEventListener('click', showUsuarios);
});

// ==========================================
// NAVBAR (según estado de sesión)
// ==========================================
function renderNavbar() {
    const token = localStorage.getItem('token');

    if (token) {
        navLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="index.html">Home</a>
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
                <a class="nav-link active" aria-current="page" href="index.html">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="login.html">Log In</a>
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
    showProductos(); // regresa a una vista pública tras cerrar sesión
}

// ==========================================
// TOGGLE DE VISTAS
// ==========================================
function setActiveButton(activeBtn) {
    [btnShowProductos, btnShowCategorias, btnShowUsuarios].forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
    });
    activeBtn.classList.remove('btn-outline-primary');
    activeBtn.classList.add('btn-primary');
}

function showProductos() {
    setActiveButton(btnShowProductos);
    vistaProductos.classList.remove('d-none');
    vistaCategorias.classList.add('d-none');
    vistaUsuarios.classList.add('d-none');
    usuariosRestringidoMsg.classList.add('d-none');
    fetchProductos();
}

function showCategorias() {
    setActiveButton(btnShowCategorias);
    vistaProductos.classList.add('d-none');
    vistaCategorias.classList.remove('d-none');
    vistaUsuarios.classList.add('d-none');
    usuariosRestringidoMsg.classList.add('d-none');
    fetchCategorias();
}

function showUsuarios() {
    setActiveButton(btnShowUsuarios);
    vistaProductos.classList.add('d-none');
    vistaCategorias.classList.add('d-none');

    const token = localStorage.getItem('token');
    if (!token) {
        vistaUsuarios.classList.add('d-none');
        usuariosRestringidoMsg.classList.remove('d-none');
        return;
    }

    usuariosRestringidoMsg.classList.add('d-none');
    vistaUsuarios.classList.remove('d-none');
    fetchUsuarios();
}

// ==========================================
// LLAMADAS A LA API
// ==========================================
async function fetchProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/`);
        if (!response.ok) throw new Error('Error al obtener productos');
        const productos = await response.json();
        renderProductos(productos);
    } catch (error) {
        console.error(error);
        productosContainer.innerHTML = `<p class="text-danger">No se pudieron cargar los productos.</p>`;
    }
}

async function fetchCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias/`);
        if (!response.ok) throw new Error('Error al obtener categorías');
        const categorias = await response.json();
        renderCategorias(categorias);
    } catch (error) {
        console.error(error);
        categoriasContainer.innerHTML = `<p class="text-danger">No se pudieron cargar las categorías.</p>`;
    }
}

async function fetchUsuarios() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            // Token inválido o expirado: limpiamos sesión
            localStorage.removeItem('token');
            renderNavbar();
            vistaUsuarios.classList.add('d-none');
            usuariosRestringidoMsg.classList.remove('d-none');
            return;
        }

        if (!response.ok) throw new Error('Error al obtener usuarios');

        const usuarios = await response.json();
        renderUsuarios(usuarios);
    } catch (error) {
        console.error(error);
        usuariosTableBody.innerHTML = `<tr><td colspan="2" class="text-danger">No se pudieron cargar los usuarios.</td></tr>`;
    }
}

// ==========================================
// RENDERIZADO
// ==========================================
function renderProductos(productos) {
    if (!productos || productos.length === 0) {
        productosContainer.innerHTML = `<p>No hay productos disponibles.</p>`;
        return;
    }

    productosContainer.innerHTML = productos.map(producto => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="./assets/${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <p class="card-text fw-bold">$${producto.precio.toFixed(2)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategorias(categorias) {
    if (!categorias || categorias.length === 0) {
        categoriasContainer.innerHTML = `<p>No hay categorías disponibles.</p>`;
        return;
    }

    categoriasContainer.innerHTML = categorias.map(categoria => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${categoria.nombre}</h5>
                    <p class="card-text">${categoria.descripcion}</p>
                    <p class="card-text"><small class="text-muted">${categoria.productos ? categoria.productos.length : 0} producto(s) en esta categoría</small></p>
                </div>
            </div>
        </div>
    `).join('');
}

function renderUsuarios(usuarios) {
    if (!usuarios || usuarios.length === 0) {
        usuariosTableBody.innerHTML = `<tr><td colspan="2">No hay usuarios registrados.</td></tr>`;
        return;
    }

    usuariosTableBody.innerHTML = usuarios.map(usuario => `
        <tr>
            <td>${usuario.id}</td>
            <td>${usuario.email}</td>
        </tr>
    `).join('');
}