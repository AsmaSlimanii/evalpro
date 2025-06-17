package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.Step;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StepRepository extends JpaRepository<Step, Long> {

    // 1) Paginer et filtrer sur le nom de l’étape
    Page<Step> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // 2) Liste brute de toutes les étapes d’un dossier
    List<Step> findByDossierId(Long dossierId);
    Optional<Step> findByName(String name);
}
