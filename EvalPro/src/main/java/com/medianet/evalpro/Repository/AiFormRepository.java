package com.medianet.evalpro.Repository;




import com.medianet.evalpro.Entity.AiForm;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AiFormRepository extends JpaRepository<AiForm, Long> {
    Optional<AiForm> findTopByStepIdOrderByIdDesc(Long stepId);
}
