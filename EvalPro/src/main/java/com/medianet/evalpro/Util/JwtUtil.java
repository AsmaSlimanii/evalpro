package com.medianet.evalpro.Util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    //Déclaration de la clé secrète et de l’expiration
    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private final long EXPIRATION = 86400000; // durée de vie du token, ici 1 jour en millisecondes (86400000 ms).


    //Méthode pour générer un token JWT
    //Cette méthode crée un JWT signé, basé sur l’adresse e-mail de l’utilisateur
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }


    //Méthode pour extraire l'email depuis un token
    //Cette méthode décode le token et récupère le subject, qui est l’email stocké dans le token
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Méthode pour valider un token
    // Cette méthode vérifie que le token est : Bien signé avec la bonne clé ,Pas expiré et Correctement formé
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

//classe JwtUtil, qui est une classe utilitaire pour gérer les tokens JWT (JSON Web Token) dans Mon backend Spring Boot.
// Elle est utilisée dans le cadre de l'authentification sécurisée,
// pour générer, valider et extraire des informations des tokens.



//Objectif global de la classe JwtUtil
//Cette classe sert à :
//
// Générer un JWT lors de l’authentification (generateToken)
//
// Extraire l’email (ou autre info) du token (extractEmail)
//
// Valider un token reçu dans une requête (validateToken)
//
//Elle est indispensable dans une authentification par JWT, car elle gère toute la logique autour des tokens.



