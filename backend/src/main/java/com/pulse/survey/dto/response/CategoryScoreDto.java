package com.pulse.survey.dto.response;

import java.util.UUID;

public record CategoryScoreDto(
    UUID categoryId,
    String categoryName,
    double averageScore,
    long responseCount,
    long totalResponses
) {}
