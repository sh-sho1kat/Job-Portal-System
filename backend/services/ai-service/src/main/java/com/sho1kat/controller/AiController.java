package com.sho1kat.controller;

import com.sho1kat.dto.ApiResponse;
import com.sho1kat.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @GetMapping("/default/{prompt}")
    public ResponseEntity<String> generatedefault(@PathVariable String prompt) throws Exception {
        String response = geminiService.generateContentdefault(prompt);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{prompt}")
    public ResponseEntity<String> generate(@PathVariable String prompt) throws Exception {
        String response = geminiService.generateContent(prompt);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/home")
    public ResponseEntity<ApiResponse> home() {
        return ResponseEntity.ok(new ApiResponse(true,"Welcome to the AI Service!"));
    }
}