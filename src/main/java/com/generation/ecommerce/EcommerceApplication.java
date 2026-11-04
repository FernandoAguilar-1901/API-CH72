package com.generation.ecommerce;

import com.generation.ecommerce.config.JwtFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcommerceApplication.class, args);
	}// main

    @Bean
    public FilterRegistrationBean<JwtFilter> jwtFilter(){

        // Creamos la instancia del registro de nuestro filtro JwtFilter
        FilterRegistrationBean<JwtFilter> registrationBean = new FilterRegistrationBean<>();

        // Registramos el filtro
        registrationBean.setFilter(new JwtFilter());

        // Agregamos las rutas que queremos proteger gracias a este filtro
        registrationBean.addUrlPatterns("/ecommerce/productos/*");
        registrationBean.addUrlPatterns("/ecommerce/usuarios/*");

        return registrationBean;
    }// jwtFilter

}// class Ecommerce
