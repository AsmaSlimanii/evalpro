package com.medianet.evalpro.Mapper;

import com.medianet.evalpro.Dto.OptionDTO;
import com.medianet.evalpro.Dto.QuestionDTO;
import com.medianet.evalpro.Entity.Option;
import com.medianet.evalpro.Entity.Question;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class QuestionMapper {

    public QuestionDTO toDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .type(question.getType().name())
                .isRequired(question.isRequired())
                .pillar(question.getPillar())
                .options(question.getOptions().stream()
                        .map(this::toOptionDTO)
                        .collect(Collectors.toList()))
                .parentQuestionId(question.getParentQuestionId())   // 👈 très important
                .parentOptionId(question.getParentOptionId())       // 👈 très important
                .build();
    }

    public OptionDTO toOptionDTO(Option option) {
        return OptionDTO.builder()
                .id(option.getId())
                .value(option.getValue())
                .build();
    }
}

