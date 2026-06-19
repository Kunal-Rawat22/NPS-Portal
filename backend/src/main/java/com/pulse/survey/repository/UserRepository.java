package com.pulse.survey.repository;

import com.pulse.survey.entity.User;
import com.pulse.survey.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleSub(String googleSub);

    List<User> findByBusinessUnitId(UUID businessUnitId);

    List<User> findByHrbpId(UUID hrbpId);

    List<User> findByRole(Role role);

    boolean existsByEmail(String email);

    @Query(value = """
        WITH RECURSIVE subtree AS (
            SELECT id FROM users WHERE id = :rootId
            UNION ALL
            SELECT u.id FROM users u INNER JOIN subtree s ON u.reporting_to_id = s.id
        )
        SELECT * FROM users WHERE id IN (SELECT id FROM subtree) AND id != :rootId
        """, nativeQuery = true)
    List<User> findAllInHierarchy(@Param("rootId") UUID rootId);

    @Query("SELECT u FROM User u WHERE u.competency = :competency AND u.isActive = true")
    List<User> findByCompetency(@Param("competency") String competency);

    @Query("""
        SELECT DISTINCT u.competency FROM User u
        WHERE u.competency IS NOT NULL AND TRIM(u.competency) <> '' AND u.isActive = true
        ORDER BY u.competency
        """)
    List<String> findDistinctCompetencies();
}
