package com.pulse.survey.service;

import com.pulse.survey.dto.request.CreateQuestionRequest;
import com.pulse.survey.dto.request.CreateSurveyRequest;
import com.pulse.survey.dto.request.SurveyQuestionRequest;
import com.pulse.survey.dto.response.QuestionDto;
import com.pulse.survey.dto.response.SurveyDto;
import com.pulse.survey.entity.Category;
import com.pulse.survey.entity.Survey;
import com.pulse.survey.entity.SurveyQuestion;
import com.pulse.survey.entity.User;
import com.pulse.survey.enums.SurveyStatus;
import com.pulse.survey.exception.BadRequestException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.CategoryRepository;
import com.pulse.survey.repository.SurveyQuestionRepository;
import com.pulse.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final SurveyQuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<SurveyDto> getAll() {
        return surveyRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDtoWithQuestions)
                .toList();
    }

    public List<SurveyDto> getActive() {
        return surveyRepository.findByStatus(SurveyStatus.ACTIVE).stream()
                .map(this::toDtoWithQuestions)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SurveyDto> getForEmployee() {
        return surveyRepository.findByStatusInOrderByCreatedAtDesc(
                        List.of(SurveyStatus.ACTIVE, SurveyStatus.CLOSED))
                .stream()
                .map(this::toDtoWithQuestions)
                .toList();
    }

    @Transactional(readOnly = true)
    public SurveyDto getById(UUID id) {
        Survey survey = findSurvey(id);
        survey.getQuestions().size();
        return SurveyDto.from(survey);
    }

    @Transactional
    public SurveyDto create(CreateSurveyRequest req, UUID creatorId) {
        User creator = userService.findUser(creatorId);
        Survey survey = Survey.builder()
                .title(req.title())
                .description(req.description())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .createdBy(creator)
                .build();
        survey = surveyRepository.save(survey);
        syncQuestions(survey, req.questions());
        return SurveyDto.from(surveyRepository.save(survey));
    }

    @Transactional
    public SurveyDto update(UUID id, CreateSurveyRequest req) {
        Survey survey = findSurvey(id);
        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new BadRequestException("Can only edit surveys in DRAFT status");
        }
        survey.setTitle(req.title());
        survey.setDescription(req.description());
        survey.setStartDate(req.startDate());
        survey.setEndDate(req.endDate());
        syncQuestions(survey, req.questions());
        return SurveyDto.from(surveyRepository.save(survey));
    }

    @Transactional
    public SurveyDto activate(UUID id) {
        Survey survey = findSurvey(id);
        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT surveys can be activated");
        }
        if (survey.getQuestions().isEmpty()) {
            throw new BadRequestException("Cannot activate survey with no questions");
        }
        survey.setStatus(SurveyStatus.ACTIVE);
        return SurveyDto.from(surveyRepository.save(survey));
    }

    @Transactional
    public SurveyDto close(UUID id) {
        Survey survey = findSurvey(id);
        if (survey.getStatus() != SurveyStatus.ACTIVE) {
            throw new BadRequestException("Only ACTIVE surveys can be closed");
        }
        survey.setStatus(SurveyStatus.CLOSED);
        return SurveyDto.from(surveyRepository.save(survey));
    }

    @Transactional
    public SurveyDto reopen(UUID id) {
        Survey survey = findSurvey(id);
        if (survey.getStatus() != SurveyStatus.CLOSED) {
            throw new BadRequestException("Only CLOSED surveys can be reopened");
        }
        if (survey.getQuestions().isEmpty()) {
            throw new BadRequestException("Cannot reopen survey with no questions");
        }
        survey.setStatus(SurveyStatus.ACTIVE);
        return SurveyDto.from(surveyRepository.save(survey));
    }

    @Transactional
    public void delete(UUID id) {
        Survey survey = findSurvey(id);
        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT surveys can be deleted");
        }
        surveyRepository.delete(survey);
    }

    @Transactional
    public QuestionDto addQuestion(UUID surveyId, CreateQuestionRequest req) {
        Survey survey = findSurvey(surveyId);
        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new BadRequestException("Can only add questions to DRAFT surveys");
        }
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        SurveyQuestion q = SurveyQuestion.builder()
                .survey(survey)
                .category(category)
                .questionText(req.questionText())
                .questionOrder(req.questionOrder())
                .build();
        return QuestionDto.from(questionRepository.save(q));
    }

    @Transactional
    public QuestionDto updateQuestion(UUID surveyId, UUID questionId, CreateQuestionRequest req) {
        SurveyQuestion q = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        if (!q.getSurvey().getId().equals(surveyId)) {
            throw new BadRequestException("Question does not belong to this survey");
        }
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        q.setQuestionText(req.questionText());
        q.setCategory(category);
        q.setQuestionOrder(req.questionOrder());
        return QuestionDto.from(questionRepository.save(q));
    }

    @Transactional
    public void deleteQuestion(UUID surveyId, UUID questionId) {
        SurveyQuestion q = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        if (!q.getSurvey().getId().equals(surveyId)) {
            throw new BadRequestException("Question does not belong to this survey");
        }
        questionRepository.delete(q);
    }

    public List<QuestionDto> getQuestions(UUID surveyId) {
        return questionRepository.findBySurveyIdOrderByQuestionOrder(surveyId)
                .stream().map(QuestionDto::from).toList();
    }

    public Survey findSurvey(UUID id) {
        return surveyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found: " + id));
    }

    private SurveyDto toDtoWithQuestions(Survey survey) {
        survey.getQuestions().size();
        return SurveyDto.from(survey);
    }

    private void syncQuestions(Survey survey, List<SurveyQuestionRequest> questionReqs) {
        List<SurveyQuestionRequest> requests = questionReqs != null ? questionReqs : List.of();

        Set<UUID> keepIds = new HashSet<>();
        for (SurveyQuestionRequest req : requests) {
            if (req.id() != null) {
                keepIds.add(req.id());
            }
        }

        survey.getQuestions().removeIf(q -> !keepIds.contains(q.getId()));

        for (int i = 0; i < requests.size(); i++) {
            SurveyQuestionRequest req = requests.get(i);
            Category category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

            if (req.id() != null) {
                SurveyQuestion existing = survey.getQuestions().stream()
                        .filter(q -> q.getId().equals(req.id()))
                        .findFirst()
                        .orElseThrow(() -> new BadRequestException("Question not found: " + req.id()));
                existing.setQuestionText(req.questionText());
                existing.setCategory(category);
                existing.setQuestionOrder(i);
            } else {
                survey.getQuestions().add(SurveyQuestion.builder()
                        .survey(survey)
                        .category(category)
                        .questionText(req.questionText())
                        .questionOrder(i)
                        .build());
            }
        }
    }
}
