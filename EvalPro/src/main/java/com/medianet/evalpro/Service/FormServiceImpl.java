package com.medianet.evalpro.Service;

import com.medianet.evalpro.Dto.FormDTO;
import com.medianet.evalpro.Dto.FormProgressDTO;
import com.medianet.evalpro.Dto.OptionDTO;
import com.medianet.evalpro.Dto.QuestionDTO;
import com.medianet.evalpro.Entity.*;
import com.medianet.evalpro.Mapper.QuestionMapper;
import com.medianet.evalpro.Mapper.ResponseMapper;
import com.medianet.evalpro.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormServiceImpl implements FormService {

    private final FormRepository formRepository;
    private final QuestionRepository questionRepository;
    private final ResponseRepository responseRepository;
    private final StepRepository stepRepository;
    private final ResponseMapper responseMapper;
    private final QuestionMapper questionMapper;
    private final ResponseAdminRepository responseAdminRepository;



    @Override
    public Form save(Form form) {
        return formRepository.save(form);
    }

    @Override
    public List<Form> findAll() {
        return formRepository.findAll();
    }

    @Override
    public Optional<Form> findById(Long id) {
        return formRepository.findById(id);
    }

    @Override
    public Form update(Long id, Form form) {
        if (!formRepository.existsById(id)) {
            throw new RuntimeException("Formulaire non trouvé");
        }
        form.setId(id);
        return formRepository.save(form);
    }

    @Override
    public void deleteById(Long id) {
        if (!formRepository.existsById(id)) {
            throw new RuntimeException("Formulaire non trouvé");
        }
        formRepository.deleteById(id);
    }

    @Override
    public Page<Form> searchForms(String q, int page, int perPage) {
        Pageable pageable = PageRequest.of(page, perPage, Sort.by("id").ascending());
        return formRepository.findByTitleContainingIgnoreCase(q, pageable);
    }

    @Override
    public FormDTO getFormByStep(String stepName) {
        Step step = stepRepository.findByName(stepName)
                .orElseThrow(() -> new RuntimeException("Étape introuvable : " + stepName));

        Form form = step.getForms().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Aucun formulaire trouvé pour cette étape"));

        List<QuestionDTO> questionDTOs = form.getQuestions().stream()
                .map(questionMapper::toDTO)
                .collect(Collectors.toList());


        return FormDTO.builder()
                .id(form.getId())
                .title(form.getTitle())
                .description(form.getDescription())
                .questions(questionDTOs)
                .build();
    }


    @Override
    public FormDTO getFormWithResponses(String step, Long dossierId) {
        Form form = (Form) formRepository.findByStepName(step)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        Long stepId = form.getStep().getId(); // 🔴 tu récupères l'ID de l'étape

        List<Question> questions = questionRepository.findAllByStepId(stepId);

        List<Response> responses = responseRepository.findByFormIdAndDossierId(form.getId(), dossierId);

        List<QuestionDTO> questionDTOs = questions.stream().map(q -> {
            QuestionDTO qDto = questionMapper.toDTO(q); // ✅ utilise le mapper avec parentQuestionId etc.

            // injecter la réponse texte/numérique
            qDto.setValue(
                    responses.stream()
                            .filter(r -> r.getQuestion().getId().equals(q.getId()) && r.getValue() != null)
                            .map(Response::getValue)
                            .findFirst()
                            .orElse(null)
            );

            // injecter les options sélectionnées
            qDto.setOptionIds(
                    responses.stream()
                            .filter(r -> r.getQuestion().getId().equals(q.getId()) && r.getOption() != null)
                            .map(r -> r.getOption().getId())
                            .collect(Collectors.toList())
            );

            // injecter les options avec selected = true
            if (q.getOptions() != null) {
                List<OptionDTO> optionDTOs = q.getOptions().stream().map(o -> {
                    boolean isSelected = responses.stream().anyMatch(r ->
                            r.getQuestion().getId().equals(q.getId()) &&
                                    r.getOption() != null &&
                                    r.getOption().getId().equals(o.getId())
                    );
                    return OptionDTO.builder()
                            .id(o.getId())
                            .value(o.getValue())
                            .selected(isSelected)
                            .build();
                }).collect(Collectors.toList());

                qDto.setOptions(optionDTOs);
            }

            return qDto;
        }).collect(Collectors.toList());



       List<ResponseAdmin> adminComment = responseAdminRepository.findByDossierIdAndStepId(dossierId, form.getStep().getId());



        return FormDTO.builder()
                .id(form.getId())
                .title(form.getTitle())
                .description(form.getDescription())
                .questions(questionDTOs)
                .comment(adminComment.isEmpty() ? null : adminComment.get(0).getComment())
                .responses(responses.stream()
                        .map(responseMapper::toDto)
                        .collect(Collectors.toList()))
                .build();
    }

    public Map<String, Integer> getPillarProgressPercentage(Long dossierId) {
        Map<String, Integer> progressMap = new HashMap<>();
        List<String> pillars = List.of("ECONOMIQUE", "SOCIO", "ENVIRONNEMENTAL");
        Long stepId = 3L; // ID de l'étape auto-évaluation

        for (String pillar : pillars) {
            long totalQuestions = Optional.ofNullable(
                    questionRepository.countQuestionsByPillarAndStep(pillar, stepId)
            ).orElse(0L);

            Long answered = Optional.ofNullable(
                    responseRepository.countResponsesByDossierIdAndPillar(dossierId, pillar)
            ).orElse(0L);

            int progress = (totalQuestions == 0) ? 0 : (int) Math.round(answered * 100.0 / totalQuestions);

            progressMap.put(pillar, progress);
            System.out.println("Progress " + pillar + ": " + answered + "/" + totalQuestions + " → " + progress + "%");
        }

        return progressMap;
    }


}