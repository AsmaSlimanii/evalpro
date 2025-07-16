import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormService } from '../../../../../core/services/form.service';

@Component({
  selector: 'app-pilier-socio',
  templateUrl: './pilier-socio.component.html',
  styleUrls: ['./pilier-socio.component.scss']
})
export class PilierSocioComponent implements OnInit {

  formGroup!: FormGroup;
  formMetadata: any;
  formId: number | null = null;

  isLoading = true;
  isSubmitted = false;
  dossierId: string | null = null;
  isEditMode = false;
  currentSection = 1;
  fieldStates: { [key: number]: { touched: boolean } } = {};



  readonly step = 'auto-evaluation';
  readonly pillar = 'SOCIO_TERRITORIAL';
  readonly stepId = 3;

  allQuestions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setupRouteListener();

    const routeParams = this.route.snapshot.params;
    this.dossierId = routeParams['id'] || localStorage.getItem('dossierId');
    this.isEditMode = !!this.dossierId;

    this.initForm();
    this.loadForm();
  }


  private setupRouteListener(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event.urlAfterRedirects.includes('/step3/socio')) {
        this.initForm();
        this.loadForm();
      }
    });
  }

  private initForm(): void {
    this.formGroup = this.fb.group({
      responses: this.fb.array([])
    });
  }

  get responses(): FormArray {
    return this.formGroup.get('responses') as FormArray;
  }

  private loadForm(): void {
    this.isLoading = true;

    const handleForm = (form: any) => {
      this.formMetadata = form;
      this.formId = form.id;
      this.formMetadata.responses = form.responses || [];


      // 🎯 Ajouter les sections spécifiques à ce pilier
    
      form.questions.forEach((q: any) => {
      
       if ([22, 23, 24, 25, 26, 27].includes(q.id)) {
          q.section = 'Socio 1';
          q.pillar = 'SOCIO_TERRITORIAL';
        } else if ([28, 29, 30, 31, 32].includes(q.id)) {
          q.section = 'Socio 2';
          q.pillar = 'SOCIO_TERRITORIAL';
        } else if ([33, 34].includes(q.id)) {
          q.section = 'Socio 3';
          q.pillar = 'SOCIO_TERRITORIAL';
        } else if ([35, 36, 37, 38].includes(q.id)) {
          q.section = 'Socio Compléments';
          q.pillar = 'SOCIO_TERRITORIAL';
        }
      });

      this.allQuestions = form.questions;
      this.buildFormControlsWithData(form.responses || []);
      this.goToSection(1);
      this.isLoading = false;
    };


    if (this.isEditMode && this.dossierId) {
      this.formService.getFormWithResponses(this.step, this.dossierId).subscribe({
        next: handleForm,
        error: () => this.isLoading = false
      });
    } else {
      this.formService.getFormByStep(this.step).subscribe({
        next: handleForm,
        error: () => this.isLoading = false
      });
    }
  }

  private buildFormControlsWithData(existingResponses: any[]): void {
    while (this.responses.length) this.responses.removeAt(0);

    this.allQuestions.forEach((question, index) => {
      this.fieldStates[index] = { touched: false };

      const questionResponses = existingResponses.filter(r => r.questionId === question.id);

      // ➤ on extrait tous les optionIds valides
      const selectedOptionIds = questionResponses
        .map(r => r.optionId)
        .filter(id => id !== null && id !== undefined);

      // ➤ on récupère une seule valeur (pour texte/numérique)
      const selectedValue = questionResponses.find(r => r.value !== null && r.value !== undefined)?.value || '';

      const group = this.fb.group({
        questionId: [question.id],
        value: [selectedValue, ['TEXTE', 'NUMERIQUE'].includes(question.type) && question.isRequired ? Validators.required : null],
        optionIds: this.fb.array(selectedOptionIds.map(id => this.fb.control(id)))
      });

      this.responses.push(group);
    });
  }



  goToSection(section: number): void {
    const sectionLabels = ['Socio 1', 'Socio 2', 'Socio 3', 'Socio Compléments'];
    if (section < 1 || section > sectionLabels.length) return;
    this.currentSection = section;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPrevious(): void {
    if (this.currentSection > 1) {
      this.goToSection(this.currentSection - 1);
    } else {
      this.router.navigate([`/projects/edit/${this.dossierId}/step3`]);
    }
  }

  showError(index: number): boolean {
    const ctrl = this.responses.at(index).get('value');
    return !!(ctrl?.invalid && (this.fieldStates[index].touched || this.isSubmitted));
  }

  onFieldBlur(index: number): void {
    this.fieldStates[index].touched = true;

  }
  isOptionChecked(questionIndex: number, optionId: number): boolean {
    const optionIdsControl = this.responses.at(questionIndex).get('optionIds') as FormArray;
    return optionIdsControl?.value.includes(optionId);
  }
  isRadioSelected(i: number, optionId: number): boolean {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;
    return optionIds.value?.[0] === optionId;
  }

  onCheckboxToggle(i: number, optionId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;

    if (checkbox.checked) {
      if (!optionIds.value.includes(optionId)) {
        optionIds.push(this.fb.control(optionId));
      }
    } else {
      const index = optionIds.controls.findIndex(x => x.value === optionId);
      if (index >= 0) optionIds.removeAt(index);
    }

    // On ignore value pour CHOIXMULTIPLE → vider pour éviter conflit
    this.responses.at(i).get('value')?.setValue('');
  }


  isQuestionInCurrentSection(q: any): boolean {
    const currentLabel = this.currentSectionLabel().toLowerCase().replace(/\s+/g, '');
    const sectionLabel = (q.section || '').toLowerCase().replace(/\s+/g, '');
    return sectionLabel === currentLabel;
  }

  currentSectionLabel(): string {
    const labels = ['Socio 1', 'Socio 2', 'Socio 3', 'Socio Compléments'];
    return labels[this.currentSection - 1] || '';
  }

  submit(): void {
    this.isSubmitted = true;

    // Marquer tous les champs comme touchés
    Object.keys(this.fieldStates).forEach(key => {
      this.fieldStates[+key].touched = true;
    });

    if (this.formGroup.invalid || !this.formMetadata) {
      this.scrollToFirstInvalidField();
      return;
    }

    const stepId = 3;

    const cleanedResponses = this.responses.controls
      .map((ctrl: any, index: number) => {
        const rawValue = ctrl.value.value;
        const trimmedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

        const question = this.allQuestions[index]; // 🔁 Bien utiliser la bonne source

        return {
          questionId: ctrl.value.questionId,
          value: trimmedValue || null,
          optionIds: (ctrl.get('optionIds') as FormArray).value?.filter((id: any) => id != null) || [],
          pillar: question.pillar
        };
      })
      .filter(r =>
        r.pillar === this.pillar &&
        ((r.value !== null && r.value !== '') || (Array.isArray(r.optionIds) && r.optionIds.length > 0))
      );

    console.log('🚀 Payload envoyé:', cleanedResponses);

    const payload = {
      formId: this.formMetadata.id,
      stepId: this.stepId,
      pillar: this.pillar,
      responses: cleanedResponses,
      dossierId: this.dossierId
    };


    const dossierIdToSend: number | null = this.dossierId ? Number(this.dossierId) : null;

    const onSuccess = (res: any): void => {
      const dossierId = res.dossierId || dossierIdToSend;

      if (dossierId) {
        localStorage.setItem('dossierId', String(dossierId));

        this.router.navigate([`/projects/edit/${dossierId}/step3`], {
          state: { fromSocioEvaluation: true }
        });
      }
    };

    if (this.isEditMode && dossierIdToSend) {
      this.formService.submitStep(payload, stepId, dossierIdToSend).subscribe({
        next: onSuccess,
        error: (err: any) => {
          console.error('Erreur envoi (edit)', err);
        }
      });
    } else {
      this.formService.submitStep(payload, stepId, null).subscribe({
        next: onSuccess,
        error: (err: any) => {
          console.error('Erreur envoi (création)', err);
        }
      });
    }
  }



  onRadioChange(index: number, selectedId: number): void {
    const array = this.responses.at(index).get('optionIds') as FormArray;

    // Vider l'ancien choix
    while (array.length) {
      array.removeAt(0);
    }

    // Ajouter l’ID de l’option sélectionnée
    array.push(this.fb.control(selectedId));

    // NE PAS modifier value (backend lit depuis optionIds uniquement pour RADIO)
    // Si tu veux être sûr que value n'est pas utilisée pour RADIO :
    this.responses.at(index).get('value')?.setValue('');
  }


  isRadioChecked(index: number, optionId: number): boolean {
    const selectedValue = this.responses.at(index).get('value')?.value;
    return selectedValue === optionId;
  }



  private scrollToFirstInvalidField(): void {
    setTimeout(() => {
      const el = document.querySelector('.ng-invalid');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}
