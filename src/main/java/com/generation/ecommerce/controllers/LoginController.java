package com.generation.ecommerce.controllers;

import com.generation.ecommerce.dtos.LoginRequest;
import com.generation.ecommerce.dtos.TokenJwt;
import com.generation.ecommerce.services.JwtService;
import jakarta.servlet.ServletException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path="/ecommerce/login")
public class LoginController {

    private final JwtService service;

    @Autowired
    public LoginController(JwtService service){
        this.service = service;
    }// constructor

    @PostMapping
    public TokenJwt validarUsuario(@RequestBody LoginRequest request) throws ServletException{

        if( service.validarUsuario(request) ){
            return new TokenJwt( service.generarToken( request.getEmail() ) );
        }// if usuario es válido

        throw new ServletException("> Error de login: correo o contraseña incorrectos.");

    }// validarUsuario

}// class LoginController
