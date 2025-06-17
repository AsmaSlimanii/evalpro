package com.medianet.evalpro.Service;

//import com.medianet.evalpro.Dto.PreIdentificationDto;
import com.medianet.evalpro.Dto.PreIdentificationDto;
import com.medianet.evalpro.Entity.Dossier;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface DossierService {

    Dossier save(Dossier dossier);
    List<Dossier> findAll();
    Optional<Dossier> findById(Long id);
    Dossier update(Long id, Dossier dossier);
    void deleteById(Long id);
    // Recherche par utilisateur
   // List<Dossier> findByUserId(Long userId);

    Page<Dossier> searchDossiers(String q, int page, int size);

    //
    Dossier createNewDossierForUser(String name);

    Dossier createDossier(PreIdentificationDto dto, String email);
//    void saveStep1(Long userId, PreIdentificationDto dto);
}
