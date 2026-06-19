package com.pulse.survey.dto.response;

import com.pulse.survey.entity.SurveyQuestion;

import java.util.UUID;

public record QuestionDto(UUID id, String questionText, int questionOrder, CategoryDto category) {
    public static QuestionDto from(SurveyQuestion q) {
        return new QuestionDto(q.getId(), q.getQuestionText(), q.getQuestionOrder(), CategoryDto.from(q.getCategory()));
    }
}
