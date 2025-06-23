package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.Form;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FormRepository extends JpaRepository<Form, Long> {
    // 1) Paginer et filtrer sur le nom de l’étape
    Page<Form> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    // 2) Liste brute des questions d’un Form
    //List<Form> findByStepId(Long stepId);

    Optional<Form> findByStepName(String stepName);



}
