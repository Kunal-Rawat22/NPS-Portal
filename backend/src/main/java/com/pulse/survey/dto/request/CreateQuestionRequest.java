package com.pulse.survey.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateQuestionRequest(
    @NotBlank String questionText,
    @NotNull UUID categoryId,
    int questionOrder
) {}
