package com.generation.ecommerce.services;

import com.generation.ecommerce.dtos.PasswordDto;
import com.generation.ecommerce.models.Usuario;
import com.generation.ecommerce.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    @Autowired
    PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository repository){
        this.repository = repository;
    }// constructor

    public List<Usuario> getUsuarios() {
        return repository.findAll();
    }// getUsuarios

    public Usuario getUsuario(Integer id) {
        return repository
                .findById(id)
                .orElseThrow(()->new IllegalArgumentException("El usuario con el id [" + id + "] no existe"));
    }// getUsuario

    public Usuario deleteUsuario(Integer id) {
        Usuario usuario = null;

        if(repository.existsById(id)){
            usuario = repository.findById(id).get();
            repository.delete(usuario);
        }// if

        return usuario;
    }// deleteUsuario

    public Usuario addUsuario(Usuario usuario) {
        Optional<Usuario> usr = repository.findByEmail( usuario.getEmail() );// Buscamos si ya existe un usuario con el mismo correo

        if( usr.isEmpty() ){// si no existe
            usuario.setPassword(encoder.encode( usuario.getPassword() ));// tomamos la contraseña que envió el usuario y la ciframos
            repository.save(usuario);// después, lo guardamos en la BD
        }// if

        return usuario;// devolvemos el usuario
    }// addUsuario


    public Usuario updateUsuario(Integer id, PasswordDto dto) {
        Usuario usuario = null;

        if(repository.existsById(id)){// pregunta si el usuario con el id indicado existe, si existe:
            Usuario usr = repository.findById(id).get(); // Crea un objeto usr y guarda el usuario encontrado.

            if( encoder.matches(dto.getPasswordActual(), usr.getPassword()) ){// verifica que la contraseña del dto coincida con la contraseña cifrada de la BD
                usr.setPassword( encoder.encode(dto.getPasswordNuevo()) );// Si coinciden, guarda la nueva contraseña indicada en el dto
                usuario = usr;
                repository.save(usuario);// guardamos el usuario actualizado
            }// if
        }// if

        return usuario;
    }// updateUsuario


}// class UsuarioService
