//package com.medianet.evalpro.Service;
//
//import com.medianet.evalpro.Entity.Validation;
//import com.medianet.evalpro.Repository.ValidationRepository;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//
//public class ValidationServiceImpl implements ValidationService {
//
//    private final ValidationRepository validationRepository;
//
//
//    public ValidationServiceImpl(ValidationRepository validationRepository) {
//        this.validationRepository = validationRepository;
//    }
//
//    @Override
//    public Validation save(Validation validation) {
//        return validationRepository.save(validation);
//    }
//
//    @Override
//    public List<Validation> findAll() {
//        return validationRepository.findAll();
//    }
//
//    @Override
//    public Optional<Validation> findById(Long id) {
//        return validationRepository.findById(id);
//    }
//
//    @Override
//    public Validation update(Long id, Validation validation) {
//        if (!validationRepository.existsById(id)) {
//            throw new RuntimeException("Utilisateur non trouvé");
//        }
//        validation.setId(id);
//        return validationRepository.save(validation);
//    }
//
//    @Override
//    public void deleteById(Long id) {
//        if (!validationRepository.existsById(id)) {
//            throw new RuntimeException("Utilisateur non trouvé");
//        }
//        validationRepository.deleteById(id);
//    }
//
//
//    @Override
//    public Page<Validation> searchValidations(String q, int page, int perPage) {
//        Pageable pageable = PageRequest.of(page, perPage, Sort.by("id").ascending());
//        return validationRepository.findByCommentContainingIgnoreCase(q, pageable);
//    }
//
//
//
//
//
//}

