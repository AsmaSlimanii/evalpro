package com.medianet.evalpro.Service;



import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medianet.evalpro.Dto.FormSchema;
import com.medianet.evalpro.Repository.AiFormRepository;
import com.medianet.evalpro.Entity.AiForm;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service @RequiredArgsConstructor
public class AiFormService {
    private final AiClient ai;
    private final AiFormRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    public FormSchema generate(Long stepId, String description, String stepName){
        return ai.generate(description, stepName);
    }
    // AiFormService.java
    public AiForm save(Long stepId, FormSchema schema) throws JsonProcessingException {
        if (schema == null) throw new IllegalArgumentException("schema null");
        AiForm e = new AiForm();
        e.setStepId(stepId);
        e.setTitle(schema.getTitle());
        e.setSchemaJson(mapper.writeValueAsString(schema));
        return repo.save(e);
    }

    public Optional<FormSchema> getForStep(Long stepId){
        return repo.findTopByStepIdOrderByIdDesc(stepId).map(a -> {
            try { return mapper.readValue(a.getSchemaJson(), FormSchema.class); }
            catch (Exception ex) { return null; }
        });
    }


}

