package com.finance.tracker.service;

import com.finance.tracker.model.Budget;
import com.finance.tracker.model.User;
import com.finance.tracker.model.Category;
import com.finance.tracker.repository.BudgetRepository;
import com.finance.tracker.repository.UserRepository;
import com.finance.tracker.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public BudgetService(BudgetRepository budgetRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Budget> listBudgetsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return budgetRepository.findByUser(user);
    }

    public List<Budget> listBudgetsByUserAndCategoryType(Long userId, Category.CategoryType categoryType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return budgetRepository.findByUserAndCategory_Type(user, categoryType);
    }

    public Optional<Budget> findById(Long id) {
        return budgetRepository.findById(id);
    }

    public Optional<Budget> findByUserAndCategory(Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));
        return budgetRepository.findByUserAndCategory(user, category);
    }

    public Budget createBudget(Long userId, Long categoryId, BigDecimal monthlyLimit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));

        if (budgetRepository.existsByUserAndCategory(user, category)) {
            throw new IllegalArgumentException("Budget already exists for user and category");
        }

        if (monthlyLimit == null || monthlyLimit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Monthly limit must be greater than zero");
        }

        Budget budget = new Budget(user, category, monthlyLimit);
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Long id, Long userId, Long categoryId, BigDecimal monthlyLimit) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found with id: " + id));

        // Verify the budget belongs to the user
        if (!budget.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Budget does not belong to the specified user");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));

        // Check if we're changing the category and if a budget already exists for the
        // new category
        if (!budget.getCategory().getId().equals(categoryId) &&
                budgetRepository.existsByUserAndCategory(user, category)) {
            throw new IllegalArgumentException("Budget already exists for user and category");
        }

        if (monthlyLimit == null || monthlyLimit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Monthly limit must be greater than zero");
        }

        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonthlyLimit(monthlyLimit);

        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id, Long userId) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found with id: " + id));

        // Verify the budget belongs to the user
        if (!budget.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Budget does not belong to the specified user");
        }

        budgetRepository.deleteById(id);
    }

    public boolean existsByUserAndCategory(Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));
        return budgetRepository.existsByUserAndCategory(user, category);
    }
}