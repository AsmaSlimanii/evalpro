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
  canSubmit = false;
  isSaving = false;
  isSubmitting = false;
  message: string | null = null;
  step1Completed = false;

  readonly stepRoutes = ['step1', 'step2', 'step3', 'step4', 'step5'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dossierService: DossierService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart || event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('Navigation starting to:', event.url);
      }
      if (event instanceof NavigationEnd) {
        console.log('Navigation completed to:', event.url);
      }
    });
  }

ngOnInit(): void {
  const currentUrl = this.router.url;

  if (currentUrl === '/projects/create') {
    // ❌ ne pas supprimer si on vient de step1
    if (!window.history.state?.fromPreIdentification) {
      localStorage.removeItem('dossierId');
    }
  }

  if (window.history.state?.fromPreIdentification) {
    this.message = 'Étape 1 terminée avec succès !';
  }

  const stepMatch = currentUrl.match(/step(\d+)/);
  this.currentStep = stepMatch ? +stepMatch[1] : 1;

  this.setupRouteListener?.();
  this.updateCurrentStep?.();
}


  dismissMessage(): void {
    this.message = null;
  }

  private setupRouteListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCurrentStep();
      });
  }

  private updateCurrentStep(): void {
    const url = this.router.url;
    const match = url.match(/step(\d+)/);
    this.currentStep = match ? +match[1] : 1;
        this.canSubmit = this.currentStep === this.totalSteps;
  }

  get progressWidth(): string {
    return `${(this.currentStep / this.totalSteps) * 100}%`; 
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




saveDraft(): void {
    this.isSaving = true;
    this.dossierService.saveDraft().subscribe({
      next: () => {
        console.log('✅ Brouillon sauvegardé');
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Erreur de sauvegarde', err);
        this.isSaving = false;
      }
    });
  }

  submitDossier(): void {
    if (!this.canSubmit) return;

    this.isSubmitting = true;
    this.dossierService.submit().subscribe({
      next: () => {
        console.log('✅ Dossier soumis');
        this.isSubmitting = false;
        this.router.navigate(['/confirmation']);
      },
      error: (err) => {
        console.error('Erreur de soumission', err);
        this.isSubmitting = false;
      }
    });
  }
}