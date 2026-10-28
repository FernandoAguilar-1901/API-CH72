package com.generation.ecommerce.services;

import com.generation.ecommerce.models.Producto;
import com.generation.ecommerce.repositories.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository){
        this.repository = repository;
    }// constructor

    public List<Producto> getProductos() {
        return repository.findAll(); // SELECT * FROM Producto;
    }// getProductos

    public Producto getProducto(Integer id) {
        return repository
                .findById(id)
                .orElseThrow( () -> new IllegalArgumentException("El producto con el id [" + id  + "] no existe.") );
    }// getProducto

    public Producto deleteProducto(Integer id) {
        Producto producto = null;

        if( repository.existsById(id) ){ // 1. Buscar el producto por id
            producto = repository.findById(id).get();
            repository.delete(producto);
        }// if

        return producto;
    }// deleteProducto

    public Producto addProducto(Producto producto) {

        if(!producto.getNombre().isBlank() && !producto.getDescripcion().isBlank() && producto.getNombre() != null && producto.getDescripcion() != null){
            repository.save(producto);
        }// if

        return producto;
    }// addProducto

    public Producto updateProducto(Integer id, String nombre, String descripcion, String imagen, Double precio, Integer existencias) {
        Producto producto = null;

        if( repository.existsById(id) ){
            Producto p = repository.findById(id).get();

            if(nombre != null && !nombre.isBlank()) p.setNombre(nombre);
            if(descripcion != null && !descripcion.isBlank()) p.setDescripcion(descripcion);
            if(imagen != null && !imagen.isBlank()) p.setImagen(imagen);
            if(precio != null) p.setPrecio(precio);
            if(existencias != null) p.setExistencias(existencias);

            producto = p;
            repository.save(producto);

        }// if

        return producto;
    }// updateProducto
}// class ProductoService
