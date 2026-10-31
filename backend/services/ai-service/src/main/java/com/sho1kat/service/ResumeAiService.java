package com.sho1kat.service;

import com.sho1kat.dto.aiServiceDto.request.CareerFeedbackRequest;
import com.sho1kat.dto.aiServiceDto.request.ResumeImprovementRequest;
import com.sho1kat.dto.aiServiceDto.request.ResumeSummaryRequest;
import com.sho1kat.dto.aiServiceDto.request.WorkExperienceRequest;
import com.sho1kat.dto.aiServiceDto.response.AiTextResponse;
import com.sho1kat.dto.aiServiceDto.response.CareerFeedbackResponse;
import com.sho1kat.dto.aiServiceDto.response.ResumeImprovementResponse;
import com.sho1kat.dto.aiServiceDto.response.WorkExperienceBulletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

/**
 * Resume optimization features: professional summary generation, raw
 * experience → ATS bullet points, scored improvement suggestions and honest
 * career feedback. Stateless — nothing is persisted.
 */
@Service
@RequiredArgsConstructor
public class ResumeAiService {

    private final AiCompletion aiCompletion;

    private static final String SYSTEM_PROMPT = """
            You are a senior resume writer and career coach with 15+ years of experience in the Bangladeshi tech job market.
            You specialize in ATS-optimized resumes, career coaching, and professional branding.
            Always be specific and results-oriented. Never use generic filler phrases like "hard-working", "team player", or "passionate".
            When asked for JSON, respond ONLY with valid JSON - no explanation, no markdown fences.
            """;

    // ------------------------------------------------------------- summary text

    public AiTextResponse generateSummary(ResumeSummaryRequest req) {
        String experiences = req.workExperiences() != null && !req.workExperiences().isEmpty()
                ? req.workExperiences().stream()
                .map(e -> e.jobTitle() + " at " + (e.company() != null ? e.company() : "a company")
                        + (e.description() != null && !e.description().isBlank()
                        ? ": " + e.description().replaceAll("\\s+", " ")
                        : ""))
                .collect(Collectors.joining("; "))
                : "Not provided";
        String skills = req.skills() != null ? String.join(", ", req.skills()) : "Not provided";
        String educations = req.educations() != null && !req.educations().isEmpty()
                ? req.educations().stream()
                .map(e -> e.degree()
                        + (e.fieldOfStudy() != null ? " in " + e.fieldOfStudy() : "")
                        + (e.institutionName() != null ? " from " + e.institutionName() : ""))
                .collect(Collectors.joining("; "))
                : "Not provided";

        String prompt = """
                Write a compelling professional summary for a resume.

                Candidate Profile:
                - Target Job Title: %s
                - Years of Experience: %d
                - Work Experience: %s
                - Key Skills: %s
                - Education: %s

                Write a 3-4 sentence professional summary that:
                1. Opens with seniority level and area of expertise
                2. Highlights 2-3 key achievements or strengths with impact
                3. Mentions specific technical skills relevant to the target role
                4. Ends with a value proposition or career goal

                Rules:
                - Write in first person but never start with "I"
                - Be specific and results-oriented
                - Keep it under 80 words
                - Make it ATS-friendly
                - Return ONLY the summary text - no heading, no prefix, no quotes
                """.formatted(
                req.targetJobTitle() != null ? req.targetJobTitle() : "Software Developer",
                req.yearsOfExperience() != null ? req.yearsOfExperience() : 0,
                experiences,
                skills,
                educations
        );

        return AiTextResponse.of(aiCompletion.text(SYSTEM_PROMPT, prompt));
    }

    // ------------------------------------------------------- experience bullets

    public WorkExperienceBulletResponse generateExperienceBullets(WorkExperienceRequest req) {
        String prompt = """
                Transform this work experience into powerful, ATS-friendly resume bullet points.

                Role: %s at %s
                Raw Description: %s
                Achievements/Hints: %s

                Generate exactly 4-5 bullet points that:
                1. Start with strong action verbs (Developed, Led, Implemented, Architected, Optimized, Reduced, Increased, Delivered, Built, Designed)
                2. Include quantifiable metrics where plausible (percentages, numbers, time saved)
                3. Highlight business impact and technical achievements
                4. Are concise (under 20 words each)
                5. Are ATS-friendly with relevant keywords

                Respond ONLY with JSON in exactly this shape:
                {
                "bullets": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"]
                }
                """.formatted(
                req.jobTitle(),
                req.company() != null ? req.company() : "the company",
                req.rawDescription().replaceAll("\\s+", " "),
                req.achievementsHint() != null ? req.achievementsHint() : "None"
        );

        return aiCompletion.json(SYSTEM_PROMPT, prompt, WorkExperienceBulletResponse.class);
    }

    // ------------------------------------------------------- improvement report

    public ResumeImprovementResponse getImprovementTips(ResumeImprovementRequest req) {
        String prompt = """
                Analyze this resume and provide specific, actionable improvement suggestions.

                Target Job Title: %s
                Resume Content:
                %s

                Respond ONLY with JSON in exactly this shape:
                {
                "overallScore": 72,
                "improvements": [
                  { "section": "Summary | Experience | Skills | Education | Projects | General",
                    "issue": "What is wrong or missing",
                    "suggestion": "Specific action to fix it",
                    "priority": "HIGH | MEDIUM | LOW" }
                ],
                "strengths": ["what is already good about this resume"],
                "summary": "2-sentence overall assessment"
                }

                Rules:
                - overallScore: integer 0-100, honest ATS and recruiter-readiness rating
                - Provide 4-6 specific improvements ordered by priority descending
                - Be concrete - mention actual sections, skills, or numbers by name
                """.formatted(
                req.targetJobTitle() != null ? req.targetJobTitle() : "Not specified",
                req.resumeContent()
        );

        return aiCompletion.json(SYSTEM_PROMPT, prompt, ResumeImprovementResponse.class);
    }

    // ---------------------------------------------------------- career feedback

    public CareerFeedbackResponse getCareerFeedback(CareerFeedbackRequest req) {
        String prompt = """
                Analyze this resume and deliver an honest, actionable career feedback report.

                Target Job Title (if provided): %s
                Resume Content: %s

                Respond ONLY with JSON in exactly this shape:
                {
                "profileStrength": 65,
                "shortlistingIssues": ["Reason 1 why recruiters are skipping this profile", "Reason 2"],
                "improvements": [
                  { "area": "Skills | Summary | Experience | Education | Projects | General",
                    "issue": "What specifically is weak or missing",
                    "action": "Concrete step the candidate should take to fix it",
                    "priority": "HIGH | MEDIUM | LOW" }
                ],
                "targetJobs": [
                  { "jobTitle": "Recommended Job Title",
                    "reason": "Why this role suits the current profile",
                    "skillMatch": "HIGH | MEDIUM | LOW" }
                ],
                "overallSummary": "2-3 sentences of honest, encouraging career advice"
                }

                Rules:
                - profileStrength: integer 0-100 reflecting overall job-market readiness
                - shortlistingIssues: 3-5 candid reasons a recruiter would skip this resume
                - improvements: 4-6 items ordered by priority descending
                - targetJobs: 3-5 realistic job titles matching current skills and experience level
                - Be specific - mention actual skills, tools, or sections by name
                """.formatted(
                req.targetJobTitle() != null ? req.targetJobTitle() : "Not specified",
                req.resumeContent().replaceAll("\\s+", " ")
        );

        return aiCompletion.json(SYSTEM_PROMPT, prompt, CareerFeedbackResponse.class);
    }
}
