package com.Haat_Bazar.auth_service.service;

import com.Haat_Bazar.auth_service.dto.AuthResponse;
import com.Haat_Bazar.auth_service.dto.LoginRequest;
import com.Haat_Bazar.auth_service.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
