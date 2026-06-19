package com.pulse.survey.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record AnalyticsAnswerDetailDto(
    UUID surveyResponseId,
    UUID userId,
    String userName,
    String userEmail,
    UUID questionId,
    String questionText,
    UUID categoryId,
    String categoryName,
    int rating,
    String comment,
    LocalDateTime submittedAt
) {}
