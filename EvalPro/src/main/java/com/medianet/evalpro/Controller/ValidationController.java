package com.medianet.evalpro.Controller;


import com.medianet.evalpro.Entity.Validation;
import com.medianet.evalpro.Service.ValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/validations")
@RequiredArgsConstructor
public class ValidationController {

    private final ValidationService validationService;



    // 🔹 CREATE
    @PostMapping
    public ResponseEntity<Validation> createValidation(@RequestBody Validation validation) {
        return ResponseEntity.ok(validationService.save(validation));
    }

    // 🔹 READ ALL
    @GetMapping
    public ResponseEntity<List<Validation>> getAllValidations() {
        return ResponseEntity.ok(validationService.findAll());
    }

    // 🔹 READ ONE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Validation> getValidationById(@PathVariable Long id) {
        return validationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Validation> updateValidation(@PathVariable Long id, @RequestBody Validation validation) {
        try {
            Validation updatedValidation = validationService.update(id, validation);
            return ResponseEntity.ok(updatedValidation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            validationService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // 🔹 SEARCH + PAGINATION
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchValidations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(name = "per_page", defaultValue = "10") int perPage,
            @RequestParam(name = "q", defaultValue = "") String query
    ) {
        Page<Validation> result = validationService.searchValidations(query, page, perPage);
        Map<String, Object> resp = new HashMap<>();
        resp.put("data", result.getContent());
        resp.put("page", result.getNumber());
        resp.put("per_page", result.getSize());
        resp.put("total", result.getTotalElements());
        return ResponseEntity.ok(resp);
    }

    // 🔹 BY ADMIN
   // @GetMapping("/admin/{adminId}")
   // public ResponseEntity<List<Validation>> getByAdmin(@PathVariable Long adminId) {
      //  return ResponseEntity.ok(validationService.findByAdminId(adminId));
   // }

    // 🔹 BY USER
  //  @GetMapping("/user/{userId}")
  //  public ResponseEntity<List<Validation>> getByUser(@PathVariable Long userId) {
   //     return ResponseEntity.ok(validationService.findByUserId(userId));
 //   }
}



