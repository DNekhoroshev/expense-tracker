package com.expensetracker.backend.transaction;

import com.expensetracker.backend.category.Category;
import com.expensetracker.backend.category.CategoryRepository;
import com.expensetracker.backend.user.User;
import com.expensetracker.backend.user.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              CategoryRepository categoryRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    /** Lists a month's transactions, or a whole year's when {@code month} is null, with the period's totals. */
    @Transactional(readOnly = true)
    public TransactionListResponse findAll(Long userId, int year, Integer month) {
        LocalDate from;
        LocalDate to;
        if (month == null) {
            from = LocalDate.of(year, 1, 1);
            to = LocalDate.of(year, 12, 31);
        } else {
            YearMonth yearMonth = YearMonth.of(year, month);
            from = yearMonth.atDay(1);
            to = yearMonth.atEndOfMonth();
        }

        List<TransactionResponse> items = transactionRepository
                .findAllByUser_IdAndDateBetweenOrderByDateDescIdDesc(userId, from, to).stream()
                .map(TransactionResponse::from)
                .toList();

        BigDecimal totalIncome = sum(items, TransactionType.INCOME);
        BigDecimal totalExpense = sum(items, TransactionType.EXPENSE);

        return new TransactionListResponse(year, month, items, totalIncome, totalExpense,
                totalIncome.subtract(totalExpense));
    }

    /** Pages through all of the user's transactions, newest first, in the same order as {@link #findAll}. */
    @Transactional(readOnly = true)
    public TransactionPageResponse findRecent(Long userId, int page, int size) {
        Sort newestFirst = Sort.by(Sort.Direction.DESC, "date").and(Sort.by(Sort.Direction.DESC, "id"));
        return TransactionPageResponse.from(
                transactionRepository.findAllByUser_Id(userId, PageRequest.of(page, size, newestFirst)));
    }

    @Transactional(readOnly = true)
    public TransactionResponse findOne(Long userId, Long transactionId) {
        return TransactionResponse.from(requireOwned(userId, transactionId));
    }

    @Transactional
    public TransactionResponse create(Long userId, TransactionRequest request) {
        Category category = requireOwnedCategory(userId, request.categoryId());
        User user = userRepository.getReferenceById(userId);

        Transaction transaction = new Transaction(user, category, request.amount(), request.type(),
                normalizeDescription(request.description()), request.date());

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse update(Long userId, Long transactionId, TransactionPatchRequest request) {
        Transaction transaction = requireOwned(userId, transactionId);

        Category category = request.categoryId() != null
                ? requireOwnedCategory(userId, request.categoryId())
                : transaction.getCategory();

        transaction.update(
                category,
                request.amount() != null ? request.amount() : transaction.getAmount(),
                request.type() != null ? request.type() : transaction.getType(),
                request.description() != null
                        ? normalizeDescription(request.description())
                        : transaction.getDescription(),
                request.date() != null ? request.date() : transaction.getDate()
        );

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(Long userId, Long transactionId) {
        transactionRepository.delete(requireOwned(userId, transactionId));
    }

    /**
     * Looks the transaction up scoped to its owner, so another user's id reads as "not found"
     * rather than leaking that the transaction exists.
     */
    private Transaction requireOwned(Long userId, Long transactionId) {
        return transactionRepository.findByIdAndUser_Id(transactionId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    /** The category comes from the request body, so a missing or foreign one is a bad request, not a 404. */
    private Category requireOwnedCategory(Long userId, Long categoryId) {
        return categoryRepository.findByIdAndUser_Id(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }

    private BigDecimal sum(List<TransactionResponse> items, TransactionType type) {
        return items.stream()
                .filter(item -> item.type() == type)
                .map(TransactionResponse::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
