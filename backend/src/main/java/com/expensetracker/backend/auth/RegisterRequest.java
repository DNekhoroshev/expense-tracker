package com.expensetracker.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @NotBlank
        @Email
        String email,

        // 72 bytes is BCrypt's effective input limit.
        @NotBlank
        @Size(min = 8, max = 72)
        String password
) {
}
