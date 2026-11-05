package com.sho1kat.controller;

import com.sho1kat.dto.userServiceDto.response.CandidateSummaryResponse;
import com.sho1kat.dto.userServiceDto.response.UserResponse;
import com.sho1kat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalServiceController {
    private final UserService userService;

    @GetMapping("/{id}")
    public CandidateSummaryResponse getCandidateSummary(@PathVariable("id") Long candidateId) {
        return userService.getCandidateSummaryById(candidateId);
    }

}
