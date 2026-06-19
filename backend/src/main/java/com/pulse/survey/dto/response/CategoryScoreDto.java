package com.pulse.survey.dto.response;

import java.util.List;
import java.util.UUID;

public record CategoryScoreDto(
    UUID categoryId,
    String categoryName,
    double averageScore,
    long responseCount,
    long totalResponses,
    List<QuestionScoreDto> questions
) {}
