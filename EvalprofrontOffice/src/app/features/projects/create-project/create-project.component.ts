import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DossierService } from '../../../core/services/dossier.service';
import { AuthService } from '../../../core/services/auth.service';

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
  message = '';
  dossierId!: number;
  isClient = false;

  readonly stepRoutes = ['step1', 'step2', 'step3', 'step4', 'step5'];



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dossierService: DossierService,
    private dossiers: DossierService,
    private auth: AuthService
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
  const url = this.router.url;
  const wantsNew = this.route.snapshot.queryParamMap.get('new') === '1';

  // 🔹 TOUT remettre à zéro quand on arrive sur "Créer un projet"
  if (url.startsWith('/projects/create')) {
    localStorage.removeItem('dossierId');
    localStorage.removeItem('currentDossierId');
    localStorage.removeItem('completedStep');
    this.completedStep = 0;
    this.dossierId = undefined as any;
  }

  // (Tu peux garder le ?new=1 si tu veux un bouton "Nouveau", mais ce n'est plus nécessaire)
  if (wantsNew) {
    localStorage.removeItem('dossierId');
    localStorage.removeItem('currentDossierId');
    localStorage.removeItem('completedStep');
    this.completedStep = 0;
  }

  this.syncFromHistoryState();
  const stepMatch = url.match(/step(\d+)/);
  this.currentStep = stepMatch ? +stepMatch[1] : 1;

  this.setupRouteListener?.();
  this.updateCurrentStep?.();

  // ⛔ IMPORTANT: ne PAS hydrater un ancien dossier sur l'écran "create"
  // this.hydrateDossierId();  // <-- désactive ici
  const roleLS = (localStorage.getItem('role') || '').toUpperCase();
  this.isClient = this.auth.getRoles().includes('CLIENT') || roleLS === 'CLIENT' || roleLS === 'ROLE_CLIENT';
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


  dismissMessage() { this.message = ''; }

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
  const dossierId = localStorage.getItem('dossierId');
  const isEditMode = dossierId !== null;
  if (isEditMode) {
    this.router.navigate([`/projects/edit/${dossierId}/step${step}`]);
  } else {
    this.router.navigate([`/projects/create/step${step}`]);
  }
}


  saveDraft() {
    if (!this.isClient) return;
    this.isSaving = true;
    this.dossiers.saveDraft().subscribe({
      next: () => { this.message = 'Brouillon sauvegardé.'; },
      error: (e) => { this.message = e?.message ?? 'Erreur lors de la sauvegarde.'; },
      complete: () => this.isSaving = false
    });
  }
submitDossier() {
  if (!this.isClient || !this.canSubmit || !this.dossierId) {
    this.message = !this.dossierId ? 'Dossier introuvable. Reprenez l’étape 1.' : this.message;
    return;
  }

  this.isSubmitting = true;
  this.dossierService.submitById(this.dossierId).subscribe({
    next: () => {
      this.isSubmitting = false;
      this.message = '✅ Dossier soumis. En attente de traitement.';
      // 🔥 PURGE complète: on termine ce dossier, on repart de zéro
      localStorage.removeItem('dossierId');
      localStorage.removeItem('completedStep');
      // (optionnel) rediriger vers /projects/create
      this.router.navigateByUrl('/projects/create');
    },
    error: (err) => {
      this.isSubmitting = false;
      this.message = (err?.message || (err as any)?.error?.message || 'Erreur de soumission.');
      console.error(err);
    }
  });
}



  private hydrateDossierId(): void {
    // 1) depuis l’URL /projects/edit/:dossierId/stepX
    const paramId = this.route.snapshot.paramMap.get('dossierId');
    if (paramId) {
      this.dossierId = +paramId;
      localStorage.setItem('currentDossierId', paramId);
      return;
    }

    // 2) depuis le localStorage (créé à l’étape 1)
    const stored = localStorage.getItem('currentDossierId');
    if (stored) {
      this.dossierId = +stored;
      return;
    }

    // 3) dernier recours : récupérer le dernier dossier EN_COURS
    this.dossierService.getAllDossiers().subscribe({
      next: (list: any[]) => {
        const last = list
          .filter(d => d.status === 'EN_COURS')
          .sort((a, b) => b.id - a.id)[0];
        if (last) {
          this.dossierId = last.id;
          localStorage.setItem('currentDossierId', String(last.id));
        }
      }
    });
  }



}
