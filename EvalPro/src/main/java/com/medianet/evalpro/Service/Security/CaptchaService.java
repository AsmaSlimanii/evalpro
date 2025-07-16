//package com.medianet.evalpro.Service.Security;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//import java.util.HashMap;
//import java.util.Map;
//
//@Service
//public class CaptchaService {
//
//    @Value("${recaptcha.secret}")  // ✅ PAS "google.recaptcha.secret"
//    private String secret;
//
//    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
//
//    public boolean verifyToken(String token) {
//        if (token == null || token.isEmpty()) return false;
//
//        RestTemplate restTemplate = new RestTemplate();
//        Map<String, String> body = new HashMap<>();
//        body.put("secret", secret);
//        body.put("response", token);
//
//        try {
//            RecaptchaResponse response = restTemplate.postForObject(
//                    VERIFY_URL + "?secret={secret}&response={response}",
//                    null,
//                    RecaptchaResponse.class,
//                    body
//            );
//
//            return response != null && response.isSuccess();
//        } catch (Exception e) {
//            e.printStackTrace();
//            return false;
//        }
//    }
//}
