package com.medianet.evalpro.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FormDTO {
    private Long id;
    private String title;
    private String description;
    private List<QuestionDTO> questions;
    private List<ResponseDTO> responses; // ✅ Ajoute ce champ
}
