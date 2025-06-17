package com.medianet.evalpro.Dto;

import lombok.Data;

import java.util.List;

@Data
public class SingleResponseDTO {
    private Long questionId;
    private String value;
    private List<Long> optionIds;
}
