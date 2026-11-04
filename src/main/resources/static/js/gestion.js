// ==========================================
// CONFIGURACIÓN
// ==========================================
const API_BASE_URL = '/ecommerce';

// ==========================================
// ELEMENTOS DEL DOM - GENERALES
// ==========================================
const navLinks = document.getElementById('navLinks');
const gestionRestringidoMsg = document.getElementById('gestionRestringidoMsg');
const gestionTabs = document.getElementById('gestionTabs');
const gestionTabsContent = document.getElementById('gestionTabsContent');

// ==========================================
// ELEMENTOS DEL DOM - PRODUCTOS
// ==========================================
const productoCreateForm = document.getElementById('productoCreateForm');
const productoCreateErrorMsg = document.getElementById('productoCreateErrorMsg');
const productoCreateSuccessMsg = document.getElementById('productoCreateSuccessMsg');
const productoCategoriaSelect = document.getElementById('productoCategoria');

const productosManageTableBody = document.getElementById('productosManageTableBody');
const productoManageErrorMsg = document.getElementById('productoManageErrorMsg');
const productoManageSuccessMsg = document.getElementById('productoManageSuccessMsg');

const productoEditFormContainer = document.getElementById('productoEditFormContainer');
const productoEditForm = document.getElementById('productoEditForm');
const productoEditCategoriaSelect = document.getElementById('productoEditCategoria');
const productoEditCancelBtn = document.getElementById('productoEditCancelBtn');

// Guardamos en memoria la última lista de categorías para no repetir fetch entre selects
let categoriasCache = [];

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();

    const token = localStorage.getItem('token');
    if (!token) {
        gestionRestringidoMsg.classList.remove('d-none');
        gestionTabs.classList.add('d-none');
        gestionTabsContent.classList.add('d-none');
        return;
    }

    // Carga inicial de la tab de Productos (tab activa por default)
    fetchCategoriasParaSelect().then(() => {
        fetchProductosManage();
    });

    productoCreateForm.addEventListener('submit', handleProductoCreate);
    productoEditForm.addEventListener('submit', handleProductoEditSubmit);
    productoEditCancelBtn.addEventListener('click', hideProductoEditForm);
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
                <a class="nav-link active" aria-current="page" href="gestion.html">Gestión</a>
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
                <a class="nav-link" href="signin.html">Sign In</a>
            </li>
        `;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ==========================================
// AUTH HELPER
// ==========================================
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function handleAuthError(response) {
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return true;
    }
    return false;
}

// ==========================================
// CATEGORÍAS PARA EL SELECT DE PRODUCTO
// ==========================================
async function fetchCategoriasParaSelect() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias/`);
        if (!response.ok) throw new Error('Error al obtener categorías');

        categoriasCache = await response.json();
        renderCategoriaOptions(productoCategoriaSelect, true);
        renderCategoriaOptions(productoEditCategoriaSelect, false);

    } catch (error) {
        console.error(error);
        productoCreateErrorMsg.textContent = 'No se pudieron cargar las categorías disponibles.';
        productoCreateErrorMsg.classList.remove('d-none');
    }
}

function renderCategoriaOptions(selectElement, includePlaceholder) {
    const placeholder = includePlaceholder
        ? `<option value="" selected disabled>Selecciona una categoría</option>`
        : '';

    selectElement.innerHTML = placeholder + categoriasCache.map(categoria => `
        <option value="${categoria.id}">${categoria.nombre}</option>
    `).join('');
}

// ==========================================
// PRODUCTOS: CREAR (corregido)
// ==========================================
async function handleProductoCreate(event) {
    event.preventDefault();
    hideProductoCreateMessages();

    const idCategoriaSeleccionada = parseInt(document.getElementById('productoCategoria').value, 10);
    const categoriaSeleccionada = categoriasCache.find(c => c.id === idCategoriaSeleccionada);

    const producto = {
        nombre: document.getElementById('productoNombre').value.trim(),
        descripcion: document.getElementById('productoDescripcion').value.trim(),
        imagen: document.getElementById('productoImagen').value.trim(),
        precio: parseFloat(document.getElementById('productoPrecio').value),
        existencias: 50,
        categoria: { id: categoriaSeleccionada.id } // el backend solo necesita el id para asociar
    };

    try {
        const response = await fetch(`${API_BASE_URL}/productos/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(producto)
        });

        if (handleAuthError(response)) return;

        if (!response.ok) {
            showProductoCreateError('No se pudo crear el producto. Verifica los datos e intenta de nuevo.');
            return;
        }

        showProductoCreateSuccess('Producto creado exitosamente.');
        productoCreateForm.reset();
        fetchProductosManage();

    } catch (error) {
        console.error(error);
        showProductoCreateError('No se pudo conectar con el servidor. Intenta más tarde.');
    }
}

// ==========================================
// PRODUCTOS: LISTAR (tabla de gestión)
// ==========================================
async function fetchProductosManage() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/`);
        if (!response.ok) throw new Error('Error al obtener productos');

        const productos = await response.json();
        renderProductosManageTable(productos);

    } catch (error) {
        console.error(error);
        productosManageTableBody.innerHTML = `<tr><td colspan="5" class="text-danger">No se pudieron cargar los productos.</td></tr>`;
    }
}

