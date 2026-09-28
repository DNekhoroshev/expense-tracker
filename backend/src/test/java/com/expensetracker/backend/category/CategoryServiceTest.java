package com.expensetracker.backend.category;

import com.expensetracker.backend.transaction.TransactionRepository;
import com.expensetracker.backend.user.User;
import com.expensetracker.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    private static final Long USER_ID = 1L;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    private CategoryService categoryService;

    private final User user = new User("Test User", "test@example.com", "hash");

    @BeforeEach
    void setUp() {
        categoryService = new CategoryService(categoryRepository, userRepository, transactionRepository);
    }

    @Test
    void create_trimsNameAndNormalizesColor() {
        CategoryRequest request = new CategoryRequest("  Groceries  ", "#4F46E5", " cart ");

        when(categoryRepository.existsByUser_IdAndNameIgnoreCase(USER_ID, "Groceries")).thenReturn(false);
        when(userRepository.getReferenceById(USER_ID)).thenReturn(user);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryResponse response = categoryService.create(USER_ID, request);

        ArgumentCaptor<Category> captor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(captor.capture());
        Category saved = captor.getValue();

        assertThat(saved.getName()).isEqualTo("Groceries");
        assertThat(saved.getColor()).isEqualTo("#4f46e5");
        assertThat(saved.getIcon()).isEqualTo("cart");
        assertThat(saved.getUser()).isSameAs(user);
        assertThat(response.name()).isEqualTo("Groceries");
    }

    @Test
    void create_duplicateName_throwsConflict() {
        CategoryRequest request = new CategoryRequest("Groceries", "#4f46e5", "cart");
        when(categoryRepository.existsByUser_IdAndNameIgnoreCase(USER_ID, "Groceries")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.create(USER_ID, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("409");

        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void findAll_returnsOnlyOwnCategories() {
        Category category = new Category(user, "Groceries", "#4f46e5", "cart");
        when(categoryRepository.findAllByUser_IdOrderByNameAsc(USER_ID)).thenReturn(List.of(category));

        List<CategoryResponse> responses = categoryService.findAll(USER_ID);

        assertThat(responses).singleElement()
                .satisfies(response -> assertThat(response.name()).isEqualTo("Groceries"));
        verify(categoryRepository).findAllByUser_IdOrderByNameAsc(USER_ID);
    }

    @Test
    void update_appliesNewValues() {
        Category category = new Category(user, "Groceries", "#4f46e5", "cart");
        when(categoryRepository.findByIdAndUser_Id(10L, USER_ID)).thenReturn(Optional.of(category));
        when(categoryRepository.existsByUser_IdAndNameIgnoreCaseAndIdNot(USER_ID, "Food", 10L)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryResponse response = categoryService.update(USER_ID, 10L, new CategoryRequest("Food", "#10B981", "bowl"));

        assertThat(response.name()).isEqualTo("Food");
        assertThat(category.getColor()).isEqualTo("#10b981");
        assertThat(category.getIcon()).isEqualTo("bowl");
    }

    @Test
    void update_otherUsersCategory_throwsNotFound() {
        when(categoryRepository.findByIdAndUser_Id(10L, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.update(USER_ID, 10L, new CategoryRequest("Food", "#10b981", "bowl")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void delete_otherUsersCategory_throwsNotFound() {
        when(categoryRepository.findByIdAndUser_Id(10L, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.delete(USER_ID, 10L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");

        verify(categoryRepository, never()).delete(any(Category.class));
    }

    @Test
    void delete_ownCategory_removesIt() {
        Category category = new Category(user, "Groceries", "#4f46e5", "cart");
        when(categoryRepository.findByIdAndUser_Id(10L, USER_ID)).thenReturn(Optional.of(category));

        categoryService.delete(USER_ID, 10L);

        verify(categoryRepository).delete(category);
    }

    @Test
    void delete_categoryWithTransactions_throwsConflict() {
        Category category = new Category(user, "Groceries", "#4f46e5", "cart");
        when(categoryRepository.findByIdAndUser_Id(10L, USER_ID)).thenReturn(Optional.of(category));
        when(transactionRepository.existsByCategory_Id(10L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.delete(USER_ID, 10L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("409");

        verify(categoryRepository, never()).delete(any(Category.class));
    }
}
