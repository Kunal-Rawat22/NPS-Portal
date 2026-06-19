package com.pulse.survey.dto.request;

import com.pulse.survey.enums.Role;

import java.util.UUID;

public record UpdateUserRequest(
    String firstName,
    String lastName,
    Role role,
    UUID businessUnitId,
    UUID reportingToId,
    UUID hrbpId,
    String competency,
    Boolean isActive
) {}
