package com.pulse.survey.dto.response;

import com.pulse.survey.enums.ResponseStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EnrichedSurveyResponseDto(
    UUID id,
    UUID userId,
    String userName,
    String userEmail,
    ResponseStatus status,
    LocalDateTime submittedAt,
    List<SurveyResponseDto.QuestionAnswerDto> answers
) {}
