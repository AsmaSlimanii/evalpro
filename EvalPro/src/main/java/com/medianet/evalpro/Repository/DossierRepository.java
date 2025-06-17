package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.Dossier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface DossierRepository extends JpaRepository<Dossier, Long> {
    // Récupère le dernier dossier créé par l'utilisateur
    Optional<Dossier> findTopByUserIdOrderByIdDesc(Long userId);


    // 1) Liste brute de tous les dossiers d’un utilisateur
    List<Dossier> findByUserId(Long userId);

    // 2) Pagination + filtrage textuel sur le titre
    Page<Dossier> findByStatusContainingIgnoreCase(String status, Pageable pageable);
    @Query("SELECT d FROM Dossier d JOIN FETCH d.user WHERE d.id = :id")
    Optional<Dossier> findByIdWithUser(@Param("id") Long id);

}
