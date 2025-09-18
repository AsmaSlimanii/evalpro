package com.medianet.evalpro.Service;


import com.medianet.evalpro.Entity.Dossier;
import com.medianet.evalpro.Entity.Step;
import com.medianet.evalpro.Entity.StepHistory;
import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.StepHistoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class StepHistoryServiceImpl implements StepHistoryService{
    private final StepHistoryRepository repo;

    @Override
    public void log(Dossier dossier, Step step, User actor,
                    StepHistory.StepHistoryAction action, String description, boolean visibleToClient) {
        repo.save(StepHistory.builder()
                .dossier(dossier)
                .step(step)
                .actor(actor)
                .action(action)
                .description(description)
                .visibleToClient(visibleToClient)
                .build());
    }
}
