package com.finance.tracker.controller;

import com.finance.tracker.model.User;
import com.finance.tracker.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            User user = userService.registerUser(username, password);
            Map<String, Object> userInfo = Map.of(
                    "userId", user.getId(),
                    "username", user.getUsername(),
                    "displayName", user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(),
                    "preferredCurrency", user.getPreferredCurrency() != null ? user.getPreferredCurrency() : "USD",
                    "monthlyIncomeGoal",
                    user.getMonthlyIncomeGoal() != null ? user.getMonthlyIncomeGoal() : java.math.BigDecimal.ZERO);
            return ResponseEntity.status(HttpStatus.CREATED).body(userInfo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            System.out.println("Login attempt for username: " + username);

            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            Optional<User> userOptional = userService.findByUsername(username);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                System.out.println("User found: " + user.getUsername());
                System.out.println("Stored password: " + (user.getPassword() == null ? "NULL" : "SET"));
                System.out.println("Provided password: " + (password == null ? "NULL" : "SET"));

                // Simple password verification (in production, use proper password hashing)
                if (user.getPassword() != null && password.equals(user.getPassword())) {
                    System.out.println("Password match successful");
                    Map<String, Object> userInfo = Map.of(
                            "userId", user.getId(),
                            "username", user.getUsername(),
                            "displayName", user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(),
                            "preferredCurrency",
                            user.getPreferredCurrency() != null ? user.getPreferredCurrency() : "USD",
                            "monthlyIncomeGoal", user.getMonthlyIncomeGoal() != null ? user.getMonthlyIncomeGoal()
                                    : java.math.BigDecimal.ZERO);
                    return ResponseEntity.ok().body(userInfo);
                } else {
                    System.out.println("Password mismatch or stored password is null");
                }
            } else {
                System.out.println("User not found for username: " + username);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login failed");
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok().body("Auth controller is working!");
    }

    @PostMapping("/admin/fix-passwords")
    public ResponseEntity<?> fixPasswords() {
        try {
            // Get all users with null passwords and fix them
            java.util.List<User> allUsers = userService.getAllUsers();
            int fixedCount = 0;

            for (User user : allUsers) {
                if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                    user.setPassword("password123");
                    userService.saveUser(user);
                    fixedCount++;
                    System.out.println("Fixed password for user: " + user.getUsername());
                }
            }

            return ResponseEntity.ok().body("Fixed " + fixedCount + " users with NULL passwords");
        } catch (Exception e) {
            System.err.println("Error fixing passwords: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fix passwords");
        }
    }
}