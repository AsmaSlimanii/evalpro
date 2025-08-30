package com.medianet.evalpro.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.medianet.evalpro.Entity.Dossier;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfService {
    public byte[] dossierToPdf(Dossier d) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document();
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ✅ OpenPDF : pas de FontFamily, on utilise FontFactory
            Font title  = FontFactory.getFont(FontFactory.HELVETICA, 18, Font.BOLD);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 12, Font.NORMAL);

            doc.add(new Paragraph("Dossier de projet", title));
            doc.add(new Paragraph(" ", normal));

            doc.add(new Paragraph("ID : " + d.getId(), normal));
            doc.add(new Paragraph("Projet : " + (d.getNomOfficielProjet() == null ? "-" : d.getNomOfficielProjet()), normal));
            doc.add(new Paragraph("Statut : " + d.getStatus(), normal));
            doc.add(new Paragraph("Soumis le : " + d.getSubmittedAt(), normal));
            doc.add(new Paragraph("Créé le : " + d.getCreatedAt(), normal));
            if (d.getUser() != null) {
                doc.add(new Paragraph("Soumis par : " + d.getUser().getEmail(), normal));
            }

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF", e);
        }
    }
}