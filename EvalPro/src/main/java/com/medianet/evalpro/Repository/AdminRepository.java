//package com.medianet.evalpro.Repository;
//
//import com.medianet.evalpro.Entity.Admin;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//
//
//public interface AdminRepository  extends JpaRepository<Admin, Long> {
//
//    Page<Admin> findByRoleContainingIgnoreCase(String role, Pageable pageable);
//
//    // Méthode personnalisée optionnelle, si besoin :
//    // List<Admin> findByRole(String role);
//
//}
