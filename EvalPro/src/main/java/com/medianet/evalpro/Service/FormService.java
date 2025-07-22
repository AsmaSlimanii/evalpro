package com.medianet.evalpro.Service;

//import com.medianet.evalpro.Dto.FormDto;
import com.medianet.evalpro.Dto.FormDTO;
import com.medianet.evalpro.Dto.FormProgressDTO;
import com.medianet.evalpro.Entity.Form;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface FormService {

    Form save(Form form);
    List<Form> findAll();
    Optional<Form> findById(Long id);
    Form update(Long id, Form form);
    void deleteById(Long id);

    Page<Form> searchForms(String q, int page, int perPage);



    FormDTO getFormByStep(String stepName);

    FormDTO getFormWithResponses(String step, Long dossierId);
  //  FormProgressDTO getPillarProgress(Long dossierId);

    Map<String, Integer> getPillarProgressPercentage(Long dossierId);



    //List<Form> findByStepId(Long stepId);



//    FormDto getForm(String stepName);

//    Map<String, Object> getFormByStep(String step);
}
