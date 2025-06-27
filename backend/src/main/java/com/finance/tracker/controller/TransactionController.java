package com.finance.tracker.controller;

import com.finance.tracker.model.Transaction;
import com.finance.tracker.model.Category;
import com.finance.tracker.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<?> getTransactions(@RequestParam Long userId) {
        try {
            List<Transaction> transactions = transactionService.listTransactionsByUser(userId);
            // Transform transactions to include type field based on category
            List<Map<String, Object>> transactionDTOs = transactions.stream()
                    .map(this::mapTransactionToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(transactionDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve transactions");
        }
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody Map<String, Object> request) {
        try {
            Long userId = getLongFromRequest(request, "userId");
            Long categoryId = getLongFromRequest(request, "categoryId");
            BigDecimal amount = getBigDecimalFromRequest(request, "amount");
            LocalDate date = getDateFromRequest(request, "date");
            String note = (String) request.get("note");

            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            if (categoryId == null) {
                return ResponseEntity.badRequest().body("Category ID is required");
            }
            if (amount == null) {
                return ResponseEntity.badRequest().body("Amount is required");
            }
            if (date == null) {
                return ResponseEntity.badRequest().body("Date is required");
            }

            Transaction transaction = transactionService.createTransaction(userId, categoryId, amount, date, note);
            Map<String, Object> transactionDTO = mapTransactionToDTO(transaction);
            return ResponseEntity.status(HttpStatus.CREATED).body(transactionDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create transaction");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Long userId = getLongFromRequest(request, "userId");
            Long categoryId = getLongFromRequest(request, "categoryId");
            BigDecimal amount = getBigDecimalFromRequest(request, "amount");
            LocalDate date = getDateFromRequest(request, "date");
            String note = (String) request.get("note");

            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            if (categoryId == null) {
                return ResponseEntity.badRequest().body("Category ID is required");
            }
            if (amount == null) {
                return ResponseEntity.badRequest().body("Amount is required");
            }
            if (date == null) {
                return ResponseEntity.badRequest().body("Date is required");
            }

            Transaction transaction = transactionService.updateTransaction(id, userId, categoryId, amount, date, note);
            Map<String, Object> transactionDTO = mapTransactionToDTO(transaction);
            return ResponseEntity.ok(transactionDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update transaction");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, @RequestParam Long userId) {
        try {
            transactionService.deleteTransaction(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete transaction");
        }
    }

    // Helper method to map Transaction entity to DTO with type field
    private Map<String, Object> mapTransactionToDTO(Transaction transaction) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", transaction.getId());
        dto.put("amount", transaction.getAmount());
        dto.put("date", transaction.getDate());
        dto.put("note", transaction.getNote());
        dto.put("categoryId", transaction.getCategory().getId());
        dto.put("category", transaction.getCategory().getName());

        // Add type field based on category type
        String type = transaction.getCategory().getType() == Category.CategoryType.INCOME ? "income" : "expense";
        dto.put("type", type);

        // Add description field (using note or default)
        dto.put("description", transaction.getNote() != null ? transaction.getNote() : "Transaction");

        return dto;
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

    private LocalDate getDateFromRequest(Map<String, Object> request, String key) {
        Object value = request.get(key);
        if (value == null)
            return null;
        if (value instanceof String) {
            try {
                return LocalDate.parse((String) value);
            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException("Invalid " + key + " format. Use YYYY-MM-DD");
            }
        }
        throw new IllegalArgumentException("Invalid " + key + " type");
    }
}