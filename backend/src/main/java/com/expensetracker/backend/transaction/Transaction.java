package com.expensetracker.backend.transaction;

import com.expensetracker.backend.category.Category;
import com.expensetracker.backend.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
        name = "transactions",
        indexes = @Index(name = "idx_transactions_user_date", columnList = "user_id, transaction_date")
)
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Column
    private String description;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Transaction() {
        // JPA
    }

    public Transaction(User user, Category category, BigDecimal amount, TransactionType type,
                       String description, LocalDate date) {
        this.user = user;
        this.category = category;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.date = date;
    }

    public void update(Category category, BigDecimal amount, TransactionType type,
                       String description, LocalDate date) {
        this.category = category;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getDate() {
        return date;
    }

    public Category getCategory() {
        return category;
    }

    /** Reads the foreign key off the proxy, so it never triggers a lazy load. */
    public Long getCategoryId() {
        return category.getId();
    }

    public User getUser() {
        return user;
    }

    /** Reads the foreign key off the proxy, so it never triggers a lazy load. */
    public Long getUserId() {
        return user.getId();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
