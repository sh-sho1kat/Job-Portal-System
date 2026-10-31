package com.sho1kat.service;

import com.sho1kat.dto.aiServiceDto.request.CoverLetterRequest;
import com.sho1kat.dto.aiServiceDto.request.ScreeningScoreRequest;
import com.sho1kat.dto.aiServiceDto.request.SkillsGapRequest;
import com.sho1kat.dto.aiServiceDto.response.AiTextResponse;
import com.sho1kat.dto.aiServiceDto.response.ScreeningScoreResponse;
import com.sho1kat.dto.aiServiceDto.response.SkillsGapResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Application-flow AI: personalized cover-letter generation for the apply
 * form, plus candidate-vs-job screening scores and skills-gap analyses (the
 * data behind the application-service inbox screening columns). Stateless.
 */
@Service
@RequiredArgsConstructor
public class ApplicationAiService {

    private final AiCompletion aiCompletion;

    private static final String SYSTEM_PROMPT = """
            You are a senior technical recruiter and career coach with 15+ years of experience in the Bangladesh tech industry.
            You specialize in candidate evaluation, cover letter writing, skills gap analysis, and career development.
            Always provide objective, fair, and actionable assessments based only on the information provided.
            When asked for JSON, respond ONLY with valid JSON - no explanation, no markdown fences.
            """;

    // ------------------------------------------------------------ cover letter

    public AiTextResponse generateCoverLetter(CoverLetterRequest req) {
        String skills = req.candidateSkills() != null && !req.candidateSkills().isEmpty()
                ? String.join(", ", req.candidateSkills())
                : "Not provided";
        String experience = req.candidateExperience() != null && !req.candidateExperience().isEmpty()
                ? String.join("; ", req.candidateExperience())
                : "Not provided";

        String prompt = """
                Write a compelling, personalized cover letter.

                Position: %s
                Job Description: %s
                Target Company: %s

                Candidate Profile:
                - Name: %s
                - Professional Summary: %s
                - Key Skills: %s
                - Relevant Experience: %s

                Write a 3-paragraph cover letter:
                Paragraph 1 (Opening): Express specific enthusiasm for this exact role and company.
                    Mention 1 specific thing about the role that excites you.
                Paragraph 2 (Body): Connect 2-3 of the candidate's strongest experiences/skills
                    directly to the job requirements. Be specific with examples.
                Paragraph 3 (Closing): A confident call to action. Express eagerness to discuss further.

                Rules:
                - Write as the candidate (first person), addressed to the hiring team
                - Be specific - avoid generic statements
                - Maximum 300 words
                - Professional but warm tone
                - Do NOT use placeholders like [Company Name] - use the actual company name or say "your team"
                - Do NOT include a subject line, date, or signature block
                - Return ONLY the letter text
                """.formatted(
                req.jobTitle(),
                req.jobDescription() != null ? req.jobDescription() : "Not provided",
                req.targetCompanyName() != null ? req.targetCompanyName() : "your organization",
                req.candidateName(),
                req.candidateSummary() != null ? req.candidateSummary() : "Experienced professional",
                skills,
                experience
        );

        return AiTextResponse.of(aiCompletion.text(SYSTEM_PROMPT, prompt));
    }

    // ------------------------------------------------------------- screening

    public ScreeningScoreResponse scoreCandidate(ScreeningScoreRequest req) {
        String requiredSkills = req.requiredSkills() != null && !req.requiredSkills().isEmpty()
                ? String.join(", ", req.requiredSkills())
                : "Not provided";
        String candidateSkills = req.candidateSkills() != null && !req.candidateSkills().isEmpty()
                ? String.join(", ", req.candidateSkills())
                : "Not provided";
        String candidateExperience = req.candidateExperience() != null && !req.candidateExperience().isEmpty()
                ? String.join("; ", req.candidateExperience())
                : "Not provided";

        String prompt = """
                Score this job application based on how well the candidate matches the requirements.

                Job Requirements:
                - Title: %s
                - Experience Level Required: %s
                - Required Skills: %s
                - Key Responsibilities: %s

                Candidate Profile:
                - Professional Summary: %s
                - Skills: %s
                - Experience History: %s

                Respond ONLY with JSON in exactly this shape:
                {
                "score": 85,
                "skillsMatchScore": 90,
                "experienceMatchScore": 80,
                "educationMatchScore": 75,
                "matchedSkills": ["skill1", "skill2"],
                "missingSkills": ["skill3"],
                "strengths": ["strength1", "strength2"],
                "concerns": ["concern1"],
                "summary": "2-3 sentence honest assessment of this candidate's fit"
                }

                Score scale: 0-100 where 100 is a perfect match.
                skillsMatchScore: how well candidate skills match required skills (0-100).
                experienceMatchScore: how well candidate experience matches the required level (0-100).
                educationMatchScore: how well candidate education/background fits the role (0-100).
                score: overall weighted match considering all factors. Be objective and fair.
                Every score field must be an integer between 0 and 100.
                """.formatted(
                req.jobTitle() != null ? req.jobTitle() : "Not provided",
                req.experienceLevel() != null ? req.experienceLevel() : "not provided",
                requiredSkills,
                req.responsibilities() != null ? req.responsibilities() : "not provided",
                req.candidateSummary() != null ? req.candidateSummary() : "not provided",
                candidateSkills,
                candidateExperience
        );

        return aiCompletion.json(SYSTEM_PROMPT, prompt, ScreeningScoreResponse.class);
    }

    // --------------------------------------------------------------------- gap

    public SkillsGapResponse analyzeSkillsGap(SkillsGapRequest req) {
        String candidateSkills = req.candidateSkills() != null && !req.candidateSkills().isEmpty()
                ? String.join(", ", req.candidateSkills())
                : "Not provided";
        String requiredSkills = req.requiredSkills() != null && !req.requiredSkills().isEmpty()
                ? String.join(", ", req.requiredSkills())
                : "Not provided";

        String prompt = """
                Analyze the skills gap between a candidate and a job requirement.

                Job Title: %s
                Candidate's Current Skills: %s
                Skills Required for the Job: %s

                Respond ONLY with JSON in exactly this shape:
                {
                "matchedSkills": ["skills candidate has that are required"],
                "missingSkills": ["required skills candidate completely lacks"],
                "partialMatch": ["skills candidate has partially or related versions of"],
                "prioritySkillsToLearn": ["top 3 skills to learn first, in order of importance"],
                "learningRecommendations": [
                  { "skill": "skill name",
                    "why": "why this skill is important for the role",
                    "howToLearn": "specific learning resource or approach" }
                ],
                "overallReadiness": "Ready | Partially Ready | Needs Development",
                "summary": "2-sentence honest assessment"
                }
                """.formatted(
                req.jobTitle(),
                candidateSkills,
                requiredSkills
        );

        return aiCompletion.json(SYSTEM_PROMPT, prompt, SkillsGapResponse.class);
    }
}
