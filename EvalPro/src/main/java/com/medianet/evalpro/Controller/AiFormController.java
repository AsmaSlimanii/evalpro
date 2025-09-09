package com.medianet.evalpro.Controller;



import com.medianet.evalpro.Dto.FormSchema;
import com.medianet.evalpro.Entity.AiForm;
import com.medianet.evalpro.Service.AiFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    // AiFormController.java
    @PostMapping
    public AiForm save(@RequestBody SaveReq req) throws Exception {
        if (req.schema() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "schema manquant");
        }
        System.out.println("[AI-FORM] POST save stepId=" + req.stepId()
                + " title=" + req.schema().getTitle()
                + " fields=" + (req.schema().getFields()==null?0:req.schema().getFields().size()));

        return service.save(req.stepId(), req.schema());
    }




    // AiFormController.java
    @GetMapping("/{stepId}")
    public ResponseEntity<FormSchema> get(@PathVariable String stepId) {
        if (stepId == null || stepId.equalsIgnoreCase("null")) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Long id = Long.valueOf(stepId);
            return service.getForStep(id).map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
