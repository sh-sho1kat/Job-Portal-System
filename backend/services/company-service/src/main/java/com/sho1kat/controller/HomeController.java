package com.sho1kat.controller;

import com.sho1kat.enums.UserRole;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Welcome to the Company Service!"+ UserRole.ROLE_EMPLOYER.toString();
    }

}
