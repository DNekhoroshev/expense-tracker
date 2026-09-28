package com.expensetracker.backend.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByUserIdAndDateBetweenOrderByDateDescIdDesc(Long userId, LocalDate from, LocalDate to);

    Page<Transaction> findAllByUserId(Long userId, Pageable pageable);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    boolean existsByCategoryId(Long categoryId);
}
