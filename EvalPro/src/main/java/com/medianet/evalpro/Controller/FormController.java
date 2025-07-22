package com.medianet.evalpro.Controller;

//import com.medianet.evalpro.Dto.FormDto;
import com.medianet.evalpro.Dto.FormDTO;
import com.medianet.evalpro.Dto.FormProgressDTO;
import com.medianet.evalpro.Entity.Form;
import com.medianet.evalpro.Service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;

    // 🔹 CREATE
    @PostMapping
    public ResponseEntity<Form> createUser(@RequestBody Form form) {
        return ResponseEntity.ok(formService.save(form));
    }

    // 🔹 READ ALL
    @GetMapping
    public ResponseEntity<List<Form>> getAllForms() {
        return ResponseEntity.ok(formService.findAll());
    }

    // 🔹 READ ONE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Form> getFormById(@PathVariable Long id) {
        return formService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Form> updateForm(@PathVariable Long id, @RequestBody Form form) {
        try {
            Form updatedForm = formService.update(id, form);
            return ResponseEntity.ok(updatedForm);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable Long id) {
        try {
            formService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 SEARCH + PAGINATION
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchForms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(name = "per_page", defaultValue = "10") int perPage,
            @RequestParam(name = "q", defaultValue = "") String query
    ) {
        Page<Form> result = formService.searchForms(query, page, perPage);

        Map<String, Object> resp = new HashMap<>();
        resp.put("data", result.getContent());
        resp.put("page", result.getNumber());
        resp.put("per_page", result.getSize());
        resp.put("total", result.getTotalElements());

        return ResponseEntity.ok(resp);
    }


    @GetMapping("/by-step/{stepName}")
    public ResponseEntity<FormDTO> getFormByStep(@PathVariable String stepName) {
        return ResponseEntity.ok(formService.getFormByStep(stepName));
    }


    @GetMapping("/{step}/dossier/{dossierId}")
    public ResponseEntity<FormDTO> getFormWithResponses(
            @PathVariable String step,
            @PathVariable Long dossierId,
            @RequestParam(required = false) String pillar) {

        FormDTO formDTO = formService.getFormWithResponses(step, dossierId );
        return ResponseEntity.ok(formDTO);
    }


    // ✅ Correction ici : mapping bien formé avec PathVariable
    @GetMapping("/step3-pillar-progress/{dossierId}")
    public ResponseEntity<Map<String, Integer>> getPillarProgressPercentage(@PathVariable Long dossierId) {
        return ResponseEntity.ok(formService.getPillarProgressPercentage(dossierId));
    }



//getformbystepandbydossierid











//    // 🔹 GET BY STEP ID (numeric)
//    @GetMapping("/step/id/{stepId}")
//    public ResponseEntity<List<Form>> getByStep(@PathVariable Long stepId) {
//        return ResponseEntity.ok(formService.findByStepId(stepId));
//    }
//
//    // 🔹 GET FORM STRUCTURE BY STEP NAME (string like "creation-projet")
//    @GetMapping("/structure/{stepName}")
//    public ResponseEntity<Map<String, Object>> getFormByStep(@PathVariable String stepName) {
//        return ResponseEntity.ok(formService.getFormByStep(stepName));
//    }
}
