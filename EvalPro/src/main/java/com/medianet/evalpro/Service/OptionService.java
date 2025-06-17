package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.Option;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface OptionService {

    Option save(Option option);
    List<Option> findAll();
    Optional<Option> findById(Long id);
    Option update(Long id, Option option);
    void deleteById(Long id);


    // Recherche + pagination
    Page<Option> searchOptions(String q, int page, int perPage);

    // Par question
    List<Option> findByQuestionId(Long questionId);
}
