package com.pulse.survey.dto.request;

import com.pulse.survey.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateUserRequest(
    @Email @NotBlank String email,
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotNull Role role,
    UUID businessUnitId,
    UUID reportingToId,
    UUID hrbpId,
    String competency
) {}
