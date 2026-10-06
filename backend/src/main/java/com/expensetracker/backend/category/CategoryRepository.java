package com.expensetracker.backend.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByUser_IdOrderByNameAsc(Long userId);

    Optional<Category> findByIdAndUser_Id(Long id, Long userId);

    boolean existsByUser_IdAndNameIgnoreCase(Long userId, String name);

    boolean existsByUser_IdAndNameIgnoreCaseAndIdNot(Long userId, String name, Long id);
}
