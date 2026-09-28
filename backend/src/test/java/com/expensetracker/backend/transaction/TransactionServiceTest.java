package com.expensetracker.backend.transaction;

import com.expensetracker.backend.category.Category;
import com.expensetracker.backend.category.CategoryRepository;
import com.expensetracker.backend.user.User;
import com.expensetracker.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    private static final Long USER_ID = 1L;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    private TransactionService transactionService;

    private final User user = new User("Test User", "test@example.com", "hash");
    private final Category groceries = new Category(user, "Groceries", "#4f46e5", "cart");
    private final Category salary = new Category(user, "Salary", "#10b981", "wallet");

    @BeforeEach
    void setUp() {
        transactionService = new TransactionService(transactionRepository, categoryRepository, userRepository);
    }

    @Test
    void create_trimsDescriptionAndLinksUserAndCategory() {
        TransactionRequest request = new TransactionRequest(
                new BigDecimal("12.50"), TransactionType.EXPENSE, "  Milk  ", LocalDate.of(2026, 9, 1), 5L);

        when(categoryRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(groceries));
        when(userRepository.getReferenceById(USER_ID)).thenReturn(user);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionResponse response = transactionService.create(USER_ID, request);

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        Transaction saved = captor.getValue();

        assertThat(saved.getDescription()).isEqualTo("Milk");
        assertThat(saved.getUser()).isSameAs(user);
        assertThat(saved.getCategory()).isSameAs(groceries);
        assertThat(saved.getAmount()).isEqualByComparingTo("12.50");
        assertThat(response.type()).isEqualTo(TransactionType.EXPENSE);
    }

    @Test
    void create_blankDescription_storesNull() {
        TransactionRequest request = new TransactionRequest(
                new BigDecimal("1.00"), TransactionType.EXPENSE, "   ", LocalDate.of(2026, 9, 1), 5L);

        when(categoryRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(groceries));
        when(userRepository.getReferenceById(USER_ID)).thenReturn(user);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionResponse response = transactionService.create(USER_ID, request);

        assertThat(response.description()).isNull();
    }

    @Test
    void create_otherUsersCategory_throwsBadRequest() {
        TransactionRequest request = new TransactionRequest(
                new BigDecimal("12.50"), TransactionType.EXPENSE, null, LocalDate.of(2026, 9, 1), 5L);
        when(categoryRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.create(USER_ID, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");

        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void findAll_month_usesMonthBoundsAndComputesTotals() {
        LocalDate from = LocalDate.of(2028, 2, 1);
        LocalDate to = LocalDate.of(2028, 2, 29);
        when(transactionRepository.findAllByUserIdAndDateBetweenOrderByDateDescIdDesc(USER_ID, from, to))
                .thenReturn(List.of(
                        transaction(salary, "1000.00", TransactionType.INCOME),
                        transaction(groceries, "120.25", TransactionType.EXPENSE),
                        transaction(groceries, "79.75", TransactionType.EXPENSE)
                ));

        TransactionListResponse response = transactionService.findAll(USER_ID, 2028, 2);

        assertThat(response.year()).isEqualTo(2028);
        assertThat(response.month()).isEqualTo(2);
        assertThat(response.items()).hasSize(3);
        assertThat(response.totalIncome()).isEqualByComparingTo("1000.00");
        assertThat(response.totalExpense()).isEqualByComparingTo("200.00");
        assertThat(response.balance()).isEqualByComparingTo("800.00");
    }

    @Test
    void findAll_withoutMonth_usesYearBounds() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 12, 31);
        when(transactionRepository.findAllByUserIdAndDateBetweenOrderByDateDescIdDesc(USER_ID, from, to))
                .thenReturn(List.of());

        TransactionListResponse response = transactionService.findAll(USER_ID, 2026, null);

        assertThat(response.month()).isNull();
        assertThat(response.items()).isEmpty();
        assertThat(response.totalIncome()).isEqualByComparingTo("0");
        assertThat(response.totalExpense()).isEqualByComparingTo("0");
        assertThat(response.balance()).isEqualByComparingTo("0");
    }

    @Test
    void findRecent_requestsNewestFirstPageAndMapsIt() {
        when(transactionRepository.findAllByUserId(any(), any(Pageable.class)))
                .thenAnswer(invocation -> new PageImpl<>(
                        List.of(transaction(groceries, "12.50", TransactionType.EXPENSE)),
                        invocation.getArgument(1), 21));

        TransactionPageResponse response = transactionService.findRecent(USER_ID, 1, 10);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(transactionRepository).findAllByUserId(eq(USER_ID), captor.capture());
        Pageable pageable = captor.getValue();

        assertThat(pageable.getPageNumber()).isEqualTo(1);
        assertThat(pageable.getPageSize()).isEqualTo(10);
        assertThat(pageable.getSort()).containsExactly(Sort.Order.desc("date"), Sort.Order.desc("id"));

        assertThat(response.items()).hasSize(1);
        assertThat(response.page()).isEqualTo(1);
        assertThat(response.size()).isEqualTo(10);
        assertThat(response.totalElements()).isEqualTo(21);
        assertThat(response.totalPages()).isEqualTo(3);
    }

    @Test
    void update_changesOnlyProvidedFields() {
        Transaction transaction = new Transaction(user, groceries, new BigDecimal("12.50"),
                TransactionType.EXPENSE, "Milk", LocalDate.of(2026, 9, 1));
        when(transactionRepository.findByIdAndUserId(10L, USER_ID)).thenReturn(Optional.of(transaction));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        transactionService.update(USER_ID, 10L,
                new TransactionPatchRequest(new BigDecimal("15.00"), null, null, null, null));

        assertThat(transaction.getAmount()).isEqualByComparingTo("15.00");
        assertThat(transaction.getType()).isEqualTo(TransactionType.EXPENSE);
        assertThat(transaction.getDescription()).isEqualTo("Milk");
        assertThat(transaction.getDate()).isEqualTo(LocalDate.of(2026, 9, 1));
        assertThat(transaction.getCategory()).isSameAs(groceries);
        verify(categoryRepository, never()).findByIdAndUserId(any(), any());
    }

    @Test
    void update_newCategory_mustBeOwned() {
        Transaction transaction = new Transaction(user, groceries, new BigDecimal("12.50"),
                TransactionType.EXPENSE, "Milk", LocalDate.of(2026, 9, 1));
        when(transactionRepository.findByIdAndUserId(10L, USER_ID)).thenReturn(Optional.of(transaction));
        when(categoryRepository.findByIdAndUserId(7L, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.update(USER_ID, 10L,
                new TransactionPatchRequest(null, null, null, null, 7L)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");

        assertThat(transaction.getCategory()).isSameAs(groceries);
    }

    @Test
    void findOne_otherUsersTransaction_throwsNotFound() {
        when(transactionRepository.findByIdAndUserId(10L, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.findOne(USER_ID, 10L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void update_otherUsersTransaction_throwsNotFound() {
        when(transactionRepository.findByIdAndUserId(10L, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.update(USER_ID, 10L,
                new TransactionPatchRequest(new BigDecimal("1.00"), null, null, null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void delete_otherUsersTransaction_throwsNotFound() {
        when(transactionRepository.findByIdAndUserId(10L, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.delete(USER_ID, 10L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");

        verify(transactionRepository, never()).delete(any(Transaction.class));
    }

    @Test
    void delete_ownTransaction_removesIt() {
        Transaction transaction = transaction(groceries, "12.50", TransactionType.EXPENSE);
        when(transactionRepository.findByIdAndUserId(10L, USER_ID)).thenReturn(Optional.of(transaction));

        transactionService.delete(USER_ID, 10L);

        verify(transactionRepository).delete(transaction);
    }

    private Transaction transaction(Category category, String amount, TransactionType type) {
        return new Transaction(user, category, new BigDecimal(amount), type, null, LocalDate.of(2026, 9, 1));
    }
}
