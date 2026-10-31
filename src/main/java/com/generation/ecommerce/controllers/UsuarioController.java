package com.generation.ecommerce.controllers;

import com.generation.ecommerce.dtos.PasswordDto;
import com.generation.ecommerce.models.Usuario;
import com.generation.ecommerce.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path="/ecommerce/usuarios/")
public class UsuarioController {

    private final UsuarioService service;

    @Autowired
    public UsuarioController(UsuarioService service){
        this.service = service;
    }// constructor

    @GetMapping
    public List<Usuario> getUsuarios(){
        return service.getUsuarios();
    }// getUsuarios

    @GetMapping("{id}")
    public Usuario getUsuario(@PathVariable Integer id){
        return service.getUsuario(id);
    }// getUsuario

    @DeleteMapping("{id}")
    public Usuario deleteUsuario(@PathVariable Integer id){
        return service.deleteUsuario(id);
    }// deleteUsuario

    @PostMapping
    public Usuario addUsuario(@RequestBody Usuario usuario){
        return service.addUsuario(usuario);
    }// addUsuario

    @PutMapping("{id}")
    public Usuario updateUsuario(@PathVariable Integer id,
                                 @RequestBody PasswordDto dto){
        return service.updateUsuario(id, dto);
    }// updateUsuario

}// class UsuarioController
