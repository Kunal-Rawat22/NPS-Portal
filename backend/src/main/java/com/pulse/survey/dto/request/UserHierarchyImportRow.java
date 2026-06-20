package com.pulse.survey.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserHierarchyImportRow(
    @Email @NotBlank String email,
    String hrbpEmail,
    String rmEmail
) {}
