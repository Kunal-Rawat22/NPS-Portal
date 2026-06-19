package com.pulse.survey.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public record CreateSurveyRequest(
    @NotBlank String title,
    String description,
    LocalDate startDate,
    LocalDate endDate,
    @Valid List<SurveyQuestionRequest> questions
) {}
