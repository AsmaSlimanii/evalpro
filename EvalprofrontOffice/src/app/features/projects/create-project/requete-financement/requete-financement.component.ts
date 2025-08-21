// requete-financement.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../../core/services/form.service';

@Component({
  selector: 'app-requete-financement',
  templateUrl: './requete-financement.component.html',
  styleUrls: ['./requete-financement.component.scss']
})
export class RequeteFinancementComponent implements OnInit {
  dossierId: string | null = null;

  progress = {
    profil: 0,
    entreprise: 0,
    projet: 0
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formService: FormService
  ) {}

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.paramMap.get('id') || localStorage.getItem('dossierId');
    if (!this.dossierId) {
      this.router.navigate(['/projects/create']);
      return;
    }

    this.loadProgress();  // ✅ comme étape 4
  }

    loadProgress(): void {
    const dossierId = Number(this.dossierId);
    this.formService.getStep4PillarProgress(dossierId).subscribe({
      next: (data: { [key: string]: number }) => {
        console.log('🟢 Progress reçu :', data); // <= Vérifie les noms ici

        this.progress.profil = data['PROFIL'] || 0;
        this.progress.entreprise = data['ENTREPRISE'] || 0;
        this.progress.projet = data['PROJET'] || 0;

      },
      error: (err) => console.error('❌ Erreur progression pilier', err)
    });
  }
  

    navigateTo(pilier: 'profil' | 'entreprise' | 'projet'): void {
    if (this.dossierId) {
      this.router.navigate([`/projects/edit/${this.dossierId}/step4/${pilier}`]);
    }
  }

goBack(): void {
    this.router.navigate(['/projects/create']);
    // avance la progression au moins à 4
      const prev = Number(localStorage.getItem('completedStep') || '0');
      if (prev < 4) localStorage.setItem('completedStep', '4');

      this.router.navigate(['/projects/edit', this.dossierId], {
        state: {
          successMessage: 'Étape 4 terminée avec succès !',
          completedStep: 4
        }
      });

  }

}
