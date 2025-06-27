package com.finance.tracker.repository;

import com.finance.tracker.model.Budget;
import com.finance.tracker.model.User;
import com.finance.tracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUser(User user);

    Optional<Budget> findByUserAndCategory(User user, Category category);

    List<Budget> findByUserAndCategory_Type(User user, Category.CategoryType categoryType);

    boolean existsByUserAndCategory(User user, Category category);
}