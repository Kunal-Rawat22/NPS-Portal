package com.pulse.survey.dto.response;

import com.pulse.survey.entity.User;
import com.pulse.survey.enums.Role;

import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String firstName,
    String lastName,
    String avatarUrl,
    Role role,
    UUID businessUnitId,
    String businessUnitName,
    UUID hrbpId,
    String hrbpName,
    UUID reportingToId,
    String reportingToName,
    String competency,
    boolean isActive
) {
    public static UserDto from(User u) {
        return new UserDto(
            u.getId(),
            u.getEmail(),
            u.getFirstName(),
            u.getLastName(),
            u.getAvatarUrl(),
            u.getRole(),
            u.getBusinessUnit() != null ? u.getBusinessUnit().getId() : null,
            u.getBusinessUnit() != null ? u.getBusinessUnit().getName() : null,
            u.getHrbp() != null ? u.getHrbp().getId() : null,
            u.getHrbp() != null ? u.getHrbp().getFirstName() + " " + u.getHrbp().getLastName() : null,
            u.getReportingTo() != null ? u.getReportingTo().getId() : null,
            u.getReportingTo() != null ? u.getReportingTo().getFirstName() + " " + u.getReportingTo().getLastName() : null,
            u.getCompetency(),
            u.isActive()
        );
    }
}
