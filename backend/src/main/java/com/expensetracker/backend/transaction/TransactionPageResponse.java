package com.expensetracker.backend.transaction;

import org.springframework.data.domain.Page;

import java.util.List;

/** One page of a user's transactions, newest first; {@code page} is zero-based. */
public record TransactionPageResponse(
        List<TransactionResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    public static TransactionPageResponse from(Page<Transaction> page) {
        return new TransactionPageResponse(
                page.getContent().stream().map(TransactionResponse::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
