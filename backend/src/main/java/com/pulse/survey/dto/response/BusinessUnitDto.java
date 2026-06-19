package com.pulse.survey.dto.response;

import com.pulse.survey.entity.BusinessUnit;

import java.util.UUID;

public record BusinessUnitDto(UUID id, String name, UUID headUserId, String headUserName) {
    public static BusinessUnitDto from(BusinessUnit bu) {
        return new BusinessUnitDto(
            bu.getId(),
            bu.getName(),
            bu.getHeadUser() != null ? bu.getHeadUser().getId() : null,
            bu.getHeadUser() != null ? bu.getHeadUser().getFirstName() + " " + bu.getHeadUser().getLastName() : null
        );
    }
}
