package com.expensetracker.backend.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank
        @Size(max = 50)
        String name,

        // Hex color, e.g. #4f46e5.
        @NotBlank
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "must be a hex color such as #4f46e5")
        String color,

        @NotBlank
        @Size(max = 50)
        String icon
) {
}
