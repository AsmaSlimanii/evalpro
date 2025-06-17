package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.Option;
import com.medianet.evalpro.Repository.OptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OptionServiceImpl implements OptionService{

    private final OptionRepository optionRepository;

    public OptionServiceImpl(OptionRepository optionRepository) {
        this.optionRepository = optionRepository;
    }

    @Override
    public Option save(Option option) {
        return optionRepository.save(option);
    }

    @Override
    public List<Option> findAll() {
        return optionRepository.findAll();
    }

    @Override
    public Optional<Option> findById(Long id) {
        return optionRepository.findById(id);
    }

    @Override
    public Option update(Long id, Option option) {
        if (!optionRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        option.setId(id);
        return optionRepository.save(option);
    }

    @Override
    public void deleteById(Long id) {
        if (!optionRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        optionRepository.deleteById(id);
    }


    @Override
    public Page<Option> searchOptions(String q, int page, int perPage) {
        Pageable pageable = PageRequest.of(page, perPage, Sort.by("id").ascending());
        return optionRepository.findByValueContainingIgnoreCase(q, pageable);
    }

    @Override
    public List<Option> findByQuestionId(Long questionId) {
        return optionRepository.findByQuestionId(questionId);
    }
}
