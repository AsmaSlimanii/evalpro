package com.medianet.evalpro.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
    public class AuthResponse {
    private String token;
    private String message;
    private String role; // 👈 AJOUT ICI
}
