package com.sho1kat.client;

import com.sho1kat.dto.ResumeServiceDto.request.AwardRequest;
import com.sho1kat.dto.ResumeServiceDto.response.AwardResponse;

import java.util.List;

public interface AwardService {

    AwardResponse addAward(Long resumeId, Long candidateId, AwardRequest request);

    List<AwardResponse> getAwards(Long resumeId, Long candidateId);

    AwardResponse updateAward(Long awardId, Long resumeId, Long candidateId, AwardRequest request);

    void deleteAward(Long awardId, Long resumeId, Long candidateId);
}
