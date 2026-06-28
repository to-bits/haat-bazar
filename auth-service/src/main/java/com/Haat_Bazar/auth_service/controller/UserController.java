package com.Haat_Bazar.auth_service.controller;

import com.Haat_Bazar.auth_service.dto.UserSummary;
import com.Haat_Bazar.auth_service.entity.User;
import com.Haat_Bazar.auth_service.repository.UserRepository;
import com.Haat_Bazar.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    /**
     * Resolve the currently authenticated user from the JWT.
     * Used by the frontend to look up the numeric userId for cart/order calls.
     */
    @GetMapping("/me")
    public ResponseEntity<UserSummary> me(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(UserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build());
    }
}