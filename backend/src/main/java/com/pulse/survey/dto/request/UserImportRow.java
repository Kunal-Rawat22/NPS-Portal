package com.pulse.survey.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserImportRow(
    @NotBlank String name,
    @Email @NotBlank String email,
    @NotBlank String role,
    String businessUnit,
    String status
) {}
