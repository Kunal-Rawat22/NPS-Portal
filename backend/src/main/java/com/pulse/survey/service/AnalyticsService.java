package com.pulse.survey.service;

import com.pulse.survey.dto.response.*;
import com.pulse.survey.entity.QuestionResponse;
import com.pulse.survey.entity.Survey;
import com.pulse.survey.entity.SurveyQuestion;
import com.pulse.survey.entity.SurveyResponse;
import com.pulse.survey.entity.User;
import com.pulse.survey.enums.ResponseStatus;
import com.pulse.survey.enums.Role;
import com.pulse.survey.enums.SurveyStatus;
import com.pulse.survey.exception.BadRequestException;
import com.pulse.survey.exception.ForbiddenException;
import com.pulse.survey.repository.QuestionResponseRepository;
import com.pulse.survey.repository.SurveyResponseRepository;
import com.pulse.survey.repository.UserRepository;
import com.pulse.survey.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final QuestionResponseRepository questionResponseRepo;
    private final SurveyResponseRepository surveyResponseRepo;
    private final UserRepository userRepository;
    private final SurveyService surveyService;
    private final UserService userService;

    private record UserScope(List<UUID> userIds, long totalEmployees) {}

    @Cacheable(value = "analytics", key = "'org:' + #surveyId")
    public AnalyticsOverviewDto getOrgAnalytics(UUID surveyId) {
        Survey survey = loadSurveyForAnalytics(surveyId);
        UserScope scope = resolveOrgScope();
        return buildOverview(survey, loadScopedQuestionResponses(surveyId, scope), scope);
    }

    @Cacheable(value = "analytics", key = "'bu:' + #surveyId + ':' + #buId")
    public AnalyticsOverviewDto getBUAnalytics(UUID surveyId, UUID buId, UserPrincipal principal) {
        Survey survey = loadSurveyForAnalytics(surveyId);
        UserScope scope = resolveBUScope(buId, principal);
        return buildOverview(survey, loadScopedQuestionResponses(surveyId, scope), scope);
    }

    @Cacheable(value = "analytics", key = "'hrbp:direct:' + #surveyId + ':' + #hrbpId")
    public AnalyticsOverviewDto getHrbpDirectAnalytics(UUID surveyId, UUID hrbpId) {
        Survey survey = loadSurveyForAnalytics(surveyId);
        UserScope scope = resolveHrbpDirectScope(hrbpId);
        return buildOverview(survey, loadScopedQuestionResponses(surveyId, scope), scope);
    }

    @Cacheable(value = "analytics", key = "'hrbp:hierarchy:' + #surveyId + ':' + #hrbpId")
    public AnalyticsOverviewDto getHrbpHierarchyAnalytics(UUID surveyId, UUID hrbpId) {
        Survey survey = loadSurveyForAnalytics(surveyId);
        UserScope scope = resolveHrbpHierarchyScope(hrbpId);
        return buildOverview(survey, loadScopedQuestionResponses(surveyId, scope), scope);
    }

    @Cacheable(value = "analytics", key = "'competency:' + #surveyId + ':' + #competency")
    public AnalyticsOverviewDto getCompetencyAnalytics(UUID surveyId, String competency) {
        Survey survey = loadSurveyForAnalytics(surveyId);
        List<User> users = userRepository.findByCompetency(competency);
        UserScope scope = new UserScope(users.stream().map(User::getId).toList(), users.size());
        return buildOverview(survey, loadScopedQuestionResponses(surveyId, scope), scope);
    }

    @Transactional(readOnly = true)
    public List<EnrichedSurveyResponseDto> getOrgResponses(UUID surveyId, UUID categoryId, UUID questionId) {
        loadSurveyForAnalytics(surveyId);
        return buildEnrichedResponses(loadScopedSurveyResponses(surveyId, resolveOrgScope()), categoryId, questionId);
    }

    @Transactional(readOnly = true)
    public List<EnrichedSurveyResponseDto> getBUResponses(UUID surveyId, UUID buId, UserPrincipal principal,
                                                           UUID categoryId, UUID questionId) {
        loadSurveyForAnalytics(surveyId);
        UserScope scope = resolveBUScope(buId, principal);
        return buildEnrichedResponses(loadScopedSurveyResponses(surveyId, scope), categoryId, questionId);
    }

    @Transactional(readOnly = true)
    public List<EnrichedSurveyResponseDto> getHrbpDirectResponses(UUID surveyId, UUID hrbpId,
                                                                   UUID categoryId, UUID questionId) {
        loadSurveyForAnalytics(surveyId);
        UserScope scope = resolveHrbpDirectScope(hrbpId);
        return buildEnrichedResponses(loadScopedSurveyResponses(surveyId, scope), categoryId, questionId);
    }

    @Transactional(readOnly = true)
    public List<EnrichedSurveyResponseDto> getHrbpHierarchyResponses(UUID surveyId, UUID hrbpId,
                                                                      UUID categoryId, UUID questionId) {
        loadSurveyForAnalytics(surveyId);
        UserScope scope = resolveHrbpHierarchyScope(hrbpId);
        return buildEnrichedResponses(loadScopedSurveyResponses(surveyId, scope), categoryId, questionId);
    }

    @Transactional(readOnly = true)
    public List<AnalyticsAnswerDetailDto> getOrgAnswerDetails(UUID surveyId, UUID categoryId, UUID questionId) {
        loadSurveyForAnalytics(surveyId);
        validateDetailFilter(categoryId, questionId);
        return buildAnswerDetails(loadScopedQuestionResponses(surveyId, resolveOrgScope()), categoryId, questionId);
    }

    @Transactional(readOnly = true)
    public List<AnalyticsAnswerDetailDto> getBUAnswerDetails(UUID surveyId, UUID buId, UserPrincipal principal,
                                                              UUID categoryId, UUID questionId) {
        loadSurveyForAnalytics(surveyId);
        validateDetailFilter(categoryId, questionId);
        UserScope scope = resolveBUScope(buId, principal);
        return buildAnswerDetails(loadScopedQuestionResponses(surveyId, scope), categoryId, questionId);
    }

    @Transactional(readOnly = true)
    public List<AnalyticsAnswerDetailDto> getHrbpDirectAnswerDetails(UUID surveyId, UUID hrbpId,
                                                                      UUID categoryId, UUID questionId) {
        loadSurveyForAnalytics(surveyId);
        validateDetailFilter(categoryId, questionId);
        UserScope scope = resolveHrbpDirectScope(hrbpId);
        return buildAnswerDetails(loadScopedQuestionResponses(surveyId, scope), categoryId, questionId);
    }

    @Transactional(readOnly = true)
    public List<AnalyticsAnswerDetailDto> getHrbpHierarchyAnswerDetails(UUID surveyId, UUID hrbpId,
                                                                         UUID categoryId, UUID questionId) {
        loadSurveyForAnalytics(surveyId);
        validateDetailFilter(categoryId, questionId);
        UserScope scope = resolveHrbpHierarchyScope(hrbpId);
        return buildAnswerDetails(loadScopedQuestionResponses(surveyId, scope), categoryId, questionId);
    }

    private Survey loadSurveyForAnalytics(UUID surveyId) {
        Survey survey = surveyService.findSurvey(surveyId);
        if (survey.getStatus() == SurveyStatus.DRAFT) {
            throw new BadRequestException("Analytics are available only for active or completed surveys");
        }
        survey.getQuestions().size();
        return survey;
    }

    private UserScope resolveOrgScope() {
        return new UserScope(null, userRepository.count());
    }

    private UserScope resolveBUScope(UUID buId, UserPrincipal principal) {
        if (principal.getRole() == Role.BU_HEAD) {
            User user = userService.findUser(principal.getId());
            if (user.getBusinessUnit() == null || !user.getBusinessUnit().getId().equals(buId)) {
                throw new ForbiddenException("You can only view analytics for your business unit");
            }
        }
        List<User> buUsers = userRepository.findByBusinessUnitId(buId);
        return new UserScope(buUsers.stream().map(User::getId).toList(), buUsers.size());
    }

    private UserScope resolveHrbpDirectScope(UUID hrbpId) {
        List<User> directReports = userRepository.findByHrbpId(hrbpId);
        return new UserScope(directReports.stream().map(User::getId).toList(), directReports.size());
    }

    private UserScope resolveHrbpHierarchyScope(UUID hrbpId) {
        List<User> hierarchyUsers = new ArrayList<>(userRepository.findAllInHierarchy(hrbpId));
        hierarchyUsers.addAll(userRepository.findByHrbpId(hrbpId));
        List<UUID> userIds = hierarchyUsers.stream().map(User::getId).distinct().toList();
        return new UserScope(userIds, userIds.size());
    }

    private List<QuestionResponse> loadScopedQuestionResponses(UUID surveyId, UserScope scope) {
        List<QuestionResponse> all = questionResponseRepo.findAllSubmittedBySurveyId(surveyId);
        if (scope.userIds() == null) {
            return all;
        }
        Set<UUID> allowed = new HashSet<>(scope.userIds());
        return all.stream()
                .filter(qr -> allowed.contains(qr.getSurveyResponse().getUser().getId()))
                .toList();
    }

    private List<SurveyResponse> loadScopedSurveyResponses(UUID surveyId, UserScope scope) {
        List<SurveyResponse> all = surveyResponseRepo.findBySurveyIdAndStatus(surveyId, ResponseStatus.SUBMITTED);
        if (scope.userIds() == null) {
            return all;
        }
        Set<UUID> allowed = new HashSet<>(scope.userIds());
        return all.stream()
                .filter(sr -> allowed.contains(sr.getUser().getId()))
                .toList();
    }

    private long countCompleted(UUID surveyId, UserScope scope) {
        if (scope.userIds() == null) {
            return surveyResponseRepo.countBySurveyIdAndStatus(surveyId, ResponseStatus.SUBMITTED);
        }
        return surveyResponseRepo.countBySurveyIdAndStatusAndUserIdIn(
                surveyId, ResponseStatus.SUBMITTED, scope.userIds());
    }

    private AnalyticsOverviewDto buildOverview(Survey survey, List<QuestionResponse> responses, UserScope scope) {
        UUID surveyId = survey.getId();
        long completed = countCompleted(surveyId, scope);

        Map<UUID, List<QuestionResponse>> byQuestion = responses.stream()
                .collect(Collectors.groupingBy(qr -> qr.getQuestion().getId()));

        Map<UUID, List<SurveyQuestion>> questionsByCategory = survey.getQuestions().stream()
                .collect(Collectors.groupingBy(q -> q.getCategory().getId()));

        List<CategoryScoreDto> scores = questionsByCategory.entrySet().stream().map(entry -> {
            UUID categoryId = entry.getKey();
            String categoryName = entry.getValue().get(0).getCategory().getName();

            List<QuestionScoreDto> questionScores = entry.getValue().stream()
                    .sorted(Comparator.comparingInt(SurveyQuestion::getQuestionOrder))
                    .map(question -> {
                        List<QuestionResponse> questionResponses =
                                byQuestion.getOrDefault(question.getId(), List.of());
                        double avg = questionResponses.stream()
                                .mapToInt(QuestionResponse::getRating)
                                .average()
                                .orElse(0);
                        long respondents = questionResponses.stream()
                                .map(qr -> qr.getSurveyResponse().getId())
                                .distinct()
                                .count();
                        return new QuestionScoreDto(
                                question.getId(),
                                question.getQuestionText(),
                                question.getQuestionOrder(),
                                round(avg),
                                respondents,
                                completed
                        );
                    })
                    .toList();

            List<QuestionResponse> categoryResponses = responses.stream()
                    .filter(qr -> qr.getQuestion().getCategory().getId().equals(categoryId))
                    .toList();
            double categoryAvg = categoryResponses.stream()
                    .mapToInt(QuestionResponse::getRating)
                    .average()
                    .orElse(0);
            long categoryRespondents = categoryResponses.stream()
                    .map(qr -> qr.getSurveyResponse().getId())
                    .distinct()
                    .count();

            return new CategoryScoreDto(
                    categoryId,
                    categoryName,
                    round(categoryAvg),
                    categoryRespondents,
                    completed,
                    questionScores
            );
        }).sorted(Comparator.comparing(CategoryScoreDto::categoryName)).toList();

        double rate = scope.totalEmployees() > 0 ? (double) completed / scope.totalEmployees() * 100 : 0;
        return new AnalyticsOverviewDto(
                surveyId,
                survey.getTitle(),
                scope.totalEmployees(),
                completed,
                round(rate),
                scores
        );
    }

    private List<EnrichedSurveyResponseDto> buildEnrichedResponses(List<SurveyResponse> responses,
                                                                    UUID categoryId,
                                                                    UUID questionId) {
        return responses.stream()
                .map(sr -> toEnrichedDto(sr, categoryId, questionId))
                .filter(dto -> !dto.answers().isEmpty())
                .sorted(Comparator.comparing(EnrichedSurveyResponseDto::submittedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private EnrichedSurveyResponseDto toEnrichedDto(SurveyResponse sr, UUID categoryId, UUID questionId) {
        sr.getQuestionResponses().size();
        User user = sr.getUser();
        List<SurveyResponseDto.QuestionAnswerDto> answers = sr.getQuestionResponses().stream()
                .map(qr -> new SurveyResponseDto.QuestionAnswerDto(
                        qr.getQuestion().getId(),
                        qr.getQuestion().getQuestionText(),
                        qr.getRating(),
                        qr.getComment(),
                        qr.getQuestion().getCategory().getId(),
                        qr.getQuestion().getCategory().getName()
                ))
                .filter(a -> categoryId == null || a.categoryId().equals(categoryId))
                .filter(a -> questionId == null || a.questionId().equals(questionId))
                .toList();

  return new EnrichedSurveyResponseDto(
                sr.getId(),
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                sr.getStatus(),
                sr.getSubmittedAt(),
                answers
        );
    }

    private List<AnalyticsAnswerDetailDto> buildAnswerDetails(List<QuestionResponse> responses,
                                                               UUID categoryId,
                                                               UUID questionId) {
        return responses.stream()
                .filter(qr -> categoryId == null || qr.getQuestion().getCategory().getId().equals(categoryId))
                .filter(qr -> questionId == null || qr.getQuestion().getId().equals(questionId))
                .map(qr -> {
                    User user = qr.getSurveyResponse().getUser();
                    return new AnalyticsAnswerDetailDto(
                            qr.getSurveyResponse().getId(),
                            user.getId(),
                            user.getFirstName() + " " + user.getLastName(),
                            user.getEmail(),
                            qr.getQuestion().getId(),
                            qr.getQuestion().getQuestionText(),
                            qr.getQuestion().getCategory().getId(),
                            qr.getQuestion().getCategory().getName(),
                            qr.getRating(),
                            qr.getComment(),
                            qr.getSurveyResponse().getSubmittedAt()
                    );
                })
                .sorted(Comparator
                        .comparing(AnalyticsAnswerDetailDto::submittedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(AnalyticsAnswerDetailDto::userName))
                .toList();
    }

    private void validateDetailFilter(UUID categoryId, UUID questionId) {
        if (categoryId == null && questionId == null) {
            throw new BadRequestException("Either categoryId or questionId is required");
        }
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
