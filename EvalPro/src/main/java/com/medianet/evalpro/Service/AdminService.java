package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.Admin;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface AdminService {
    Admin save(Admin admin);
    List<Admin> findAll();
    Optional<Admin> findById(Long id);
    Admin update(Long id, Admin admin);
    void deleteById(Long id);

    Page<Admin> searchAdmins(String q, int page, int perPage);
}
