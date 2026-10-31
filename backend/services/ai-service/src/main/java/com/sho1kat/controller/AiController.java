package com.sho1kat.controller;

import com.sho1kat.client.GeminiClient;
import com.sho1kat.client.GroqClient;
import com.sho1kat.dto.ApiResponse;
import com.sho1kat.dto.aiServiceDto.AiGenerateRequest;
import com.sho1kat.dto.aiServiceDto.AiGenerateResponse;
import com.sho1kat.dto.aiServiceDto.response.AiTextResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Service root plus the two raw provider playgrounds (Gemini / Groq) with the
 * generic portal assistant persona. Feature-specific generation lives in the
 * resume / job / application / search controllers.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiClient geminiClient;
    private final GroqClient groqClient;

    @GetMapping
    public ResponseEntity<ApiResponse> home() {
        return ResponseEntity.ok(new ApiResponse(true, "Welcome to the AI Service!"));
    }

    /** Quick GET playground (prompt in the path, no encoding needed for words). */
    @GetMapping("/default/{prompt}")
    public ResponseEntity<AiTextResponse> generateDefault(@PathVariable String prompt) {
        return ResponseEntity.ok(AiTextResponse.of(geminiClient.generateText(null, prompt)));
    }

    /** Raw Gemini call — same persona, arbitrary prompt. */
    @PostMapping("/gemini/generate")
    public ResponseEntity<AiGenerateResponse> generateWithGemini(@Valid @RequestBody AiGenerateRequest request) {
        return ResponseEntity.ok(geminiClient.generateContent(request));
    }

    /** Raw Groq call — same persona, arbitrary prompt. */
    @PostMapping("/groq/generate")
    public ResponseEntity<AiGenerateResponse> generateWithGroq(@Valid @RequestBody AiGenerateRequest request) {
        return ResponseEntity.ok(groqClient.generateContent(request));
    }
}
