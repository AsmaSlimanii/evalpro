package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Entity.Option;
import com.medianet.evalpro.Service.OptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/Options")
@RequiredArgsConstructor
public class OptionController {

    private final OptionService optionService;

    // 🔹 CREATE
    @PostMapping
    public ResponseEntity<Option> createOption(@RequestBody Option option) {
        return ResponseEntity.ok(optionService.save(option));
    }

    // 🔹 READ ALL
    @GetMapping
    public ResponseEntity<List<Option>> getAllOptions() {
        return ResponseEntity.ok(optionService.findAll());
    }

    // 🔹 READ ONE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Option> getOptionById(@PathVariable Long id) {
        return optionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Option> updateOption(@PathVariable Long id, @RequestBody Option option) {
        try {
            Option updatedOption = optionService.update(id, option);
            return ResponseEntity.ok(updatedOption);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOption(@PathVariable Long id) {
        try {
            optionService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // 🔹 GET ALL OPTIONS FOR A QUESTION
    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<Option>> getByQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(optionService.findByQuestionId(questionId));
    }

    // 🔹 SEARCH + PAGINATION
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchOptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(name = "per_page", defaultValue = "10") int perPage,
            @RequestParam(name = "q", defaultValue = "") String query
    ) {
        Page<Option> result = optionService.searchOptions(query, page, perPage);

        Map<String, Object> resp = new HashMap<>();
        resp.put("data", result.getContent());
        resp.put("page", result.getNumber());
        resp.put("per_page", result.getSize());
        resp.put("total", result.getTotalElements());

        return ResponseEntity.ok(resp);
    }
}
