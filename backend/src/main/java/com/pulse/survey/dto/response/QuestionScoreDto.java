package com.pulse.survey.dto.response;

import java.util.UUID;

public record QuestionScoreDto(
    UUID questionId,
    String questionText,
    int questionOrder,
    double averageScore,
    long responseCount,
    long totalResponses
) {}
