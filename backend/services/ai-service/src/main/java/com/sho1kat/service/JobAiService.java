package com.sho1kat.service;

import com.sho1kat.dto.aiServiceDto.request.JobDescriptionRequest;
import com.sho1kat.dto.aiServiceDto.request.JobTextInputRequest;
import com.sho1kat.dto.aiServiceDto.request.SalaryRangeRequest;
import com.sho1kat.dto.aiServiceDto.response.AiTextResponse;
import com.sho1kat.dto.aiServiceDto.response.SalaryRangeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

/**
 * Employer-facing auto-generation for job postings: full descriptions,
 * responsibilities/requirements blocks, benefits, skills and tag
 * recommendations, plus a market-informed salary band. Stateless.
 */
@Service
@RequiredArgsConstructor
public class JobAiService {

    private final AiCompletion aiCompletion;

    private static final String SYSTEM_PROMPT = """
            You are a senior HR professional and technical recruiter with deep knowledge of the Bangladeshi job market (2025-2026).
            You specialize in writing job descriptions, compensation benchmarking, and talent acquisition.
            Always write in a professional, engaging, inclusive, and bias-free tone.
            When asked for JSON, respond ONLY with valid JSON - no explanation, no markdown fences.
            """;

    // ------------------------------------------------------------- description

    public AiTextResponse generateDescription(JobDescriptionRequest req) {
        String skills = req.skills() != null ? String.join(", ", req.skills()) : "Not specified";

        String prompt = """
                Write a comprehensive, engaging, and inclusive job description.

                Job Details:
                - Title: %s
                - Required Skills: %s
                - Experience Level: %s
                - Job Type: %s
                - Work Mode: %s
                - Category: %s
                - Additional Context: %s

                Format the response in clean markdown with EXACTLY these sections:
                ## About the Role
                [2-3 compelling sentences describing the role and its impact]

                ## Key Responsibilities
                - [6 specific, action-oriented bullet points]

                ## Requirements
                - [5-6 must-have qualifications and skills]

                ## Nice to Have
                - [3-4 bonus qualifications]

                ## What We Offer
                - [4-5 benefits and perks]

                Do NOT include placeholder company names - say "our team" or "we".
                """.formatted(
                req.title(),
                skills,
                req.experienceLevel() != null ? req.experienceLevel() : "not specified",
                req.jobType() != null ? req.jobType() : "not specified",
                req.workMode() != null ? req.workMode() : "not specified",
                req.category() != null ? req.category() : "not specified",
                req.additionalContext() != null ? req.additionalContext() : "none"
        );

        return AiTextResponse.of(aiCompletion.text(SYSTEM_PROMPT, prompt));
    }

    // ------------------------------------------------- requirements / duties

    public AiTextResponse generateRequirements(String title, String category) {
        String prompt = """
                Generate professional job requirements and responsibilities for this role.

                Job Title: %s
                Category: %s

                Format in markdown:
                ## Responsibilities
                - [5 specific bullet points]

                ## Requirements
                - [5 specific bullet points]

                Keep it concise and ATS-friendly.
                """.formatted(title, category != null ? category : "General");

        return AiTextResponse.of(aiCompletion.text(SYSTEM_PROMPT, prompt));
    }

    public AiTextResponse generateResponsibilities(String title, String category) {
        String prompt = """
                Generate 6 specific, action-oriented job responsibilities for this role.

                Job Title: %s
                Category: %s

                Return ONLY a plain bullet list (no headings, no markdown headers):
                - [responsibility 1]
                - [responsibility 2]

                Keep each bullet concise (under 15 words), start with a strong action verb.
                """.formatted(title, category != null ? category : "General");

        return AiTextResponse.of(aiCompletion.text(SYSTEM_PROMPT, prompt));
    }

    public AiTextResponse generateBenefits(String title, String category, String jobType) {
        String prompt = """
                Generate 6 competitive, attractive job benefits for this role.

                Job Title: %s
                Category: %s
                Job Type: %s

                Return ONLY a plain bullet list (no headings, no markdown headers):
                - [benefit 1]
                - [benefit 2]

                Include a mix of: compensation perks, health/wellness, growth, flexibility, and culture benefits.
                Keep each bullet concise and specific. Bangladeshi market context.
                """.formatted(
                title,
                category != null ? category : "General",
                jobType != null ? jobType : "FULL_TIME"
        );

        return AiTextResponse.of(aiCompletion.text(SYSTEM_PROMPT, prompt));
    }

    // ---------------------------------------------------------------- discovery

    public AiTextResponse suggestSkills(JobTextInputRequest req) {
        String prompt = """
                Recommend the most relevant skills for this job posting.

                Job Title: %s
                Description: %s

                List 8-10 specific, relevant skills that candidates should have.
                Return a comma-separated list of skill names only - no numbering, no explanations.
                Example: Java, Spring Boot, PostgreSQL, Docker, REST APIs, Microservices
                """.formatted(
                req.title(),
                req.description() != null ? req.description().replaceAll("\\s+", " ") : "No description yet"
        );

        return AiTextResponse.of(aiCompletion.text(SYSTEM_PROMPT, prompt));
    }

    public AiTextResponse suggestTags(JobTextInputRequest req) {
        String prompt = """
                Recommend 8-10 relevant tags/keywords for this job posting that improve discoverability.

                Job Title: %s
                Description: %s

                Return ONLY a comma-separated list of short tag names (1-3 words each) - no numbering, no explanations.
                Example: React, Frontend, JavaScript, Remote, Startup, Full Stack, Web Development
                """.formatted(
                req.title(),
                req.description() != null ? req.description().replaceAll("\\s+", " ") : "No description yet"
        );

        return AiTextResponse.of(aiCompletion.text(SYSTEM_PROMPT, prompt));
    }

    // ----------------------------------------------------------------- salary

    public SalaryRangeResponse suggestSalaryRange(SalaryRangeRequest req) {
        String skills = req.skills() != null && !req.skills().isEmpty()
                ? req.skills().stream().collect(Collectors.joining(", "))
                : "Not specified";

        String prompt = """
                Provide a realistic and competitive salary range for this role.

                Role Details:
                - Job Title: %s
                - Required Skills: %s
                - Experience Level: %s
                - Job Type: %s
                - Location: %s

                Respond ONLY with JSON in exactly this shape:
                {
                "minSalary": 600000,
                "maxSalary": 1200000,
                "currency": "BDT",
                "period": "YEARLY",
                "marketInsight": "Brief 1-2 sentence insight about this role's compensation trend in the current Bangladeshi market."
                }

                minSalary and maxSalary must be numbers (not strings).
                period must be one of: HOURLY, MONTHLY, YEARLY.
                Use a realistic current Bangladeshi market rate. minSalary must not exceed maxSalary.
                """.formatted(
                req.title(),
                skills,
                req.experienceLevel() != null ? req.experienceLevel() : "not specified",
                req.jobType() != null ? req.jobType() : "FULL_TIME",
                req.location() != null ? req.location() : "Bangladesh"
        );

        return aiCompletion.json(SYSTEM_PROMPT, prompt, SalaryRangeResponse.class);
    }
}
