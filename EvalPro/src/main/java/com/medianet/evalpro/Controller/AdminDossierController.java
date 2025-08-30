package com.medianet.evalpro.Controller;

import com.medianet.evalpro.Dto.AdminDossierItemDto;
import com.medianet.evalpro.Dto.PageDto;
import com.medianet.evalpro.Entity.Dossier;
import com.medianet.evalpro.Service.DossierService;
import com.medianet.evalpro.Service.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dossiers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDossierController {

    private final DossierService dossierService;
    private final PdfService pdfService;

    // ✅ UNIQUE endpoint de liste
    @GetMapping
    public PageDto<AdminDossierItemDto> list(
            @RequestParam(defaultValue = "SOUMIS") Dossier.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Dossier> p = dossierService.listByStatus(status, page, size);

        var items = p.getContent().stream()
                .map(AdminDossierItemDto::from)
                .toList();

        return new PageDto<>(items, p.getTotalElements());
    }

    // ✅ PDF
    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> pdf(@PathVariable Long id) {
        var dossier = dossierService.getForPdf(id);
        byte[] bytes = pdfService.dossierToPdf(dossier);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dossier-" + id + ".pdf\"")
                .body(bytes);
    }
}
