package com.generation.ecommerce.controllers;

import com.generation.ecommerce.models.Producto;
import com.generation.ecommerce.services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path="/ecommerce/productos/")
public class ProductoController {

    private final ProductoService service;

    @Autowired // Gestiona la inyección de dependencias de forma automática
    public ProductoController(ProductoService service){
        this.service = service; // new ProductoService() -> Esto lo gestiona y lo hace Spring Boot por nosotros/as
    }// constructor

    @GetMapping
    public List<Producto> getProductos(){
        return service.getProductos();
    }// getProductos

    @GetMapping("{id}")
    public Producto getProducto(@PathVariable Integer id){
        return service.getProducto(id);
    }// getProductos

    @DeleteMapping("{id}")
    public Producto deleteProducto(@PathVariable Integer id){
        return service.deleteProducto(id);
    }// deleteProducto

    @PostMapping
    public Producto addProducto(@RequestBody Producto producto){// Solicita los datos del producto en el cuerpo de la solicitud (JSON)
        return service.addProducto(producto);
    }// addProducto

    @PutMapping("{id}")
    public Producto updateProducto(@PathVariable Integer id,
                                   @RequestParam(required = false) String nombre,
                                   @RequestParam(required = false) String descripcion,
                                   @RequestParam(required = false) String imagen,
                                   @RequestParam(required = false) Double precio,
                                   @RequestParam(required = false) Integer existencias){ // Solicita los datos que actualizaremos en la URL de la solicitud
        return service.updateProducto(id, nombre, descripcion, imagen, precio, existencias);
    }// updateProducto


} // class ProductoController
