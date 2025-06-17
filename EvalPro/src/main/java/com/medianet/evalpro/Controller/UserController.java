package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Entity.User;
import com.medianet.evalpro.Repository.UserRepository;
import com.medianet.evalpro.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    // 🔹 CREATE
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.save(user));
    }

    // 🔹 READ ALL
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    // 🔹 READ ONE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updatedUser = userService.update(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "per_page", defaultValue = "10") int size,
            @RequestParam(name = "q", defaultValue = "") String query) {

        Page<User> userPage = userService.searchUsers(query, page - 1, size); // Quand l'utilisateur demande page=1, on fait page-1 = 0 ➔ Spring lit bien page 0 (la première page).
        Map<String, Object> resp = new HashMap<>();
        resp.put("data", userPage.getContent());
        resp.put("page", userPage.getNumber() + 1); // Remettre +1 pour l'affichage
        resp.put("per_page", userPage.getSize());
        resp.put("total", userPage.getTotalElements());

        // ⚡ Optionnel : ajouter info invalid users
        long invalidCount = userPage.getContent().stream()
                .filter(user -> user.getRole() == null)
                .count();
        resp.put("invalid_users", invalidCount);

        return ResponseEntity.ok(resp);
    }







    // ✅ Méthode à ajouter ici
   // @GetMapping("/current-user")
  //  public ResponseEntity<?> getCurrentUser(Principal principal) {
   //     String username = principal.getName();
    //    User user = (User) userRepository.findByUsername(username)
      //          .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
     //   return ResponseEntity.ok(Map.of("id", user.getId()));
 //   }



    // Avec ça, tes endpoints "GET /api/users?page=0&per_page=20&q=asma" ==> renverront un JSON professionnel incluant :
    //
    //data : liste des utilisateurs sur la page
    //
    //page : numéro de la page
    //
    //per_page : taille de page
    //
    //total : nombre total d’éléments
}