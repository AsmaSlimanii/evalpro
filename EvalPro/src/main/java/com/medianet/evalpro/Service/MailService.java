package com.medianet.evalpro.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    public void sendResetEmail(String to, String link) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String html = "<h3>Bonjour !</h3>"
                    + "<p>Vous recevez ce mail car vous avez demandé à réinitialiser votre mot de passe.</p>"
                    + "<a href=\"" + link + "\">Réinitialiser le mot de passe</a>"
                    + "<p>Ce lien expirera dans 60 minutes.</p>"
                    + "<p>Cordialement,<br>Asma Slimani</p>";

            helper.setTo(to);
            helper.setSubject("Réinitialisation du mot de passe");
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            // pas de printStackTrace en prod
            log.error("Échec d'envoi de l'email de réinitialisation au destinataire {}", to, e);
            // si l'envoi est critique, remonter une exception :
            throw new IllegalStateException("Erreur lors de l'envoi d'email", e);
            // sinon, supprime la ligne au-dessus et contente-toi du log (mais le flux continuera).
        }
    }
}
