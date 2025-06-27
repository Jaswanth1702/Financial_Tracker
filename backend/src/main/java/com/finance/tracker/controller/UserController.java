package com.finance.tracker.controller;

import com.finance.tracker.model.User;
import com.finance.tracker.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            Optional<User> userOptional = userService.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOptional.get();
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("id", user.getId());
            userProfile.put("username", user.getUsername());
            userProfile.put("displayName", user.getDisplayName());
            userProfile.put("preferredCurrency", user.getPreferredCurrency());
            userProfile.put("monthlyIncomeGoal", user.getMonthlyIncomeGoal());

            return ResponseEntity.ok(userProfile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve user profile");
        }
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            String displayName = (String) request.get("displayName");
            String preferredCurrency = (String) request.get("preferredCurrency");

            BigDecimal monthlyIncomeGoal = null;
            if (request.get("monthlyIncomeGoal") != null) {
                if (request.get("monthlyIncomeGoal") instanceof Number) {
                    monthlyIncomeGoal = new BigDecimal(request.get("monthlyIncomeGoal").toString());
                }
            }

            User updatedUser = userService.updateUserProfile(userId, displayName, preferredCurrency, monthlyIncomeGoal);

            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("id", updatedUser.getId());
            userProfile.put("username", updatedUser.getUsername());
            userProfile.put("displayName", updatedUser.getDisplayName());
            userProfile.put("preferredCurrency", updatedUser.getPreferredCurrency());
            userProfile.put("monthlyIncomeGoal", updatedUser.getMonthlyIncomeGoal());

            return ResponseEntity.ok(userProfile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update user profile");
        }
    }
}