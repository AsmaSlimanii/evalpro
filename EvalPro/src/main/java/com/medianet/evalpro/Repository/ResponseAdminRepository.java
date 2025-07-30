package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.ResponseAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResponseAdminRepository extends JpaRepository<ResponseAdmin, Long> {

    List<ResponseAdmin> findByDossierIdAndStepId(Long dossierId, Long stepId);

}
