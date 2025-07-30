package com.medianet.evalpro.Dto;

import com.medianet.evalpro.Entity.User.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String prenom;
    private String birthdate;
    private String gender;
    private String email;
    private String password;
    private String confirmPassword;
    private String phone;
    private String discovery;
    private String activation;
    private Role role; // facultatif si toujours CLIENT

}












//classe DTO ?
//DTO = Data Transfer Object
//👉 C’est une classe spéciale utilisée pour transporter des données entre le client (frontend) et le serveur (backend),
// ou entre les différentes couches d’une application (Controller ↔ Service ↔ Repository...).


//Résumé :
//DTOs = "boîtes de transport" de données, entre le frontend et le backend.
//
//Ils sont adaptés à des cas précis (login, register, update, affichage...).