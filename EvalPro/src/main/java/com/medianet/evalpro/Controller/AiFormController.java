package com.medianet.evalpro.Controller;



import com.medianet.evalpro.Dto.FormSchema;
import com.medianet.evalpro.Entity.AiForm;
import com.medianet.evalpro.Service.AiFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/forms")
@RequiredArgsConstructor
public class AiFormController {
    private final AiFormService service;

    record GenReq(Long stepId, String stepName, String description) {}
    record SaveReq(Long stepId, FormSchema schema) {}

    @PostMapping("/generate")
    public FormSchema generate(@RequestBody GenReq req) {
        return service.generate(req.stepId(), req.description(), req.stepName());
    }

    @PostMapping
    public AiForm save(@RequestBody SaveReq req) throws Exception {
        return service.save(req.stepId(), req.schema());
    }

    @GetMapping("/{stepId}")
    public ResponseEntity<FormSchema> get(@PathVariable Long stepId) {
        return service.getForStep(stepId).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
