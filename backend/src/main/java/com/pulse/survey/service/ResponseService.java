package com.pulse.survey.service;

import com.pulse.survey.dto.request.SaveResponseRequest;
import com.pulse.survey.dto.response.SurveyResponseDto;
import com.pulse.survey.entity.*;
import com.pulse.survey.enums.ResponseStatus;
import com.pulse.survey.enums.SurveyStatus;
import com.pulse.survey.exception.BadRequestException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResponseService {

    private final SurveyResponseRepository surveyResponseRepo;
    private final QuestionResponseRepository questionResponseRepo;
    private final SurveyQuestionRepository questionRepo;
    private final SurveyService surveyService;
    private final UserService userService;

    @Transactional(readOnly = true)
    public SurveyResponseDto getMyResponse(UUID surveyId, UUID userId) {
        return surveyResponseRepo.findBySurveyIdAndUserId(surveyId, userId)
                .map(this::toDto)
                .orElse(null);
    }

    @Transactional
    public SurveyResponseDto startResponse(UUID surveyId, UUID userId) {
        Survey survey = surveyService.findSurvey(surveyId);
        if (survey.getStatus() != SurveyStatus.ACTIVE) {
            throw new BadRequestException("Survey is not active");
        }
        return surveyResponseRepo.findBySurveyIdAndUserId(surveyId, userId)
                .map(this::toDto)
                .orElseGet(() -> {
                    User user = userService.findUser(userId);
                    SurveyResponse response = SurveyResponse.builder().survey(survey).user(user).build();
                    try {
                        return toDto(surveyResponseRepo.save(response));
                    } catch (DataIntegrityViolationException ex) {
                        return surveyResponseRepo.findBySurveyIdAndUserId(surveyId, userId)
                                .map(this::toDto)
                                .orElseThrow(() -> ex);
                    }
                });
    }

    @Transactional
    public SurveyResponseDto saveDraft(UUID responseId, UUID userId, SaveResponseRequest req) {
        SurveyResponse response = findResponse(responseId, userId);
        if (response.getStatus() == ResponseStatus.SUBMITTED) {
            throw new BadRequestException("Cannot modify a submitted response");
        }
        saveAnswers(response, req);
        return toDto(surveyResponseRepo.save(response));
    }

    @Transactional
    public SurveyResponseDto submit(UUID responseId, UUID userId) {
        SurveyResponse response = findResponse(responseId, userId);
        if (response.getStatus() == ResponseStatus.SUBMITTED) {
            throw new BadRequestException("Already submitted");
        }

        Survey survey = response.getSurvey();
        survey.getQuestions().size();
        long answeredCount = response.getQuestionResponses().stream()
                .filter(qr -> qr.getRating() >= 1 && qr.getRating() <= 5)
                .count();
        if (answeredCount < survey.getQuestions().size()) {
            throw new BadRequestException("Please answer all questions before submitting");
        }

        response.setStatus(ResponseStatus.SUBMITTED);
        response.setSubmittedAt(LocalDateTime.now());
        return toDto(surveyResponseRepo.save(response));
    }

    private void saveAnswers(SurveyResponse response, SaveResponseRequest req) {
        if (req.answers() == null) {
            return;
        }
        for (SaveResponseRequest.QuestionAnswer answer : req.answers()) {
            if (answer.rating() < 1 || answer.rating() > 5) {
                continue;
            }
            SurveyQuestion question = questionRepo.findById(answer.questionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
            if (!question.getSurvey().getId().equals(response.getSurvey().getId())) {
                throw new BadRequestException("Question does not belong to this survey");
            }

            QuestionResponse existing = response.getQuestionResponses().stream()
                    .filter(qr -> qr.getQuestion().getId().equals(answer.questionId()))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                existing.setRating(answer.rating());
                existing.setComment(answer.comment());
            } else {
                QuestionResponse qr = QuestionResponse.builder()
                        .surveyResponse(response)
                        .question(question)
                        .rating(answer.rating())
                        .comment(answer.comment())
                        .build();
                response.getQuestionResponses().add(qr);
            }
        }
    }

    private SurveyResponse findResponse(UUID responseId, UUID userId) {
        SurveyResponse response = surveyResponseRepo.findById(responseId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey response not found"));
        if (!response.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only modify your own responses");
        }
        response.getQuestionResponses().size();
        return response;
    }

    private SurveyResponseDto toDto(SurveyResponse response) {
        response.getQuestionResponses().size();
        return SurveyResponseDto.from(response);
    }

    public List<SurveyResponseDto> getAllResponsesBySurvey(UUID surveyId) {
        return surveyResponseRepo.findBySurveyId(surveyId).stream()
                .map(SurveyResponseDto::from).toList();
    }
}
