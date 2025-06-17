package com.medianet.evalpro.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OptionDTO {
    private Long id;
    private String value;

    private boolean selected; // ← essentiel pour les checkbox dans Angular
}

