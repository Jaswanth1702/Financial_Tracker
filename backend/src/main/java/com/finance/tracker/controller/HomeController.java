package com.finance.tracker.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Welcome to Finance Tracker Application!";
    }

    @GetMapping("/health")
    public String health() {
        return "Application is running successfully!";
    }
}