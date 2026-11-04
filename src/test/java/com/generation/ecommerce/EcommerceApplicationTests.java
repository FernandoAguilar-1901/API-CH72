package com.generation.ecommerce;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

// Métodos estáticos corregidos para MockMvc
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get; // Añadido
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content; // Corregido
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EcommerceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void pruebaGet() throws Exception {
        this.mockMvc.perform(get("/ecommerce/productos/3"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("cargador solar")));
    }
}

