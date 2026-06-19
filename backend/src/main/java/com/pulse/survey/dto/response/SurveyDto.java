package com.pulse.survey.dto.response;

import com.pulse.survey.entity.Survey;
import com.pulse.survey.enums.SurveyStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SurveyDto(
    UUID id,
    String title,
    String description,
    LocalDate startDate,
    LocalDate endDate,
    SurveyStatus status,
    UUID createdById,
    String createdByName,
    LocalDateTime createdAt,
    List<QuestionDto> questions
) {
    public static SurveyDto from(Survey s) {
        return new SurveyDto(
            s.getId(), s.getTitle(), s.getDescription(),
            s.getStartDate(), s.getEndDate(), s.getStatus(),
            s.getCreatedBy().getId(),
            s.getCreatedBy().getFirstName() + " " + s.getCreatedBy().getLastName(),
            s.getCreatedAt(),
            s.getQuestions().stream().map(QuestionDto::from).toList()
        );
    }
}
