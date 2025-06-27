package com.finance.tracker.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "preferred_currency", length = 3)
    private String preferredCurrency = "USD";

    @Column(name = "monthly_income_goal", precision = 19, scale = 2)
    private BigDecimal monthlyIncomeGoal;

    // Constructors
    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
        this.displayName = username; // Default display name to username
        this.preferredCurrency = "USD"; // Default currency
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPreferredCurrency() {
        return preferredCurrency;
    }

    public void setPreferredCurrency(String preferredCurrency) {
        this.preferredCurrency = preferredCurrency;
    }

    public BigDecimal getMonthlyIncomeGoal() {
        return monthlyIncomeGoal;
    }

    public void setMonthlyIncomeGoal(BigDecimal monthlyIncomeGoal) {
        this.monthlyIncomeGoal = monthlyIncomeGoal;
    }
}