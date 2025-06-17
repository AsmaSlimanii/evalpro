package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    // 1) Recherche paginée par texte
    Page<Question> findByTextContainingIgnoreCase(String text, Pageable pageable);

    // 2) Liste brute des questions d’un Form
    List<Question> findByFormsId(Long formId);


  //  List<Question> findByFormId(Long id);
}
