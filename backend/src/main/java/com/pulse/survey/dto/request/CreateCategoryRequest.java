package com.pulse.survey.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
    @NotBlank String name,
    String description
) {}
