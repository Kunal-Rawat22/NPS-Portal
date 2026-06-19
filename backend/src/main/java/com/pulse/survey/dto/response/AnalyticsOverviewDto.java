package com.pulse.survey.dto.response;

import java.util.List;
import java.util.UUID;

public record AnalyticsOverviewDto(
    UUID surveyId,
    String surveyTitle,
    long totalEmployees,
    long completedResponses,
    double completionRate,
    List<CategoryScoreDto> categoryScores
) {}
