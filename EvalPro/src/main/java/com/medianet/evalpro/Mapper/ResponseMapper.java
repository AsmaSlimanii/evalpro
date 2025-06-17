package com.medianet.evalpro.Mapper;

import com.medianet.evalpro.Dto.ResponseDTO;
import com.medianet.evalpro.Entity.Response;
import org.springframework.stereotype.Component;

@Component
public class ResponseMapper {

    public ResponseDTO toDto(Response response) {
        return ResponseDTO.builder()
                .id(response.getId())
                .value(response.getValue())
                .questionId(response.getQuestion().getId())
                .optionId(response.getOption() != null ? response.getOption().getId() : null)
                .build();
    }
}