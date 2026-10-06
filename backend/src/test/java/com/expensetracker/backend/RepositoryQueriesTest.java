package com.expensetracker.backend;

import com.expensetracker.backend.category.CategoryRepository;
import com.expensetracker.backend.transaction.TransactionRepository;
import com.expensetracker.backend.transaction.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Runs every derived query against the real database. Service tests mock the
 * repositories, so a query Hibernate cannot translate (e.g. a {@code UserId}
 * path that Spring Data resolves to the {@code getUserId()} getter instead of
 * {@code user.id}) only shows up here.
 */
@SpringBootTest
@Transactional
class RepositoryQueriesTest {

    private static final Long MISSING = -1L;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Test
    void categoryQueriesTranslate() {
        assertThat(categoryRepository.findAllByUser_IdOrderByNameAsc(MISSING)).isEmpty();
        assertThat(categoryRepository.findByIdAndUser_Id(MISSING, MISSING)).isEmpty();
        assertThat(categoryRepository.existsByUser_IdAndNameIgnoreCase(MISSING, "x")).isFalse();
        assertThat(categoryRepository.existsByUser_IdAndNameIgnoreCaseAndIdNot(MISSING, "x", MISSING)).isFalse();
    }

    @Test
    void transactionQueriesTranslate() {
        LocalDate today = LocalDate.now();
        assertThat(transactionRepository.findAllByUser_IdAndDateBetweenOrderByDateDescIdDesc(MISSING, today, today))
                .isEmpty();
        assertThat(transactionRepository.findAllByUser_Id(MISSING,
                PageRequest.of(0, 10, TransactionService.NEWEST_FIRST))).isEmpty();
        assertThat(transactionRepository.findByIdAndUser_Id(MISSING, MISSING)).isEmpty();
        assertThat(transactionRepository.existsByCategory_Id(MISSING)).isFalse();
    }
}
