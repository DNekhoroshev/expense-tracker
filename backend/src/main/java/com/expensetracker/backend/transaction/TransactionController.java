package com.expensetracker.backend.transaction;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /** Defaults to the current year; without {@code month}, covers the whole year. */
    @GetMapping
    public TransactionListResponse findAll(@AuthenticationPrincipal Jwt jwt,
                                           @RequestParam(required = false) @Min(2000) @Max(2100) Integer year,
                                           @RequestParam(required = false) @Min(1) @Max(12) Integer month) {
        int resolvedYear = year != null ? year : LocalDate.now().getYear();
        return transactionService.findAll(currentUserId(jwt), resolvedYear, month);
    }

    @GetMapping("/{id}")
    public TransactionResponse findOne(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return transactionService.findOne(currentUserId(jwt), id);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@AuthenticationPrincipal Jwt jwt,
                                                      @Valid @RequestBody TransactionRequest request) {
        TransactionResponse transaction = transactionService.create(currentUserId(jwt), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @PatchMapping("/{id}")
    public TransactionResponse update(@AuthenticationPrincipal Jwt jwt,
                                      @PathVariable Long id,
                                      @Valid @RequestBody TransactionPatchRequest request) {
        return transactionService.update(currentUserId(jwt), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        transactionService.delete(currentUserId(jwt), id);
    }

    private Long currentUserId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
