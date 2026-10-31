package com.sho1kat;

import com.sho1kat.client.AiProvider;
import com.sho1kat.controller.AiApplicationController;
import com.sho1kat.controller.AiJobController;
import com.sho1kat.controller.AiResumeController;
import com.sho1kat.exception.ApiExceptionHandler;
import com.sho1kat.service.AiCompletion;
import com.sho1kat.service.ApplicationAiService;
import com.sho1kat.service.JobAiService;
import com.sho1kat.service.ResumeAiService;
import com.sho1kat.util.AiJson;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Controller request contract without any provider being configured: body and
 * request-param validation still run first, so endpoint wiring is proven with
 * plain standalone MockMvc (no server, no API keys). The real error envelope
 * from ApiExceptionHandler is attached so 503s surface in the documented shape.
 */
class AiControllerContractTest {

    private MockMvc resume;
    private MockMvc application;
    private MockMvc jobs;

    @BeforeEach
    void setup() {
        AiCompletion finiteCompletion = new AiCompletion(List.of());

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        resume = MockMvcBuilders
                .standaloneSetup(new AiResumeController(new ResumeAiService(finiteCompletion)))
                .setValidator(validator)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
        application = MockMvcBuilders
                .standaloneSetup(new AiApplicationController(new ApplicationAiService(finiteCompletion)))
                .setValidator(validator)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
        jobs = MockMvcBuilders
                .standaloneSetup(new AiJobController(new JobAiService(finiteCompletion)))
                .setValidator(validator)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    // ------------------------------------------------------------- validation

    @Test
    void blankResumeContentIsRejected400() throws Exception {
        resume.perform(post("/api/ai/resume/improvements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"resumeContent\": \"   \", \"targetJobTitle\": \"SWE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void missingCoverLetterCandidateIsRejected400() throws Exception {
        application.perform(post("/api/ai/application/cover-letter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"jobTitle\": \"Backend Engineer\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void missingJobTitleRequestParamIsRejected400() throws Exception {
        jobs.perform(post("/api/ai/job/requirements"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void outOfRangeYearsOfExperienceIsRejected400() throws Exception {
        resume.perform(post("/api/ai/resume/summary")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"targetJobTitle\": \"Backend Engineer\", \"yearsOfExperience\": 150}"))
                .andExpect(status().isBadRequest());
    }

    // ----------------------------------------------------- provider-less path

    @Test
    void unconfiguredFacadeAnswers503InErrorEnvelope() throws Exception {
        resume.perform(post("/api/ai/resume/summary")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"targetJobTitle\": \"Backend Engineer\", \"yearsOfExperience\": 5}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503));
    }

    // ------------------------------------------------------- happy-path shape

    @Test
    void salaryEndpointReturnsParsedJsonBand() throws Exception {
        AiCompletion scripted = new AiCompletion(List.of(new AiProvider() {
            @Override
            public String name() {
                return "fake";
            }

            @Override
            public boolean isConfigured() {
                return true;
            }

            @Override
            public String generateText(String systemInstruction, String userPrompt) {
                return "{\"minSalary\": 500000, \"maxSalary\": 900000, \"currency\": \"BDT\", "
                        + "\"period\": \"YEARLY\", \"marketInsight\": \"Steady demand.\"}";
            }

            @Override
            public <T> T generateJson(String systemInstruction, String userPrompt, Class<T> type) {
                return AiJson.parse(generateText(systemInstruction, userPrompt), type);
            }
        }));

        MockMvc scriptedJobs = MockMvcBuilders
                .standaloneSetup(new AiJobController(new JobAiService(scripted)))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();

        scriptedJobs.perform(post("/api/ai/job/salary-suggestion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Backend Engineer\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minSalary").value(500000))
                .andExpect(jsonPath("$.maxSalary").value(900000))
                .andExpect(jsonPath("$.currency").value("BDT"))
                .andExpect(jsonPath("$.period").value("YEARLY"))
                .andExpect(jsonPath("$.marketInsight").value("Steady demand."));
    }
}
