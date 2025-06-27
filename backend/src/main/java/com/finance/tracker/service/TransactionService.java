package com.finance.tracker.service;

import com.finance.tracker.model.Transaction;
import com.finance.tracker.model.User;
import com.finance.tracker.model.Category;
import com.finance.tracker.repository.TransactionRepository;
import com.finance.tracker.repository.UserRepository;
import com.finance.tracker.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

        private final TransactionRepository transactionRepository;
        private final UserRepository userRepository;
        private final CategoryRepository categoryRepository;

        public TransactionService(TransactionRepository transactionRepository,
                        UserRepository userRepository,
                        CategoryRepository categoryRepository) {
                this.transactionRepository = transactionRepository;
                this.userRepository = userRepository;
                this.categoryRepository = categoryRepository;
        }

        public List<Transaction> listTransactionsByUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                return transactionRepository.findByUser(user);
        }

        public List<Transaction> listTransactionsByUserAndCategory(Long userId, Long categoryId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                Category category = categoryRepository.findById(categoryId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Category not found with id: " + categoryId));
                return transactionRepository.findByUserAndCategory(user, category);
        }

        public List<Transaction> listTransactionsByUserAndDateRange(Long userId, LocalDate startDate,
                        LocalDate endDate) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                return transactionRepository.findByUserAndDateBetween(user, startDate, endDate);
        }

        public Optional<Transaction> findById(Long id) {
                return transactionRepository.findById(id);
        }

        public Transaction createTransaction(Long userId, Long categoryId, BigDecimal amount, LocalDate date,
                        String note) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                Category category = categoryRepository.findById(categoryId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Category not found with id: " + categoryId));

                if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalArgumentException("Amount cannot be negative");
                }

                Transaction transaction = new Transaction(user, category, amount, date, note);
                return transactionRepository.save(transaction);
        }

        public Transaction updateTransaction(Long id, Long userId, Long categoryId, BigDecimal amount, LocalDate date,
                        String note) {
                Transaction transaction = transactionRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Transaction not found with id: " + id));

                // Verify the transaction belongs to the user
                if (!transaction.getUser().getId().equals(userId)) {
                        throw new IllegalArgumentException("Transaction does not belong to the specified user");
                }

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                Category category = categoryRepository.findById(categoryId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Category not found with id: " + categoryId));

                if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalArgumentException("Amount cannot be negative");
                }

                transaction.setUser(user);
                transaction.setCategory(category);
                transaction.setAmount(amount);
                transaction.setDate(date);
                transaction.setNote(note);

                return transactionRepository.save(transaction);
        }

        public void deleteTransaction(Long id, Long userId) {
                Transaction transaction = transactionRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Transaction not found with id: " + id));

                // Verify the transaction belongs to the user
                if (!transaction.getUser().getId().equals(userId)) {
                        throw new IllegalArgumentException("Transaction does not belong to the specified user");
                }

                transactionRepository.deleteById(id);
        }

        public BigDecimal getTotalAmountByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                BigDecimal total = transactionRepository.sumAmountByUserAndDateBetween(user, startDate, endDate);
                return total != null ? total : BigDecimal.ZERO;
        }

        public BigDecimal getTotalAmountByUserAndCategoryAndDateRange(Long userId, Long categoryId, LocalDate startDate,
                        LocalDate endDate) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                Category category = categoryRepository.findById(categoryId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Category not found with id: " + categoryId));
                BigDecimal total = transactionRepository.sumAmountByUserAndCategoryAndDateBetween(user, category,
                                startDate,
                                endDate);
                return total != null ? total : BigDecimal.ZERO;
        }
}