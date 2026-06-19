package com.pulse.survey.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record SaveResponseRequest(List<QuestionAnswer> answers) {
    public record QuestionAnswer(
        @NotNull UUID questionId,
        @Min(0) @Max(5) int rating,
        String comment
    ) {}
}
