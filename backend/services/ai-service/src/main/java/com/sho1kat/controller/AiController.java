package com.sho1kat.controller;

import com.sho1kat.dto.AiGenerateRequest;
import com.sho1kat.dto.AiGenerateResponse;
import com.sho1kat.dto.ApiResponse;
import com.sho1kat.service.GeminiService;
import com.sho1kat.service.GroqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;
    private final GroqService groqService;

    @GetMapping("/default/{prompt}")
    public ResponseEntity<String> generatedefault(@PathVariable String prompt) throws Exception {
        String response = geminiService.generateContentdefault(prompt);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/gemini/generate")
    public ResponseEntity<AiGenerateResponse> geminigenerate(
            @Valid @RequestBody AiGenerateRequest request
    ) throws Exception {
        return ResponseEntity.ok(
                geminiService.generateContent(request)
        );
    }

    @GetMapping("/groq/generate")
    public ResponseEntity<AiGenerateResponse> groqgenerate(
            @Valid @RequestBody AiGenerateRequest request
    ) {
        return ResponseEntity.ok(
                groqService.generateContent(request)
        );
    }

    @GetMapping("/home")
    public ResponseEntity<ApiResponse> home() {
        return ResponseEntity.ok(new ApiResponse(true,"Welcome to the AI Service!"));
    }
}