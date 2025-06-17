package com.medianet.evalpro.Service;


import com.medianet.evalpro.Entity.Admin;
import com.medianet.evalpro.Entity.Dossier;
import com.medianet.evalpro.Repository.AdminRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminServiceImpl implements AdminService{

    private final AdminRepository adminRepository;


    public AdminServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public Admin save(Admin admin) {
        return adminRepository.save(admin);
    }
    @Override
    public List<Admin> findAll() {
        return adminRepository.findAll();
    }
    @Override
    public Optional<Admin> findById(Long id) {
        return adminRepository.findById(id);
    }
    @Override
    public Admin update(Long id, Admin admin) {
        if (!adminRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        admin.setId(id);
        return adminRepository.save(admin);
    }

    @Override
    public void deleteById(Long id) {
        if (!adminRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        adminRepository.deleteById(id);
    }

    @Override
    public Page<Admin> searchAdmins(String q, int page, int perPage) {
        Pageable pageable = PageRequest.of(page, perPage, Sort.by("id").ascending());
        return adminRepository.findByRoleContainingIgnoreCase(q, pageable);
    }
}
