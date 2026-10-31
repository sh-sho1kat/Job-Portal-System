package com.sho1kat.service;

import com.sho1kat.dto.aiServiceDto.request.JobAlertSuggestionRequest;
import com.sho1kat.dto.aiServiceDto.request.SearchEnhanceRequest;
import com.sho1kat.dto.aiServiceDto.response.JobAlertSuggestionResponse;
import com.sho1kat.dto.aiServiceDto.response.SearchEnhanceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Natural-language job search: extracts structured, enum-compatible search
 * criteria from a free sentence and derives job-alert criteria from a
 * candidate profile. Stateless.
 */
@Service
@RequiredArgsConstructor
public class SearchAiService {

    private final AiCompletion aiCompletion;

    private static final String SYSTEM_PROMPT = """
            You are a job search expert and career advisor with deep knowledge of the job market.
            You extract structured search criteria from natural language and provide data-driven career recommendations.
            Always use the exact enum values specified in the prompt - never invent new values.
            When asked for JSON, respond ONLY with valid JSON - no explanation, no markdown fences.
            """;

    private static final String ENUM_RULES = """
            Valid jobTypes: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, TEMPORARY, FREELANCE
            Valid workModes: REMOTE, HYBRID, ON_SITE
            Valid experienceLevels: ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, LEAD, EXECUTIVE
            """;

    // -------------------------------------------------------- search enhance

    public SearchEnhanceResponse enhanceSearch(SearchEnhanceRequest req) {
        String prompt = """
                Extract structured job search criteria from this natural language query.

                User Query: "%s"

                Analyze the query and extract ALL implied and explicit search criteria.
                %s

                Respond ONLY with JSON in exactly this shape:
                {
                "keywords": ["keyword1", "keyword2"],
                "locations": ["city1", "city2"],
                "jobTypes": ["FULL_TIME"],
                "workModes": ["REMOTE"],
                "experienceLevels": ["MID_LEVEL"],
                "minSalary": null,
                "skills": ["skill1", "skill2"]
                }

                Rules:
                - Only include fields that are mentioned or clearly implied
                - Use null for minSalary if not mentioned
                - Use empty arrays [] for fields not mentioned
                - "fresher" or "entry level" -> ENTRY_LEVEL experience
                - "mid level" or "2-5 years" -> MID_LEVEL experience
                - "senior" or "5+ years" -> SENIOR_LEVEL experience
                - "lead" or "team lead" -> LEAD experience
                - "wfh" or "work from home" -> REMOTE work mode
                - Use lowercase city names as written in the query
                """.formatted(req.query().replaceAll("\\s+", " "), ENUM_RULES);

        return aiCompletion.json(SYSTEM_PROMPT, prompt, SearchEnhanceResponse.class);
    }

    // -------------------------------------------------------- alert suggest

    public JobAlertSuggestionResponse suggestAlertCriteria(JobAlertSuggestionRequest req) {
        String skills = req.skills() != null && !req.skills().isEmpty()
                ? String.join(", ", req.skills())
                : "Not provided";
        String jobTitles = req.previousJobTitles() != null && !req.previousJobTitles().isEmpty()
                ? String.join(", ", req.previousJobTitles())
                : "Not provided";
        String educations = req.educations() != null && !req.educations().isEmpty()
                ? String.join(", ", req.educations())
                : "Not provided";

        String prompt = """
                Based on this candidate's profile, suggest optimal job alert criteria to find the best matching jobs.

                Candidate Profile:
                - Skills: %s
                - Experience Level: %s
                - Previous Job Titles: %s
                - Education: %s

                %s

                Respond ONLY with JSON in exactly this shape:
                {
                "suggestedKeywords": ["keyword1", "keyword2"],
                "suggestedLocations": ["city1", "city2"],
                "suggestedJobTypes": ["FULL_TIME"],
                "suggestedWorkModes": ["REMOTE", "HYBRID"],
                "suggestedExperienceLevels": ["MID_LEVEL"],
                "suggestedIndustries": ["Technology", "Finance"],
                "reasoning": "Brief explanation of why these criteria were chosen"
                }

                Rules:
                - Only use the exact enum values listed above for jobTypes, workModes and experienceLevels
                - Keep suggestions realistic for the candidate's level and skills
                """.formatted(skills, req.experienceLevel() != null ? req.experienceLevel() : "not provided",
                jobTitles, educations, ENUM_RULES);

        return aiCompletion.json(SYSTEM_PROMPT, prompt, JobAlertSuggestionResponse.class);
    }
}
