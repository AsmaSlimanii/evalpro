package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.User;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface UserService {

    User save(User user);
    List<User> findAll();
    Optional<User> findById(Long id);
    User update(Long id, User user);
    void deleteById(Long id);// Et celle-ci aussi si absente

    // ajout de la signature pour la recherche/pagination
    Page<User> searchUsers(String query, int page, int size);

    }

