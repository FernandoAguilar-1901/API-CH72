package com.generation.ecommerce.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.filter.GenericFilterBean;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class JwtFilter extends GenericFilterBean {

    public static String signature = "¡D3finiend0-Nuestr4Clav3S3cr3t4-PArA-nuestr4-ap1!";

    public static final String secret = Base64
            .getEncoder()
            .encodeToString(signature.getBytes(StandardCharsets.UTF_8));

    public static SecretKey getSignInKey(){
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }// getSignInKey

    /*
     * ServletRequest: Se encarga de interceptar la solicitud del usuario y recuperar datos sobre la misma, ejemplo:
     * encabezados, ruta destino de la solicitud (endpoint).
     *
     * ServletResponse: Salida. Proporciona la respuesta a la solicitud previamente mencionada. Valida si el usuario tiene permisos para
     * continuar con la solicitud (token de acceso).
     *
     * FilterChain: Secuencia ordenada de filtros por los que pasa la solicitud antes de llegar al controlador.
     * */

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) servletRequest;

        if( requiereAutenticacion(httpRequest) ){// Intercepta la solicitud, lee método y ruta de destino, y valida con true o false si necesita token

            String token = obtenerToken(httpRequest);

            validarToken(token);
        }// if

        filterChain.doFilter(servletRequest, servletResponse);
    }// doFilter

    private boolean requiereAutenticacion(HttpServletRequest httpRequest) {// Intercepta la solicitud, lee método y ruta de destino, y valida con true o false si necesita token
        String metodo = httpRequest.getMethod(); // Recupera el método: GET, POST, PUT, DELETE
        String URI = httpRequest.getRequestURI(); // Recupera la ruta destino de la solicitud: /ecommerce/productos/

        /*
        * Cómo funciona la validación?
        *
        * Solicitudes GET que NO APUNTAN a /ecommerce/productos/ necesitan un token
        * Solicitudes POST que NO APUNTAN a /ecommerce/usuarios/ necesitan un token
        * Solicitudes DELETE APUNTANDO A CUALQUIER RUTA necesitan un token
        * Solicitudes PUT APUNTANDO A CUALQUIER RUTA necesitan un token
        *
        * */

        return(metodo.equals("GET") && !URI.contains("/ecommerce/productos/") ||
                metodo.equals("POST") && !URI.contains("/ecommerce/usuarios/") ||
                metodo.equals("DELETE") ||
                metodo.equals("PUT")
                );
    }// requiereAutenticacion

    private String obtenerToken(HttpServletRequest httpRequest) throws ServletException{
        String authHeader = httpRequest.getHeader("Authorization");// Recuperamos el header Authorization

        if( authHeader == null || !authHeader.contains("Bearer ") ){
            throw new ServletException("1. Token inválido. Encabezado Authorization nulo o no contiene {Bearer TOKEN}");
        }// si no existe el encabezado o no contiene el token

        return authHeader.substring(7); // Reecorta la parte de "Bearer " con todo y espacio del Authorization header, recupera solamente el token
    }// obtenerToken


    /*
     * Jwts: Clase de jjwt que permite crear y leer tokens jwt
     *
     * parser(): inicializa los componentes que permiten leer y desencriptar la info de cada token
     * verifyWith(): indica que se validará con la firma secreta la autenticidad del token
     * build(): construye el parser con la configuración anterior
     * parseSignedClaims(token): descifra y verifica la firma del token, si es válido, continúa
     * getPayload(): recupera el cuerpo del token, que tiene la info del usuario, momento en que se creó el token
     * para validar si no ha expirado, etc.
     * */

    private void validarToken(String token) throws ServletException{

        try{
            Claims claims = Jwts
                    .parser()
                    .verifyWith( getSignInKey() )
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            System.out.println(claims.getSubject());

        } catch (SignatureException | MalformedJwtException | ExpiredJwtException e){

            throw new ServletException("2. Token inválido. Verifica que contenga la firma correcta, que no haya sido manipulado o que no esté expirado.");

        }// catch

    }// validarToken

}// class JwtFilter
