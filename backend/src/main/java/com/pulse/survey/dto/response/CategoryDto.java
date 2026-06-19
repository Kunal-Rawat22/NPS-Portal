package com.pulse.survey.dto.response;

import com.pulse.survey.entity.Category;

import java.util.UUID;

public record CategoryDto(UUID id, String name, String description) {
    public static CategoryDto from(Category c) {
        return new CategoryDto(c.getId(), c.getName(), c.getDescription());
    }
}
