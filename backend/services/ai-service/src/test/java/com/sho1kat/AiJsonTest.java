package com.sho1kat;

import com.sho1kat.dto.aiServiceDto.response.SalaryRangeResponse;
import com.sho1kat.dto.aiServiceDto.response.ScreeningScoreResponse;
import com.sho1kat.util.AiJson;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** The tolerant extractor models need: fences, prose and stray text. */
class AiJsonTest {

    @Test
    void parsesCleanObject() {
        ScreeningScoreResponse parsed = AiJson.parse(
                "{\"score\": 85, \"summary\": \"good\"}", ScreeningScoreResponse.class);

        assertThat(parsed.score()).isEqualTo(85);
        assertThat(parsed.summary()).isEqualTo("good");
    }

    @Test
    void parsesJsonInsideMarkdownFences() {
        SalaryRangeResponse parsed;
        parsed = AiJson.parse(
                """
                Sure! Here is the JSON:
                ```json
                {"minSalary": 450000, "maxSalary": 900000, "currency": "BDT"}
                ```
                Let me know if you want adjustments.
                """,
                SalaryRangeResponse.class);

        assertThat(parsed.minSalary().longValue()).isEqualTo(450000);
        assertThat(parsed.maxSalary().longValue()).isEqualTo(900000);
        assertThat(parsed.currency()).isEqualTo("BDT");
    }

    @Test
    void ignoresUnknownFields() {
        // models love to add "period: yearly" variants or extra keys
        ScreeningScoreResponse parsed = AiJson.parse(
                "{\"score\": 51, \"mysteryExtra\": \"whatever\", \"confidence\": 0.9}",
                ScreeningScoreResponse.class);

        assertThat(parsed.score()).isEqualTo(51);
        assertThat(parsed.summary()).isNull();
    }

    @Test
    void prowrappedNumbersParseIntoBigDecimal() {
        SalaryRangeResponse parsed = AiJson.parse(
                "{\"minSalary\": 1234567.89, \"maxSalary\": \"2200000\"}", SalaryRangeResponse.class);

        assertThat(parsed.minSalary().doubleValue()).isEqualTo(1234567.89);
        assertThat(parsed.maxSalary().doubleValue()).isEqualTo(2200000.0);
    }

    @Test
    void blankAndNoObjectInputIsRejected() {
        assertThatThrownBy(() -> AiJson.parse(null, ScreeningScoreResponse.class))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> AiJson.parse("   ", ScreeningScoreResponse.class))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> AiJson.parse("I cannot answer that", ScreeningScoreResponse.class))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void proseAroundObjectIsDiscarded() {
        ScreeningScoreResponse parsed = AiJson.parse(
                "OK - processed your request! {\"score\": 66} Hope this helps!",
                ScreeningScoreResponse.class);
        assertThat(parsed.score()).isEqualTo(66);
    }
}