function renderProductosManageTable(productos) {
    if (!productos || productos.length === 0) {
        productosManageTableBody.innerHTML = `<tr><td colspan="5">No hay productos registrados.</td></tr>`;
        return;
    }

    productosManageTableBody.innerHTML = productos.map(producto => {
        const categoriaNombre = getCategoriaNombreById(producto.categoria);
        return `
            <tr data-id="${producto.id}">
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>${categoriaNombre}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-edit-producto" data-id="${producto.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger btn-delete-producto" data-id="${producto.id}">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');

    // Enganchamos listeners a los botones recién creados
    document.querySelectorAll('.btn-edit-producto').forEach(btn => {
        btn.addEventListener('click', () => showProductoEditForm(btn.dataset.id, productos));
    });

    document.querySelectorAll('.btn-delete-producto').forEach(btn => {
        btn.addEventListener('click', () => handleProductoDelete(btn.dataset.id));
    });
}

// ==========================================
// PRODUCTOS: LISTAR - obtener nombre de categoría (corregido)
// ==========================================
function getCategoriaNombreById(categoria) {
    // "categoria" ahora llega como objeto anidado dentro del producto
    return categoria && categoria.nombre ? categoria.nombre : 'Sin categoría';
}

// ==========================================
// PRODUCTOS: EDITAR - mostrar formulario (corregido)
// ==========================================
function showProductoEditForm(id, productos) {
    const producto = productos.find(p => p.id === parseInt(id, 10));
    if (!producto) return;

    document.getElementById('productoEditId').value = producto.id;
    document.getElementById('productoEditNombre').value = producto.nombre;
    document.getElementById('productoEditDescripcion').value = producto.descripcion;
    document.getElementById('productoEditImagen').value = producto.imagen;
    document.getElementById('productoEditPrecio').value = producto.precio;
    document.getElementById('productoEditCategoria').value = producto.categoria ? producto.categoria.id : '';

    hideProductoManageMessages();
    productoEditFormContainer.classList.remove('d-none');
    productoEditFormContainer.scrollIntoView({ behavior: 'smooth' });
}

function hideProductoEditForm() {
    productoEditFormContainer.classList.add('d-none');
    productoEditForm.reset();
}

// ==========================================
// PRODUCTOS: EDITAR - enviar cambios (corregido)
// ==========================================
async function handleProductoEditSubmit(event) {
    event.preventDefault();
    hideProductoManageMessages();

    const id = document.getElementById('productoEditId').value;
    const idCategoriaSeleccionada = parseInt(document.getElementById('productoEditCategoria').value, 10);

    const producto = {
        id: parseInt(id, 10),
        nombre: document.getElementById('productoEditNombre').value.trim(),
        descripcion: document.getElementById('productoEditDescripcion').value.trim(),
        imagen: document.getElementById('productoEditImagen').value.trim(),
        precio: parseFloat(document.getElementById('productoEditPrecio').value),
        categoria: { id: idCategoriaSeleccionada }
    };

    try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(producto)
        });

        if (handleAuthError(response)) return;

        if (!response.ok) {
            showProductoManageError('No se pudo actualizar el producto. Intenta de nuevo.');
            return;
        }

        showProductoManageSuccess('Producto actualizado exitosamente.');
        hideProductoEditForm();
        fetchProductosManage();

    } catch (error) {
        console.error(error);
        showProductoManageError('No se pudo conectar con el servidor. Intenta más tarde.');
    }
}

// ==========================================
// PRODUCTOS: ELIMINAR
// ==========================================
async function handleProductoDelete(id) {
    hideProductoManageMessages();

    const confirmar = confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (handleAuthError(response)) return;

        if (!response.ok) {
            showProductoManageError('No se pudo eliminar el producto. Intenta de nuevo.');
            return;
        }

        showProductoManageSuccess('Producto eliminado exitosamente.');
        fetchProductosManage();

    } catch (error) {
        console.error(error);
        showProductoManageError('No se pudo conectar con el servidor. Intenta más tarde.');
    }
}

// ==========================================
// UTILIDADES DE UI - PRODUCTOS
// ==========================================
function showProductoCreateError(message) {
    productoCreateErrorMsg.textContent = message;
    productoCreateErrorMsg.classList.remove('d-none');
    productoCreateSuccessMsg.classList.add('d-none');
}

function showProductoCreateSuccess(message) {
    productoCreateSuccessMsg.textContent = message;
    productoCreateSuccessMsg.classList.remove('d-none');
    productoCreateErrorMsg.classList.add('d-none');
}

function hideProductoCreateMessages() {
    productoCreateErrorMsg.classList.add('d-none');
    productoCreateSuccessMsg.classList.add('d-none');
}

function showProductoManageError(message) {
    productoManageErrorMsg.textContent = message;
    productoManageErrorMsg.classList.remove('d-none');
    productoManageSuccessMsg.classList.add('d-none');
}

function showProductoManageSuccess(message) {
    productoManageSuccessMsg.textContent = message;
    productoManageSuccessMsg.classList.remove('d-none');
    productoManageErrorMsg.classList.add('d-none');
}

function hideProductoManageMessages() {
    productoManageErrorMsg.classList.add('d-none');
    productoManageSuccessMsg.classList.add('d-none');
}

// ==========================================
// ELEMENTOS DEL DOM - CATEGORÍAS
// ==========================================
const categoriaCreateForm = document.getElementById('categoriaCreateForm');
const categoriaCreateErrorMsg = document.getElementById('categoriaCreateErrorMsg');
const categoriaCreateSuccessMsg = document.getElementById('categoriaCreateSuccessMsg');

const categoriasManageTableBody = document.getElementById('categoriasManageTableBody');
const categoriaManageErrorMsg = document.getElementById('categoriaManageErrorMsg');
const categoriaManageSuccessMsg = document.getElementById('categoriaManageSuccessMsg');

const categoriaEditFormContainer = document.getElementById('categoriaEditFormContainer');
const categoriaEditForm = document.getElementById('categoriaEditForm');
const categoriaEditCancelBtn = document.getElementById('categoriaEditCancelBtn');

// ==========================================
// ELEMENTOS DEL DOM - TAB DE CATEGORÍAS (para saber cuándo cargar)
// ==========================================
const tabCategoriasBtn = document.getElementById('tab-categorias-btn');
let categoriasTabCargada = false; // evita refetch innecesario cada vez que se abre la tab

// ==========================================
// INICIALIZACIÓN (agregar dentro del DOMContentLoaded ya existente)
// ==========================================
// NOTA: agrega estas líneas dentro del bloque "if (!token) {...} return;" ya existente,
// justo después de "productoEditCancelBtn.addEventListener(...)":

categoriaCreateForm.addEventListener('submit', handleCategoriaCreate);
categoriaEditForm.addEventListener('submit', handleCategoriaEditSubmit);
categoriaEditCancelBtn.addEventListener('click', hideCategoriaEditForm);

// Cargamos la tabla de categorías solo la primera vez que se abre esa tab
tabCategoriasBtn.addEventListener('shown.bs.tab', () => {
    if (!categoriasTabCargada) {
        fetchCategoriasManage();
        categoriasTabCargada = true;
    }
});

// ==========================================
// CATEGORÍAS: CREAR
// ==========================================
async function handleCategoriaCreate(event) {
    event.preventDefault();
    hideCategoriaCreateMessages();

    const categoria = {
        nombre: document.getElementById('categoriaNombre').value.trim(),
        descripcion: document.getElementById('categoriaDescripcion').value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoria)
        });

        if (handleAuthError(response)) return;

        if (!response.ok) {
            showCategoriaCreateError('No se pudo crear la categoría. Verifica los datos e intenta de nuevo.');
            return;
        }

        showCategoriaCreateSuccess('Categoría creada exitosamente.');
        categoriaCreateForm.reset();

        // Refrescamos tanto la tabla de categorías como la cache usada por el select de productos
        await fetchCategoriasParaSelect();
        fetchCategoriasManage();

    } catch (error) {
        console.error(error);
        showCategoriaCreateError('No se pudo conectar con el servidor. Intenta más tarde.');
    }
}

// ==========================================
// CATEGORÍAS: LISTAR (tabla de gestión)
// ==========================================
async function fetchCategoriasManage() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias/`);
        if (!response.ok) throw new Error('Error al obtener categorías');

        const categorias = await response.json();
        renderCategoriasManageTable(categorias);

    } catch (error) {
        console.error(error);
        categoriasManageTableBody.innerHTML = `<tr><td colspan="5" class="text-danger">No se pudieron cargar las categorías.</td></tr>`;
    }
}

