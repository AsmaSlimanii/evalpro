package com.medianet.evalpro.Dto;

import lombok.Data;

import java.util.List;

@Data
public class ResponseRequestDTO {
    private Long formId;
    private Long dossierId;
    private List<SingleResponseDTO> responses;
    private Long stepId;
    private String pillar;
    private String comment;



}
