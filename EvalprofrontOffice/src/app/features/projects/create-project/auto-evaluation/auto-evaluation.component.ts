import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../../core/services/form.service';


@Component({
  selector: 'app-auto-evaluation',
  templateUrl: './auto-evaluation.component.html',
  styleUrls: ['./auto-evaluation.component.scss']
})
export class AutoEvaluationComponent implements OnInit {
  dossierId: string | null = null;
  scores: any = {};

  progress = {
    economique: 0,
    socio: 0,
    environnemental: 0
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formService: FormService
  ) { }

  ngOnInit(): void {

    this.dossierId = this.route.snapshot.paramMap.get('id') || localStorage.getItem('dossierId');
    if (!this.dossierId) {
      this.router.navigate(['/projects/create']);
      return;
    }

    this.loadProgress();
    // this.loadScores();
  }
  loadProgress(): void {
    const dossierId = Number(this.dossierId);
    this.formService.getStep3PillarProgress(dossierId).subscribe({
      next: (data: { [key: string]: number }) => {
        console.log('🟢 Progress reçu :', data); // <= Vérifie les noms ici

        this.progress.economique = data['ECONOMIQUE'] || 0;
        this.progress.socio = data['SOCIO'] || 0;
        this.progress.environnemental = data['ENVIRONNEMENTAL'] || 0;

      },
      error: (err) => console.error('❌ Erreur progression pilier', err)
    });
  }
  loadScores(): void {
    const dossierId = Number(this.dossierId);
    this.formService.getPillarScores(dossierId).subscribe({
      next: (data) => {
        this.scores = data;
        console.log('✅ Scores chargés :', data);
      },
      error: (err) => console.error('❌ Erreur chargement scores', err)
    });
  }
  hasAnyPillarFailed(): boolean {
    return (
      this.scores?.economique?.score < this.scores?.economique?.threshold ||
      this.scores?.socio_territorial?.score < this.scores?.socio_territorial?.threshold ||
      this.scores?.environnemental?.score < this.scores?.environnemental?.threshold
    );
  }
  navigateTo(pilier: 'economique' | 'socio' | 'environnemental'): void {
    if (this.dossierId) {
      this.router.navigate([`/projects/edit/${this.dossierId}/step3/${pilier}`]);
    }
  }
  goBack(): void {
    this.router.navigate(['/projects/create']);
    // avance la progression au moins à 3
      const prev = Number(localStorage.getItem('completedStep') || '0');
      if (prev < 3) localStorage.setItem('completedStep', '3');

      this.router.navigate(['/projects/edit', this.dossierId], {
        state: {
          successMessage: 'Étape 3 terminée avec succès !',
          completedStep: 3
        }
      });

  }



}
