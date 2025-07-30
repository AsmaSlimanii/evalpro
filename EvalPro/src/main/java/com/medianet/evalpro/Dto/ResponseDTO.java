package com.medianet.evalpro.Dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ResponseDTO {
    private Long id;
    private String value;
    private Long questionId;
    private Long optionId;            // utilisé pour les réponses à choix simple
    private List<Long> optionIds;     // ✅ nouveau champ pour les choix multiples
}









//Cette classe sert à transporter les données d'une réponse entre le backend et le frontend
// ou entre les couches du backend (controller ↔ service).
//
//Elle utilise les annotations Lombok pour générer automatiquement le constructeur, les getters/setters, etc.