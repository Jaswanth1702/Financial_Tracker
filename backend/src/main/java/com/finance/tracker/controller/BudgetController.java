package com.finance.tracker.controller;

import com.finance.tracker.model.Budget;
import com.finance.tracker.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<?> getBudgets(@RequestParam Long userId) {
        try {
            List<Budget> budgets = budgetService.listBudgetsByUser(userId);

            // Map to DTO objects for the frontend
            List<Map<String, Object>> budgetDTOs = budgets.stream().map(budget -> {
                Map<String, Object> dto = new java.util.HashMap<>();
                dto.put("id", budget.getId());
                dto.put("categoryId", budget.getCategory().getId());
                dto.put("categoryName", budget.getCategory().getName());
                dto.put("monthlyLimit", budget.getMonthlyLimit());
                // For now, currentSpend will be populated on the frontend (optional
                // enhancement: compute on backend)
                dto.put("currentSpend", 0);
                return dto;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(budgetDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve budgets");
        }
    }

    @PostMapping
    public ResponseEntity<?> createBudget(@RequestBody Map<String, Object> request) {
        try {
            Long userId = getLongFromRequest(request, "userId");
            Long categoryId = getLongFromRequest(request, "categoryId");
            BigDecimal monthlyLimit = getBigDecimalFromRequest(request, "monthlyLimit");

            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            if (categoryId == null) {
                return ResponseEntity.badRequest().body("Category ID is required");
            }
            if (monthlyLimit == null) {
                return ResponseEntity.badRequest().body("Monthly limit is required");
            }

            Budget budget = budgetService.createBudget(userId, categoryId, monthlyLimit);
            Map<String, Object> dto = new java.util.HashMap<>();
            dto.put("id", budget.getId());
            dto.put("categoryId", budget.getCategory().getId());
            dto.put("categoryName", budget.getCategory().getName());
            dto.put("monthlyLimit", budget.getMonthlyLimit());
            dto.put("currentSpend", 0);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create budget");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Long userId = getLongFromRequest(request, "userId");
            Long categoryId = getLongFromRequest(request, "categoryId");
            BigDecimal monthlyLimit = getBigDecimalFromRequest(request, "monthlyLimit");

            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            if (categoryId == null) {
                return ResponseEntity.badRequest().body("Category ID is required");
            }
            if (monthlyLimit == null) {
                return ResponseEntity.badRequest().body("Monthly limit is required");
            }

            Budget budget = budgetService.updateBudget(id, userId, categoryId, monthlyLimit);
            Map<String, Object> dto = new java.util.HashMap<>();
            dto.put("id", budget.getId());
            dto.put("categoryId", budget.getCategory().getId());
            dto.put("categoryName", budget.getCategory().getName());
            dto.put("monthlyLimit", budget.getMonthlyLimit());
            dto.put("currentSpend", 0);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update budget");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, @RequestParam Long userId) {
        try {
            budgetService.deleteBudget(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete budget");
        }
    }

    // Helper methods
    private Long getLongFromRequest(Map<String, Object> request, String key) {
        Object value = request.get(key);
        if (value == null)
            return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid " + key + " format");
            }
        }
        throw new IllegalArgumentException("Invalid " + key + " type");
    }

    private BigDecimal getBigDecimalFromRequest(Map<String, Object> request, String key) {
        Object value = request.get(key);
        if (value == null)
            return null;
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        if (value instanceof String) {
            try {
                return new BigDecimal((String) value);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid " + key + " format");
            }
        }
        throw new IllegalArgumentException("Invalid " + key + " type");
    }
}