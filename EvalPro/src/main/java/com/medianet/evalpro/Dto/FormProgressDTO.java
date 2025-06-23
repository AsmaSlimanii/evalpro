package com.medianet.evalpro.Dto;


import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class FormProgressDTO {
    private boolean economique;
    private boolean socio;
    private boolean environnemental;


    public FormProgressDTO(boolean economique, boolean socio, boolean environnemental) {
        this.economique = economique;
        this.socio = socio;
        this.environnemental = environnemental;
    }


}
