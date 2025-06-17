package com.medianet.evalpro.Service;


import com.medianet.evalpro.Entity.Question;
import com.medianet.evalpro.Repository.QuestionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionServiceImpl implements QuestionService{


    private final  QuestionRepository questionRepository;

    public QuestionServiceImpl(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @Override
    public Question save(Question question) {
        return questionRepository.save(question);
    }

    @Override
    public List<Question> findAll() {
        return questionRepository.findAll();
    }

    @Override
    public Optional<Question> findById(Long id) {
        return questionRepository.findById(id);
    }

    @Override
    public Question update(Long id, Question question) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        question.setId(id);
        return questionRepository.save(question);
    }

    @Override
    public void deleteById(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        questionRepository.deleteById(id);
    }



    @Override
    public Page<Question> searchQuestions(String q, int page, int perPage) {
        Pageable pageable = PageRequest.of(page, perPage, Sort.by("id").ascending());
        return questionRepository.findByTextContainingIgnoreCase(q, pageable);
    }

    @Override
    public List<Question> findByFormId(Long formId) {
        return questionRepository.findByFormsId(formId);
    }
}
