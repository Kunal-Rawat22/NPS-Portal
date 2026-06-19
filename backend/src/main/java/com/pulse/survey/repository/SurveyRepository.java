package com.pulse.survey.repository;

import com.pulse.survey.entity.Survey;
import com.pulse.survey.enums.SurveyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, UUID> {
    List<Survey> findByStatus(SurveyStatus status);
    List<Survey> findByStatusInOrderByCreatedAtDesc(List<SurveyStatus> statuses);
    List<Survey> findByCreatedById(UUID createdById);
    List<Survey> findAllByOrderByCreatedAtDesc();
}
