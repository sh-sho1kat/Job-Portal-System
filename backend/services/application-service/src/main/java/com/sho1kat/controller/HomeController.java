package com.sho1kat.controller;

import com.sho1kat.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @GetMapping("/")
    public ApiResponse home() {
        return new ApiResponse(
                true,
                "Welcome to the Application Service!");

    }
}
