package com.medianet.evalpro.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierDto {
    private Long id;
    private String code;
    private String nomOfficielProjet;
    private String statusLabel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
//    private List<StepDto> steps;
    private Map<String, Integer> steps;
    private int lastCompletedStep;
    private String categorie;


}




