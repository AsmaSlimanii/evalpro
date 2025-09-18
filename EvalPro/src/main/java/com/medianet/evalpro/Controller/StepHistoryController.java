package com.medianet.evalpro.Controller;


import com.medianet.evalpro.Dto.StepHistoryDto;
import com.medianet.evalpro.Entity.StepHistory;
import com.medianet.evalpro.Repository.StepHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class StepHistoryController {

    private final StepHistoryRepository repo;

    @GetMapping("/dossier/{dossierId}")
    public List<StepHistory> listByDossier(@PathVariable Long dossierId) {
        return repo.findByDossierIdOrderByCreatedAtDesc(dossierId);
    }

    @GetMapping("/dossier/{dossierId}/step/{stepId}")
    public List<StepHistoryDto> listByDossierAndStep(@PathVariable Long dossierId,
                                                     @PathVariable Long stepId) {
        return repo.findTimelineWithStepOrGlobal(dossierId, stepId)
                .stream()
                .map(StepHistoryDto::of)
                .toList();
    }
    @DeleteMapping("/{id}")
    public void deleteOne(@PathVariable Long id) {
        repo.deleteById(id);
    }


}
