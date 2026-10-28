# 🛒 Ecommerce API - Módulo de Productos

Este es un proyecto backend desarrollado con **Spring Boot** que expone una API RESTful para la gestión de productos en una plataforma de comercio electrónico.

## Tecnologías utilizadas
* Java
* Spring Boot (Spring Web, Spring Dependency Injection)
* Postman (para pruebas de endpoints)

---

## 🛠️ Guía de Pruebas con Postman

A continuación se detallan las instrucciones para probar cada uno de los métodos HTTP (`GET`, `POST`, `PUT`, `DELETE`) expuestos en el controlador `ProductoController`.

> 💡 **Nota:** Se asume que el servidor local corre en el puerto predeterminado de Spring Boot: `http://localhost:8080`.

### 1. Obtener todos los productos (GET)
Devuelve la lista completa de productos registrados.

* **Método:** `GET`
* **URL:** `http://localhost:8080/ecommerce/productos/`
* **Instrucciones en Postman:** Selecciona el método **GET**, pega la URL y haz clic en **Send**.

### 2. Obtener un producto por ID (GET)
Busca y devuelve un producto específico mediante su identificador único.

* **Método:** `GET`
* **URL:** `http://localhost:8080/ecommerce/productos/{id}`
* **Ejemplo de URL:** `http://localhost:8080/ecommerce/productos/1`
* **Instrucciones en Postman:** Reemplaza `{id}` con el número del ID que deseas buscar y haz clic en **Send**.

### 3. Agregar un nuevo producto (POST)
Crea un nuevo registro de producto enviando sus datos dentro del cuerpo de la solicitud en formato JSON.

* **Método:** `POST`
* **URL:** `http://localhost:8080/ecommerce/productos/`
* **Configuración en Postman:**
    1. Cambia el método a **POST** e ingresa la URL.
    2. Ve a la pestaña **Body** debajo de la barra de direcciones.
    3. Selecciona la opción **raw**.
    4. En el menú desplegable de la derecha (donde dice *Text*), cambia a **JSON**.
    5. Pega un JSON con la estructura de tu entidad `Producto`, por ejemplo:
```json
{
  "nombre": "Teclado Mecánico RGB",
  "descripcion": "Teclado switch azul con luces personalizables",
  "imagen": "teclado.jpg",
  "precio": 1250.00,
  "existencias": 45
}
```
6. Haz clic en **Send**.

### 4. Actualizar un producto existente (PUT)
Modifica las propiedades de un producto mediante su ID. Este endpoint recibe los datos de actualización como parámetros de consulta (*Query Parameters*).

* **Método:** `PUT`
* **URL:** `http://localhost:8080/ecommerce/productos/{id}`
* **Ejemplo de URL con parámetros:** `http://localhost:8080/ecommerce/productos/1?precio=1100.00&existencias=50`
* **Configuración en Postman:**
    1. Cambia el método a **PUT**.
    2. Define el ID del producto a modificar en la URL.
    3. Ve a la pestaña **Params** (debajo de la URL).
    4. En la tabla de `Query Params`, agrega las claves (`Key`) y valores (`Value`) que desees actualizar (estos campos son opcionales):
        * `nombre`
        * `descripcion`
        * `imagen`
        * `precio`
        * `existencias`
    5. Haz clic en **Send**.

### 5. Eliminar un producto (DELETE)
Remueve un producto del sistema utilizando su ID.

* **Método:** `DELETE`
* **URL:** `http://localhost:8080/ecommerce/productos/{id}`
* **Ejemplo de URL:** `http://localhost:8080/ecommerce/productos/1`
* **Instrucciones en Postman:** Cambia el método a **DELETE**, coloca la URL con el ID del producto que deseas borrar y presiona **Send**.
