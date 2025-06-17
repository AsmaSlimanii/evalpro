package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Entity.Question;
import com.medianet.evalpro.Service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

        // 🔹 CREATE
        @PostMapping
        public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
            return ResponseEntity.ok(questionService.save(question));
        }

        // 🔹 READ ALL
        @GetMapping
        public ResponseEntity<List<Question>> getAllQuestions() {
            return ResponseEntity.ok(questionService.findAll());
        }

        // 🔹 READ ONE BY ID
        @GetMapping("/{id}")
        public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
            return questionService.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        // 🔹 UPDATE
        @PutMapping("/{id}")
        public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question question) {
            try {
                Question updatedQuestion = questionService.update(id, question);
                return ResponseEntity.ok(updatedQuestion);
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }

        // 🔹 DELETE
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
            try {
                questionService.deleteById(id);
                return ResponseEntity.noContent().build();
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }


        // 🔹 READ ALL BY FORM
        @GetMapping("/form/{formId}")
        public ResponseEntity<List<Question>> getByForm(@PathVariable Long formId) {
            return ResponseEntity.ok(questionService.findByFormId(formId));
        }

    // 🔹 SEARCH + PAGINATION
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(name = "per_page", defaultValue = "10") int perPage,
            @RequestParam(name = "q", defaultValue = "") String query
    ) {
        Page<Question> result = questionService.searchQuestions(query, page, perPage);

        Map<String, Object> resp = new HashMap<>();
        resp.put("data", result.getContent());
        resp.put("page", result.getNumber());
        resp.put("per_page", result.getSize());
        resp.put("total", result.getTotalElements());

        return ResponseEntity.ok(resp);
    }
}


