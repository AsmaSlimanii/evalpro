package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.Option;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OptionRepository extends JpaRepository<Option, Long> {

    //  Filtrage paginé sur la valeur
    Page<Option> findByValueContainingIgnoreCase(String value, Pageable pageable);

    // Options d’une question
    List<Option> findByQuestionId(Long questionId);
}
