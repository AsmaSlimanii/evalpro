import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../../../core/services/form.service';

@Component({
  selector: 'app-entreprise',
  templateUrl: './entreprise.component.html',
  styleUrls: ['./entreprise.component.scss']
})
export class EntrepriseComponent implements OnInit {
  formGroup!: FormGroup;
  formMetadata: any;
  formId!: number;
  dossierId: string | null = null;
  isEditMode = false;
  isLoading = true;
  isSubmitted = false;
  uploadedFiles: File[] = [];
  allQuestions: any[] = [];

  readonly step = 'requete-financement';
  readonly stepId = 4;
  readonly pillar = 'entreprise'; // ✅ spécifique à ce formulaire

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.params['id'] || localStorage.getItem('dossierId');
    this.isEditMode = !!this.dossierId;
    this.initForm();
    this.loadForm();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      responses: this.fb.array([])
    });
  }

  get responses(): FormArray {
    return this.formGroup.get('responses') as FormArray;
  }

  trackByQuestionId(index: number, question: any): number {
    return question.id;
  }

  loadForm(): void {
    const callback = (form: any) => {
      this.formMetadata = form;
      this.formId = form.id;

      // 🔥 Ne garder que les questions de ce pillar
      this.allQuestions = form.questions.filter((q: any) => q.pillar === this.pillar);

      this.buildFormControlsWithData(form.responses || []);
      this.isLoading = false;

      // Abonnement pour affichage conditionnel
      this.responses.controls.forEach((ctrl, i) => {
        const optionIdsControl = ctrl.get('optionIds');
        if (optionIdsControl instanceof FormArray) {
          optionIdsControl.valueChanges.subscribe(() => this.cdRef.detectChanges());
        }
      });
    };

    if (this.isEditMode && this.dossierId) {
      this.formService.getFormWithResponses(this.step, this.dossierId).subscribe({ next: callback });
    } else {
      this.formService.getFormByStep(this.step).subscribe({ next: callback });
    }
  }

  buildFormControlsWithData(existingResponses: any[]): void {
    while (this.responses.length) this.responses.removeAt(0);

    this.allQuestions.forEach((q, index) => {
      const matching = existingResponses.filter(r => r.questionId === q.id);
      const value = matching.find(r => r.value !== undefined)?.value || '';
      const optionIds = matching.map(r => r.optionId).filter(Boolean);

      this.uploadedFiles[index] = null!;

      const group = this.fb.group({
        questionId: [q.id],
        value: [value, ['TEXTE', 'NUMERIQUE'].includes(q.type) && q.required ? Validators.required : null],
        optionIds: this.fb.array(optionIds.map(id => this.fb.control(id)))
      });

      this.responses.push(group);
    });
  }

  shouldDisplayQuestion(q: any): boolean {
    if (q.type === 'SECTION_TITLE') return true;
    if (!q.parentQuestionId || !q.parentOptionId) return true;

    const parentResponse = this.responses.controls.find(ctrl =>
      ctrl.get('questionId')?.value === q.parentQuestionId
    );

    if (!parentResponse) return false;

    const selectedOptions = parentResponse.get('optionIds')?.value || [];
    return selectedOptions.includes(q.parentOptionId);
  }

  submit(): void {
    this.isSubmitted = true;

    if (this.formGroup.invalid || !this.formMetadata) return;

    const payload = {
      formId: this.formId,
      stepId: this.stepId,
      pillar: this.pillar,
      dossierId: this.dossierId,
      responses: this.responses.value
    };

    this.formService.submitStep(payload, this.stepId, Number(this.dossierId)).subscribe(() => {
      this.router.navigate([`/projects/edit/${this.dossierId}/step4`]);
    });
  }

  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.uploadedFiles[index] = file;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('questionId', this.responses.at(index).value.questionId);

    this.formService.uploadFile(formData).subscribe({
      next: (res) => {
        this.responses.at(index).get('value')?.setValue(res.url);
      },
      error: (err) => {
        console.error('Erreur upload', err);
      }
    });
  }

  onCheckboxToggle(index: number, optionId: number, event: Event): void {
    const options = this.responses.at(index).get('optionIds') as FormArray;
    const checked = (event.target as HTMLInputElement).checked;

    if (checked && !options.value.includes(optionId)) {
      options.push(this.fb.control(optionId));
    } else if (!checked) {
      const i = options.controls.findIndex(c => c.value === optionId);
      if (i !== -1) options.removeAt(i);
    }

    this.responses.at(index).get('value')?.setValue('');
    this.cdRef.detectChanges();
  }

  onRadioChange(i: number, selectedId: number): void {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;
    while (optionIds.length !== 0) optionIds.removeAt(0);
    optionIds.push(this.fb.control(selectedId));
  }

  isOptionChecked(index: number, optionId: number): boolean {
    const control = this.responses.at(index).get('optionIds') as FormArray;
    return control.value.includes(optionId);
  }

  isRadioSelected(index: number, optionId: number): boolean {
    const control = this.responses.at(index).get('optionIds') as FormArray;
    return control.value?.[0] === optionId;
  }

  showError(index: number): boolean {
    const control = this.responses.at(index).get('value');
    return !!control?.invalid && this.isSubmitted;
  }

  onFieldBlur(index: number): void {
    // facultatif
  }
}
