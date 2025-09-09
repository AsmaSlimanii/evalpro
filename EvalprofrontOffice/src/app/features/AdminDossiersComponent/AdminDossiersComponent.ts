import { Component, OnInit } from '@angular/core';
import { AdminDossierItem, AdminDossiersService } from '../../core/services/AdminDossiersService';
import { DossierStatus } from '../../shared/models/status';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-dossiers',
    templateUrl: './AdminDossiersComponent.html',
    styleUrls: ['./AdminDossiersComponent.scss']
})


export class AdminDossiersComponent implements OnInit {
    rows: AdminDossierItem[] = [];
    total = 0;
    page = 0;
    size = 10;
    status: DossierStatus = DossierStatus.SOUMIS;   // filtre sélectionné
    loading = false;
    message = '';
    readonly Math = Math;

    q = ''; // recherche
    labels: Record<DossierStatus, string> = {
        SOUMIS: 'Soumis',
        EN_COURS: 'En cours',
        ACCEPTE: 'Accepté',
        VALIDE: 'Validé',
        REJETE: 'Rejeté'
    };

    constructor(private api: AdminDossiersService,  private router: Router) { }

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading = true;
        this.api.list(this.status.toString() as 'SOUMIS' | 'ACCEPTE' | 'REJETE' | 'EN_COURS', this.page, this.size).subscribe({
            next: (r: { items: AdminDossierItem[]; total: number }) => {
                this.rows = r.items;
                this.total = r.total;
                this.loading = false;
            },
            error: (e: unknown) => {
                this.message = 'Erreur chargement';
                this.loading = false;
                console.error(e);
            }
        });
    }


    get filteredRows() {
        const k = (this.q || '').toLowerCase().trim();
        if (!k) { return this.rows; }
        return this.rows.filter(r =>
            (r.titre || '').toLowerCase().includes(k) ||
            (r.ownerEmail || '').toLowerCase().includes(k) ||
            String(r.id).includes(k)
        );
    }

    setPage(p: number): void {
        if (p < 0) return;
        this.page = p;
        this.load();
    }

    // ✅ met le dossier en EN_COURS puis ouvre le Step 1
    startValidation(d: AdminDossierItem): void {
        this.loading = true;

        this.api.updateStatus(d.id, 'EN_COURS').subscribe({
            next: _ => {
                this.loading = false;
                // ouvre la page d’édition Step 1 (où l’admin voit les réponses et peut commenter)
                this.router.navigate(['/projects/edit', d.id, 'step1']);
            },
            error: e => {
                // en cas d’erreur de statut, on navigue quand même (optionnel)
                console.error(e);
                this.loading = false;
                this.router.navigate(['/projects/edit', d.id, 'step1']);
            }
        });
    }


    open(id: number): void {
        this.api.downloadPdf(id).subscribe({
            next: (blob: Blob) => {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');                 // ouvre le PDF
                setTimeout(() => URL.revokeObjectURL(url), 60_000);
            },
            error: (e: unknown) => {
                this.message = 'Impossible d’ouvrir le PDF';
                console.error(e);
            }
        });
    }

    print(id: number): void {
        this.api.downloadPdf(id).subscribe({
            next: (blob: Blob) => {
                const url = URL.createObjectURL(blob);
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = url;
                document.body.appendChild(iframe);
                iframe.onload = () => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();            // lance l’impression
                    setTimeout(() => {
                        URL.revokeObjectURL(url);
                        document.body.removeChild(iframe);
                    }, 1000);
                };
            },
            error: (e: unknown) => {
                this.message = 'Erreur impression PDF';
                console.error(e);
            }
        });
    }


    download(id: number, titre: string): void {
        this.api.downloadPdf(id).subscribe({
            next: (blob: Blob) => {
                const safe = (titre || 'dossier')
                    .replace(/[^\w\-]+/g, '_')
                    .replace(/_{2,}/g, '_')
                    .slice(0, 60);
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${safe}_${id}.pdf`;
                a.click();
                URL.revokeObjectURL(a.href);
            },
            error: (e) => {
                this.message = 'Erreur téléchargement PDF';
                console.error(e);
            }
        });
    }


    accept(d: AdminDossierItem) {
        this.loading = true;
        this.api.updateStatus(d.id, 'ACCEPTE').subscribe({
            next: _ => { this.message = 'Dossier accepté.'; this.load(); },
            error: e => { this.message = 'Erreur acceptation'; console.error(e); this.loading = false; }
        });
    }

    reject(d: AdminDossierItem) {
        const msg = prompt('Motif de rejet ?') || '';
        this.loading = true;
        this.api.updateStatus(d.id, 'REJETE', msg).subscribe({
            next: _ => { this.message = 'Dossier rejeté.'; this.load(); },
            error: e => { this.message = 'Erreur rejet'; console.error(e); this.loading = false; }
        });
    }


}
