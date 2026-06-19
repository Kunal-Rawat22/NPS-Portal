package com.pulse.survey.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreateBusinessUnitRequest(
    @NotBlank String name,
    UUID headUserId
) {}
