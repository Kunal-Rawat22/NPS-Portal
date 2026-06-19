package com.pulse.survey.dto.response;

import com.pulse.survey.entity.SurveyResponse;
import com.pulse.survey.enums.ResponseStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SurveyResponseDto(
    UUID id,
    UUID surveyId,
    UUID userId,
    ResponseStatus status,
    LocalDateTime submittedAt,
    List<QuestionAnswerDto> answers
) {
    public record QuestionAnswerDto(UUID questionId, String questionText, int rating, String comment, UUID categoryId, String categoryName) {}

    public static SurveyResponseDto from(SurveyResponse sr) {
        List<QuestionAnswerDto> answers = sr.getQuestionResponses().stream().map(qr ->
            new QuestionAnswerDto(
                qr.getQuestion().getId(),
                qr.getQuestion().getQuestionText(),
                qr.getRating(),
                qr.getComment(),
                qr.getQuestion().getCategory().getId(),
                qr.getQuestion().getCategory().getName()
            )
        ).toList();
        return new SurveyResponseDto(
            sr.getId(), sr.getSurvey().getId(), sr.getUser().getId(),
            sr.getStatus(), sr.getSubmittedAt(), answers
        );
    }
}
