package com.pulse.survey.dto.response;

import com.pulse.survey.enums.ResponseStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record MySurveyResponseStatusDto(
    UUID surveyId,
    UUID responseId,
    ResponseStatus status,
    LocalDateTime submittedAt
) {}
