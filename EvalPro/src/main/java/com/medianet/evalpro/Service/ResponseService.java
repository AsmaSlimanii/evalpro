package com.medianet.evalpro.Service;

import com.medianet.evalpro.Dto.ResponseRequestDTO;
import com.medianet.evalpro.Entity.Response;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface ResponseService {
    // CRUD classique
    Response save(Response response);
    List<Response> findAll();
    Optional<Response> findById(Long id);
    Response update(Long id, Response response);
    void deleteById(Long id);

    // Recherche paginée
    Page<Response> searchResponses(String q, int page, int perPage);

    void saveStepResponses(ResponseRequestDTO dto, String name);

  //  void deleteByDossierIdAndStepIdAndQuestionId(Long dossierId, Long stepId, Long questionId);








//    // Listes par relation
//    List<Response> findByDossierId(Long dossierId);
//    List<Response> findByUserId(Long userId);
}
