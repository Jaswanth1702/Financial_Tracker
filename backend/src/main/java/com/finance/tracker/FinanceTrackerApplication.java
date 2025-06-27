package com.finance.tracker;

import com.finance.tracker.model.Category;
import com.finance.tracker.service.CategoryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class FinanceTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceTrackerApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDefaultCategories(CategoryService categoryService) {
        return args -> {
            // Seed default categories if they don't exist
            seedCategoryIfNotExists(categoryService, "Food", Category.CategoryType.EXPENSE);
            seedCategoryIfNotExists(categoryService, "Rent", Category.CategoryType.EXPENSE);
            seedCategoryIfNotExists(categoryService, "Utilities", Category.CategoryType.EXPENSE);
            seedCategoryIfNotExists(categoryService, "Salary", Category.CategoryType.INCOME);

            System.out.println("Default categories seeded successfully!");
        };
    }

    private void seedCategoryIfNotExists(CategoryService categoryService, String name, Category.CategoryType type) {
        if (!categoryService.existsByName(name)) {
            try {
                categoryService.createCategory(name, type);
                System.out.println("Created default category: " + name + " (" + type + ")");
            } catch (Exception e) {
                System.err.println("Failed to create category " + name + ": " + e.getMessage());
            }
        } else {
            System.out.println("Category already exists: " + name);
        }
    }

}