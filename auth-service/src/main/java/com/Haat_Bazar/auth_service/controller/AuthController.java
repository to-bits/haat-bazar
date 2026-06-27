package com.Haat_Bazar.auth_service.controller;

import com.Haat_Bazar.auth_service.dto.AuthResponse;
import com.Haat_Bazar.auth_service.dto.LoginRequest;
import com.Haat_Bazar.auth_service.dto.RegisterRequest;
import com.Haat_Bazar.auth_service.security.JwtUtil;
import com.Haat_Bazar.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
            ) {

        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
            ) {

        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, String>> validateToken(
            @RequestParam("token") String token
    ) {

        if (jwtUtil.validateToken(token)) {

            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);

            return ResponseEntity.ok(Map.of(
                    "email", email,
                    "role", role,
                    "valid", "true"
            ));
        }

        return ResponseEntity.status(401)
                .body(Map.of("valid", "false"));
    }
}
