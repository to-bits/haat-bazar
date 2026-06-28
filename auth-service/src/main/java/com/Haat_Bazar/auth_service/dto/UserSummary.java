package com.Haat_Bazar.auth_service.dto;

import com.Haat_Bazar.auth_service.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSummary {
    private Long id;
    private String name;
    private String email;
    private Role role;
}