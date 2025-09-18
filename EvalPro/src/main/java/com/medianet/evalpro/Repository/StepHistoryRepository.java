package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.StepHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StepHistoryRepository extends JpaRepository<StepHistory, Long> {
    List<StepHistory> findByDossierIdOrderByCreatedAtDesc(Long dossierId);
    List<StepHistory> findByDossierIdAndStepIdOrderByCreatedAtDesc(Long dossierId, Long stepId);

    // en plus, utile si tu veux aussi les actions globales
    @Query("""
      select h from StepHistory h
      where h.dossier.id = :dossierId and (h.step.id = :stepId or h.step is null)
      order by h.createdAt desc
    """)
    List<StepHistory> findTimelineWithStepOrGlobal(@Param("dossierId") Long dossierId,
                                                   @Param("stepId") Long stepId);

}
