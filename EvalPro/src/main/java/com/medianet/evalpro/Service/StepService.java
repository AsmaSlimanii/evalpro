package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.Step;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface StepService {
    // CRUD classique
    Step save(Step step);
    List<Step> findAll();
    Optional<Step> findById(Long id);
    Step update(Long id, Step step);
    void deleteById(Long id);

    // Recherche paginée
    Page<Step> searchSteps(String q, int page, int size);

    // Liste par dossier
    List<Step> findByDossierId(Long dossierId);
}
