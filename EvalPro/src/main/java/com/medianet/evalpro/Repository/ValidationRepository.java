package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.Validation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ValidationRepository extends JpaRepository<Validation, Long> {

    Page<Validation> findByCommentContainingIgnoreCase(String comment, Pageable pageable);
    // Utilise le nom réel du champ dans Validation : validator
    //List<Validation> findByAdminId(Long adminId);

}
