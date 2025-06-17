package com.medianet.evalpro.Controller;


import com.medianet.evalpro.Entity.Step;
import com.medianet.evalpro.Service.StepService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/steps")
@RequiredArgsConstructor
public class StepController {

    private final StepService stepService;

    // 🔹 CREATE
    @PostMapping
    public ResponseEntity<Step> createStep(@RequestBody Step step) {
        return ResponseEntity.ok(stepService.save(step));
    }

    // 🔹 READ ALL
    @GetMapping
    public ResponseEntity<List<Step>> getAllSteps() {
        return ResponseEntity.ok(stepService.findAll());
    }

    // 🔹 READ ONE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Step> getStepById(@PathVariable Long id) {
        return stepService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Step> updateStep(@PathVariable Long id, @RequestBody Step step) {
        try {
            Step updatedStep = stepService.update(id, step);
            return ResponseEntity.ok(updatedStep);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStep(@PathVariable Long id) {
        try {
            stepService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // 🔹 READ ALL BY DOSSIER
    @GetMapping("/dossier/{dossierId}")
    public ResponseEntity<List<Step>> getByDossier(@PathVariable Long dossierId) {
        return ResponseEntity.ok(stepService.findByDossierId(dossierId));
    }

    // 🔹 SEARCH + PAGINATION
    @GetMapping("/search")
    public ResponseEntity<Map<String,Object>> searchSteps(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(name = "per_page", defaultValue = "10") int perPage,
            @RequestParam(name = "q", defaultValue = "") String query
    ) {
        Page<Step> result = stepService.searchSteps(query, page, perPage);

        Map<String,Object> resp = new HashMap<>();
        resp.put("data", result.getContent());
        resp.put("page", result.getNumber());
        resp.put("per_page", result.getSize());
        resp.put("total", result.getTotalElements());

        return ResponseEntity.ok(resp);
    }
}
