package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.Step;
import com.medianet.evalpro.Repository.StepRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StepServiceImpl implements StepService {

    private final StepRepository stepRepository;

    public StepServiceImpl(StepRepository stepRepository) {
        this.stepRepository = stepRepository;
    }

    @Override
    public Step save(Step step) {
        return stepRepository.save(step);
    }

    @Override
    public List<Step> findAll() {
        return stepRepository.findAll();
    }

    @Override
    public Optional<Step> findById(Long id) {
        return stepRepository.findById(id);
    }

    @Override
    public Step update(Long id, Step step) {
        if (!stepRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        step.setId(id);
        return stepRepository.save(step);
    }

    @Override
    public void deleteById(Long id) {
        if (!stepRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        stepRepository.deleteById(id);
    }



    @Override
    public Page<Step> searchSteps(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return stepRepository.findByNameContainingIgnoreCase(q, pageable);

    }

    @Override
    public List<Step> findByDossierId(Long dossierId) {
        return stepRepository.findByDossierId(dossierId);
    }
}
