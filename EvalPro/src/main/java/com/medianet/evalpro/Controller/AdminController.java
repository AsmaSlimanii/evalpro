package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Entity.Admin;
import com.medianet.evalpro.Service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
        return ResponseEntity.ok(adminService.save(admin));
    }

    // 🔹 READ ALL
    @GetMapping
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.findAll());
    }

    // 🔹 READ ONE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long id) {
        return adminService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // 🔹 UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Admin> updateAdmin(@PathVariable Long id, @RequestBody Admin admin) {
        try {
            Admin updatedAdmin = adminService.update(id, admin);
            return ResponseEntity.ok(updatedAdmin);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        try {
            adminService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 SEARCH + PAGINATION
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchAdmins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(name = "per_page", defaultValue = "10") int perPage,
            @RequestParam(name = "q", defaultValue = "") String query
    ) {
        Page<Admin> result = adminService.searchAdmins(query, page, perPage);

        Map<String, Object> resp = new HashMap<>();
        resp.put("data", result.getContent());
        resp.put("page", result.getNumber());
        resp.put("per_page", result.getSize());
        resp.put("total", result.getTotalElements());

        return ResponseEntity.ok(resp);
    }
}