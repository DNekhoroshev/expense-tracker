package com.expensetracker.backend.category;

import com.expensetracker.backend.transaction.TransactionRepository;
import com.expensetracker.backend.user.User;
import com.expensetracker.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository,
                           TransactionRepository transactionRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll(Long userId) {
        return categoryRepository.findAllByUser_IdOrderByNameAsc(userId).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findOne(Long userId, Long categoryId) {
        return CategoryResponse.from(requireOwned(userId, categoryId));
    }

    @Transactional
    public CategoryResponse create(Long userId, CategoryRequest request) {
        String name = request.name().trim();

        if (categoryRepository.existsByUser_IdAndNameIgnoreCase(userId, name)) {
            throw nameAlreadyUsed();
        }

        User user = userRepository.getReferenceById(userId);
        Category category = new Category(user, name, normalizeColor(request.color()), request.icon().trim());

        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long userId, Long categoryId, CategoryRequest request) {
        Category category = requireOwned(userId, categoryId);
        String name = request.name().trim();

        if (categoryRepository.existsByUser_IdAndNameIgnoreCaseAndIdNot(userId, name, categoryId)) {
            throw nameAlreadyUsed();
        }

        category.update(name, normalizeColor(request.color()), request.icon().trim());

        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long userId, Long categoryId) {
        Category category = requireOwned(userId, categoryId);

        if (transactionRepository.existsByCategory_Id(categoryId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category has transactions");
        }

        categoryRepository.delete(category);
    }

    /**
     * Looks the category up scoped to its owner, so another user's id reads as "not found"
     * rather than leaking that the category exists.
     */
    private Category requireOwned(Long userId, Long categoryId) {
        return categoryRepository.findByIdAndUser_Id(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    private ResponseStatusException nameAlreadyUsed() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Category with this name already exists");
    }

    private String normalizeColor(String color) {
        return color.trim().toLowerCase();
    }
}
