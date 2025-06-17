package com.medianet.evalpro.Service;

import com.medianet.evalpro.Dto.AuthRequest;
import com.medianet.evalpro.Dto.AuthResponse;
import com.medianet.evalpro.Dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
}





















// Objectif global de l’interface AuthService
//Définir les méthodes de base nécessaires à la gestion de l’authentification :
//
//register() pour inscrire un nouvel utilisateur.
//
//login() pour authentifier un utilisateur existant.
//
//Elle sera implémentée dans une classe concrète (par exemple AuthServiceImpl).
//
//Permet de séparer clairement la déclaration (interface) de l’implémentation réelle.