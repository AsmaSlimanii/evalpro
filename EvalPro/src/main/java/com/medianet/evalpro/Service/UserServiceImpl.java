package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service

public class UserServiceImpl implements UserService{
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public User update(Long id, User user) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        user.setId(id);
        return userRepository.save(user);
    }

    @Override
    public void deleteById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        userRepository.deleteById(id);
    }

    // ← implémentation de la recherche paginée
    @Override
    public Page<User> searchUsers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<User> userPage = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);

        // Ajouter un filtrage pour détecter les users avec role = null
        List<User> invalidUsers = userPage.getContent().stream()
                .filter(user -> user.getRole() == null)
                .toList();

        if (!invalidUsers.isEmpty()) {
            System.out.println(" Attention : " + invalidUsers.size() + " utilisateurs ont un role NULL !");
            //  peux logger, ou même envoyer une alerte
        }

        return userPage;
    }

}

