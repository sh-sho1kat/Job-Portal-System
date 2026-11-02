package com.sho1kt.controller;

import com.sho1kat.dto.ApiResponse;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @RequestMapping("/")
    public ApiResponse home() {
        return new ApiResponse(
                true,
                "Welcome to the Notification Service API!");
    }
}
