package com.expensetracker.backend.transaction;

import java.math.BigDecimal;
import java.util.List;

/** Transactions of a period (a month, or a whole year when {@code month} is null) with its totals. */
public record TransactionListResponse(
        int year,
        Integer month,
        List<TransactionResponse> items,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance
) {
}
