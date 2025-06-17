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
public class QuestionDTO {
    private Long id;
    private String text;
    private String type;
    private boolean isRequired;
    private String value; // ← réponse texte/numérique
    private List<OptionDTO> options;
    private List<Long> optionIds;

}

