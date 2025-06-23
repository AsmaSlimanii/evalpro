import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormService } from '../../../../../core/services/form.service';

@Component({
  selector: 'app-pilier-economique',
  templateUrl: './pilier-economique.component.html',
  styleUrls: ['./pilier-economique.component.scss']
})
export class PilierEconomiqueComponent implements OnInit {
  formGroup!: FormGroup;
  formMetadata: any;
  questions: any[] = [];
  isLoading = true;
  isSubmitted = false;
  fieldStates: { [key: number]: { touched: boolean } } = {};
  dossierId: string | null = null;
  isEditMode = false;
  readonly step = 'auto-evaluation';
  readonly pillar = 'ECONOMIQUE';

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setupRouteListener();

    const routeParams = this.route.snapshot.params;
    if (routeParams?.['id']) {
      this.dossierId = routeParams['id'];
      this.isEditMode = true;
    } else {
      this.dossierId = localStorage.getItem('dossierId');
      this.isEditMode = !!this.dossierId;
    }

    this.initForm();
    this.loadForm();
  }

  private setupRouteListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      if (url.includes('/step3/pilier-economique')) {
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

    const onFormLoad = (form: any) => {
      this.formMetadata = form;
      this.questions = form.questions;
      this.buildFormControlsWithData(form.responses || []);
      this.isLoading = false;
    };

    if (this.isEditMode && this.dossierId) {
      this.formService.getFormWithResponses(this.step, this.dossierId, this.pillar).subscribe({
        next: onFormLoad,
        error: () => this.isLoading = false
      });
    } else {
      this.formService.getFormByStep(this.step, this.pillar).subscribe({
        next: onFormLoad,
        error: () => this.isLoading = false
      });
    }
  }

 private buildFormControlsWithData(existingResponses: any[]): void {
  while (this.responses.length) this.responses.removeAt(0);

  this.questions.forEach((question, index) => {
    this.fieldStates[index] = { touched: false };

    const questionResponses = existingResponses.filter(r => r.questionId === question.id);

    const selectedOptionIds = questionResponses
      .filter(r => r.optionId !== undefined && r.optionId !== null)
      .map(r => r.optionId);

    const value = questionResponses.find(r => r.value !== null)?.value || '';

    const group = this.fb.group({
      questionId: [question.id],
      value: [value, question.isRequired ? Validators.required : null],
      optionIds: this.fb.array(
        selectedOptionIds.map(id => this.fb.control(id)) // ✅ important pour CHOIXMULTIPLE
      )
    });

    this.responses.push(group);
  });
}



  onFieldBlur(index: number): void {
    this.fieldStates[index].touched = true;
  }

  showError(index: number): boolean {
    const control = this.responses.at(index).get('value');
    return !!(control?.invalid && (this.fieldStates[index].touched || this.isSubmitted));
  }

  onCheckboxToggle(i: number, optionId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;

    if (checkbox.checked) {
      optionIds.push(this.fb.control(optionId));
    } else {
      const index = optionIds.controls.findIndex(x => x.value === optionId);
      if (index >= 0) optionIds.removeAt(index);
    }
  }

  isOptionChecked(questionIndex: number, optionId: number): boolean {
    const optionIdsControl = this.responses.at(questionIndex).get('optionIds') as FormArray;
    return optionIdsControl?.value.includes(optionId);
  }

  goBack(): void {
    if (this.dossierId) {
      this.router.navigate([`/projects/edit/${this.dossierId}/step3`]);
    }
  }

  submit(): void {
    this.isSubmitted = true;
    Object.keys(this.fieldStates).forEach(key => {
      this.fieldStates[+key].touched = true;
    });

    if (this.formGroup.invalid || !this.formMetadata) {
      this.scrollToFirstInvalidField();
      return;
    }

   const cleanedResponses = this.responses.controls
  .map((ctrl: any) => ({
    questionId: ctrl.value.questionId,
    value: typeof ctrl.value.value === 'string' ? ctrl.value.value.trim() : ctrl.value.value,
    optionIds: ((ctrl.get('optionIds') as FormArray).value || []).filter((id: any) => id != null)
  }))
  .filter(r =>
    (r.value !== null && r.value !== '') ||
    (Array.isArray(r.optionIds) && r.optionIds.length > 0)
  );


    const payload = {
      formId: this.formMetadata.id,
      stepId: 3,
      responses: cleanedResponses
    };

    const dossierIdToSend: number | null = this.dossierId ? Number(this.dossierId) : null;
    const onSuccess = (res: any): void => {
      const dossierId = res.dossierId || dossierIdToSend;
      if (dossierId) {
        localStorage.setItem('dossierId', String(dossierId));
        this.router.navigate([`/projects/edit/${dossierId}/step3`]);
      }
    };

    if (this.isEditMode && dossierIdToSend) {
      this.formService.submitStep(payload, 3, dossierIdToSend).subscribe({ next: onSuccess });
    } else {
      this.formService.submitStep(payload, 3, null).subscribe({ next: onSuccess });
    }
  }

  private scrollToFirstInvalidField(): void {
    setTimeout(() => {
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}
