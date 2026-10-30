package com.sho1kat.controller;

import com.sho1kat.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/{prompt}")
    public String generate(@PathVariable String prompt) {
        return geminiService.generateContent(prompt);
    }
}