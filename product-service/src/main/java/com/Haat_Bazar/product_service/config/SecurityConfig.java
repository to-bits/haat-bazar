package com.Haat_Bazar.product_service.config;

import com.Haat_Bazar.product_service.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // ---- Product Endpoints ----
                        // Everyone logged in can VIEW products
                        .requestMatchers(HttpMethod.GET, "/api/products/**").authenticated()

                        // Only SELLER and ADMIN can CREATE/UPDATE/DELETE products
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("SELLER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("SELLER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyRole("SELLER", "ADMIN")

                        // ---- Category Endpoints ----
                        // Everyone logged in can VIEW categories
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").authenticated()

                        // Only SELLER and ADMIN can manage categories
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAnyRole("SELLER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAnyRole("SELLER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAnyRole("SELLER", "ADMIN")

                        // ---- Inventory Endpoints ----
                        // Everyone logged in can CHECK availability
                        .requestMatchers(HttpMethod.GET, "/api/inventory/**").authenticated()

                        // Only SELLER and ADMIN can UPDATE stock
                        .requestMatchers(HttpMethod.PUT, "/api/inventory/**").hasAnyRole("SELLER", "ADMIN")

                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}