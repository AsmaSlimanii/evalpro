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