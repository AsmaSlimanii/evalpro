package com.medianet.evalpro.Mapper;

import com.medianet.evalpro.Dto.ResponseDTO;
import com.medianet.evalpro.Entity.Response;
import org.springframework.stereotype.Component;

@Component
public class ResponseMapper {
    /** Convertit l'entité JPA Response -> DTO léger pour l'API */
    public ResponseDTO toDto(Response response) {
        return ResponseDTO.builder()
                .id(response.getId())  // Identifiant de la réponse
                .value(response.getValue())  // Valeur saisie (texte/numérique), sinon null pour choix
                .questionId(response.getQuestion().getId())  // Référence à la question (normalisation côté front)
                .optionId(response.getOption() != null ? response.getOption().getId() : null)    // Référence à l’option choisie (si CHOIX)
                .build();
    }
}
//But de cette classe
//Fournir un mapping simple et sûr de l’entité Response vers un ResponseDTO minimal,
// prêt à être renvoyé au frontend sans exposer les entités JPA.