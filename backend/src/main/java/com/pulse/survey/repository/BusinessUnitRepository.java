package com.pulse.survey.repository;

import com.pulse.survey.entity.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessUnitRepository extends JpaRepository<BusinessUnit, UUID> {
    Optional<BusinessUnit> findByName(String name);
    boolean existsByName(String name);
}
