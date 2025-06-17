package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.Question;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface QuestionService {

    Question save(Question question);
    List<Question> findAll();
    Optional<Question> findById(Long id);
    Question update(Long id, Question question);
    void deleteById(Long id);

    // Recherche paginée
    Page<Question> searchQuestions(String q, int page, int perPage);

    // Liste par form
    List<Question> findByFormId(Long formId);
}
