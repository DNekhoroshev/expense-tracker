package com.expensetracker.backend.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Partial update: a {@code null} field is left unchanged. A blank description clears it.
 */
public record TransactionPatchRequest(

        @DecimalMin("0.01")
        @Digits(integer = 17, fraction = 2)
        BigDecimal amount,

        TransactionType type,

        @Size(max = 255)
        String description,

        LocalDate date,

        Long categoryId
) {
}