function renderCategoriasManageTable(categorias) {
    if (!categorias || categorias.length === 0) {
        categoriasManageTableBody.innerHTML = `<tr><td colspan="5">No hay categorías registradas.</td></tr>`;
        return;
    }

    categoriasManageTableBody.innerHTML = categorias.map(categoria => {
        const totalProductos = categoria.productos ? categoria.productos.length : 0;
        return `
            <tr data-id="${categoria.id}">
                <td>${categoria.id}</td>
                <td>${categoria.nombre}</td>
                <td>${categoria.descripcion}</td>
                <td>${totalProductos}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-edit-categoria" data-id="${categoria.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger btn-delete-categoria" data-id="${categoria.id}" ${totalProductos > 0 ? 'disabled title="No se puede eliminar: tiene productos asociados"' : ''}>Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');

    document.querySelectorAll('.btn-edit-categoria').forEach(btn => {
        btn.addEventListener('click', () => showCategoriaEditForm(btn.dataset.id, categorias));
    });

    document.querySelectorAll('.btn-delete-categoria').forEach(btn => {
        btn.addEventListener('click', () => handleCategoriaDelete(btn.dataset.id));
    });
}

// ==========================================
// CATEGORÍAS: EDITAR
// ==========================================
function showCategoriaEditForm(id, categorias) {
    const categoria = categorias.find(c => c.id === parseInt(id, 10));
    if (!categoria) return;

    document.getElementById('categoriaEditId').value = categoria.id;
    document.getElementById('categoriaEditNombre').value = categoria.nombre;
    document.getElementById('categoriaEditDescripcion').value = categoria.descripcion;

    hideCategoriaManageMessages();
    categoriaEditFormContainer.classList.remove('d-none');
    categoriaEditFormContainer.scrollIntoView({ behavior: 'smooth' });
}

function hideCategoriaEditForm() {
    categoriaEditFormContainer.classList.add('d-none');
    categoriaEditForm.reset();
}

async function handleCategoriaEditSubmit(event) {
    event.preventDefault();
    hideCategoriaManageMessages();

    const id = document.getElementById('categoriaEditId').value;

    const categoria = {
        id: parseInt(id, 10),
        nombre: document.getElementById('categoriaEditNombre').value.trim(),
        descripcion: document.getElementById('categoriaEditDescripcion').value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoria)
        });

        if (handleAuthError(response)) return;

        if (!response.ok) {
            showCategoriaManageError('No se pudo actualizar la categoría. Intenta de nuevo.');
            return;
        }

        showCategoriaManageSuccess('Categoría actualizada exitosamente.');
        hideCategoriaEditForm();

        await fetchCategoriasParaSelect();
        fetchCategoriasManage();

    } catch (error) {
        console.error(error);
        showCategoriaManageError('No se pudo conectar con el servidor. Intenta más tarde.');
    }
}

// ==========================================
// CATEGORÍAS: ELIMINAR
// ==========================================
async function handleCategoriaDelete(id) {
    hideCategoriaManageMessages();

    const confirmar = confirm('¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (handleAuthError(response)) return;

        if (!response.ok) {
            showCategoriaManageError('No se pudo eliminar la categoría. Puede que tenga productos asociados.');
            return;
        }

        showCategoriaManageSuccess('Categoría eliminada exitosamente.');

        await fetchCategoriasParaSelect();
        fetchCategoriasManage();

    } catch (error) {
        console.error(error);
        showCategoriaManageError('No se pudo conectar con el servidor. Intenta más tarde.');
    }
}

// ==========================================
// UTILIDADES DE UI - CATEGORÍAS
// ==========================================
function showCategoriaCreateError(message) {
    categoriaCreateErrorMsg.textContent = message;
    categoriaCreateErrorMsg.classList.remove('d-none');
    categoriaCreateSuccessMsg.classList.add('d-none');
}

function showCategoriaCreateSuccess(message) {
    categoriaCreateSuccessMsg.textContent = message;
    categoriaCreateSuccessMsg.classList.remove('d-none');
    categoriaCreateErrorMsg.classList.add('d-none');
}

function hideCategoriaCreateMessages() {
    categoriaCreateErrorMsg.classList.add('d-none');
    categoriaCreateSuccessMsg.classList.add('d-none');
}

function showCategoriaManageError(message) {
    categoriaManageErrorMsg.textContent = message;
    categoriaManageErrorMsg.classList.remove('d-none');
    categoriaManageSuccessMsg.classList.add('d-none');
}

function showCategoriaManageSuccess(message) {
    categoriaManageSuccessMsg.textContent = message;
    categoriaManageSuccessMsg.classList.remove('d-none');
    categoriaManageErrorMsg.classList.add('d-none');
}

function hideCategoriaManageMessages() {
    categoriaManageErrorMsg.classList.add('d-none');
    categoriaManageSuccessMsg.classList.add('d-none');
}