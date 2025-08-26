import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DossierService } from '../../../core/services/dossier.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent implements OnInit {
  currentStep = 1;
  totalSteps = 5;

  // ✅ nb d’étapes réellement terminées (persisté)
  completedStep = Number(localStorage.getItem('completedStep') || '0');

  canSubmit = false;
  isSaving = false;
  isSubmitting = false;
  message: string | null = null;

  readonly stepRoutes = ['step1', 'step2', 'step3', 'step4', 'step5'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dossierService: DossierService
  ) {
    this.router.events.pipe(

      filter(event => event instanceof NavigationStart || event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationEnd) {
        // ✅ récupère message + progression envoyés par les étapes
        this.syncFromHistoryState();
        this.updateCurrentStep();
      }
    });
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;

    // 🔄 Démarrer un NOUVEAU projet : /projects/create?new=1
    const wantsNew = this.route.snapshot.queryParamMap.get('new') === '1';
    if (wantsNew) {
      localStorage.removeItem('dossierId');
      localStorage.removeItem('completedStep');
      this.completedStep = 0;
    }

    // ✅ message + progression passés par les étapes
    this.syncFromHistoryState();

    const stepMatch = currentUrl.match(/step(\d+)/);
    this.currentStep = stepMatch ? +stepMatch[1] : 1;

    this.setupRouteListener?.();
    this.updateCurrentStep?.();
  }

  // ✅ lit history.state: { successMessage, completedStep }
private syncFromHistoryState(): void {
  const { successMessage, completedStep, fromPreIdentification } = window.history.state || {};

  // Message à afficher
  if (successMessage) {
    this.message = successMessage;
  } else if (fromPreIdentification) {
    // fallback pour l'ancien flux
    this.message = 'Étape 1 terminée avec succès !';
  }

  // Progression (barre)
  let next = this.completedStep;
  if (Number.isFinite(completedStep)) {
    next = Math.max(next, Number(completedStep));
  } else if (fromPreIdentification) {
    next = Math.max(next, 1);
  }

  if (next !== this.completedStep) {
    this.completedStep = next;
    localStorage.setItem('completedStep', String(this.completedStep));
  }

  this.canSubmit = this.completedStep >= this.totalSteps;
}


  dismissMessage(): void { this.message = null; }

  private setupRouteListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateCurrentStep());
  }

  private updateCurrentStep(): void {
    const url = this.router.url;
    const match = url.match(/step(\d+)/);
    this.currentStep = match ? +match[1] : 1;
    this.canSubmit = this.completedStep >= this.totalSteps;
  }

  // ✅ Barre basée sur les étapes TERMINÉES
  get progressWidth(): string {
    const pct = Math.min(100, (this.completedStep / this.totalSteps) * 100);
    return `${pct}%`;
  }

  // (optionnel) contrôler l’ouverture des étapes:
  // autoriser toutes les étapes ≤ completedStep (édition) + la prochaine (completedStep+1)
  private isStepEnabled(step: number): boolean {
    if (this.completedStep === 0) return step === 1;
    return step <= this.completedStep + 1;
  }

  goToStep(step: number): void {
    // si tu veux verrouiller les étapes non atteintes, décommente :
    // if (!this.isStepEnabled(step)) return;

    const dossierId = localStorage.getItem('dossierId');
    const isEditMode = dossierId !== null;

    if (isEditMode) {
      this.router.navigate([`/projects/edit/${dossierId}/step${step}`]);
    } else {
      this.router.navigate([`/projects/create/step${step}`]);
    }
  }

  saveDraft(): void {
    this.isSaving = true;
    this.dossierService.saveDraft().subscribe({
      next: () => { this.isSaving = false; },
      error: (err) => { console.error('Erreur de sauvegarde', err); this.isSaving = false; }
    });
  }

  submitDossier(): void {
    if (!this.canSubmit) return;
    this.isSubmitting = true;
    this.dossierService.submit().subscribe({
      next: () => { this.isSubmitting = false; this.router.navigate(['/confirmation']); },
      error: (err) => { console.error('Erreur de soumission', err); this.isSubmitting = false; }
    });
  }
  
}
