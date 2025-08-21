import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../../../core/services/form.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.scss']
})
export class ProjetComponent implements OnInit {
  formGroup!: FormGroup;
  formMetadata: any;
  formId!: number;

  dossierId: string | null = null;
  isEditMode = false;
  isLoading = true;
  isSubmitted = false;

  uploadedFiles: File[] = [];
  allQuestions: any[] = [];
  isAdmin = false;


  // ⚙️ Étape & pilier
  readonly step = 'requete-financement';
  readonly stepId = 4;
  readonly pillar = 'PROJET';

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.params['id'] || localStorage.getItem('dossierId');
    this.isEditMode = !!this.dossierId;

    this.isAdmin = this.authService.isAdmin(); // 👈 Détermine si l'utilisateur est admin
    this.initForm();
    this.loadForm();
  }
  setReadOnlyMode() {
    const responsesArray = this.formGroup.get('responses') as FormArray;

    responsesArray.controls.forEach((control) => {
      const valueControl = control.get('value');
      const optionIdsControl = control.get('optionIds');

      if (valueControl) {
        valueControl.disable({ emitEvent: false });
      }

      if (optionIdsControl && optionIdsControl instanceof FormArray) {
        optionIdsControl.controls.forEach(opt => opt.disable({ emitEvent: false }));
      }
    });

    // 🟢 Reactiver le champ commentaire pour l’admin
    this.formGroup.get('comment')?.enable({ emitEvent: false });
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      responses: this.fb.array([]),
       comment: ['']
    });
  }

  get responses(): FormArray {
    return this.formGroup.get('responses') as FormArray;
  }

  trackByQuestionId = (_: number, q: any) => q.id;

  // Chargement + préremplissage
  loadForm(): void {
    const onOk = (form: any) => {
      this.formMetadata = form;
      this.formId = form.id;

      const norm = (v: any) => (v ?? '').toString().trim().toUpperCase();
      const all = Array.isArray(form?.questions) ? form.questions : [];

      this.allQuestions = all.filter((q: any) => norm(q.pillar) === this.pillar);

      const ids = new Set(this.allQuestions.map(q => q.id));
      const existing = (form.responses || []).filter((r: any) => ids.has(r.questionId));

      this.buildFormControlsWithData(existing);
      this.isLoading = false;
       this.formGroup.patchValue({ comment: form.comment || '' });
      // ✅ seulement maintenant : désactiver si admin
      if (this.isAdmin) {
        this.setReadOnlyMode();
      }

      // Visibilité initiale
      this.applyVisibilityState();

      // Recalcule visibilité quand les options changent
      this.responses.controls.forEach(ctrl => {
        const fa = ctrl.get('optionIds');
        if (fa instanceof FormArray) {
          fa.valueChanges.subscribe(() => this.applyVisibilityState());
        }
      });
    };

    (this.isEditMode && this.dossierId
      ? this.formService.getFormWithResponses(this.step, this.dossierId)
      : this.formService.getFormByStep(this.step)
    ).subscribe({ next: onOk, error: _ => this.isLoading = false });
  }

  // Visibilité
  private isQuestionVisible(q: any): boolean {
    if (q.type === 'SECTION_TITLE') return true;
    if (!q.parentQuestionId || !q.parentOptionId) return true;

    const parent = this.responses.controls.find(ctrl =>
      ctrl.get('questionId')?.value === q.parentQuestionId
    );
    if (!parent) return true;

    const selected = (parent.get('optionIds')?.value || []) as any[];
    return selected.includes(q.parentOptionId);
  }

  private applyVisibilityState(): void {
    this.allQuestions.forEach((q, i) => {
      const group = this.responses.at(i) as FormGroup;
      const visible = this.isQuestionVisible(q) && !q.isHidden;

      if (visible) {
        group.enable({ emitEvent: false });

        const valueCtrl = group.get('value');
        if (valueCtrl) {
          const mustBeRequired =
            (q.type === 'TEXTE' || q.type === 'NUMERIQUE' || q.type === 'SELECT' || q.type === 'DATE') &&
            !!q.required;
          valueCtrl.setValidators(mustBeRequired ? [Validators.required] : []);
          valueCtrl.updateValueAndValidity({ emitEvent: false });
        }
      } else {
        const opts = group.get('optionIds') as FormArray;
        while (opts && opts.length) opts.removeAt(0);

        group.get('value')?.setValue((q.type === 'SELECT' || q.type === 'DATE') ? null : '');
        group.disable({ emitEvent: false });
      }
    });
  }

  // Contrôles dynamiques
  buildFormControlsWithData(existing: any[]): void {
    while (this.responses.length) this.responses.removeAt(0);

    this.allQuestions.forEach((q, index) => {
      const matches = existing.filter((r: any) => r.questionId === q.id);
      const valueFromDb = matches.find((r: any) => r.value !== undefined && r.value !== null)?.value;

      const initialValue =
        q.type === 'SELECT' || q.type === 'DATE'
          ? (valueFromDb != null ? String(valueFromDb) : null)
          : (valueFromDb ?? '');

      const mustBeRequired =
        (q.type === 'TEXTE' || q.type === 'NUMERIQUE' || q.type === 'SELECT' || q.type === 'DATE') && !!q.required;

      this.uploadedFiles[index] = null!;

      this.responses.push(this.fb.group({
        questionId: [q.id],
        value: [initialValue, mustBeRequired ? Validators.required : []],
        optionIds: this.fb.array(
          matches
            .map((r: any) => r.optionId)
            .filter((id: any) => id != null)
            .map((id: any) => this.fb.control(id))
        )
      }));
    });
  }

  shouldDisplayQuestion(q: any): boolean {
    if (q.type === 'SECTION_TITLE') return true;
    if (!q.parentQuestionId || !q.parentOptionId) return true;

    const parent = this.responses.controls.find(ctrl =>
      ctrl.get('questionId')?.value === q.parentQuestionId
    );
    if (!parent) return false;

    const selected = parent.get('optionIds')?.value || [];
    return selected.includes(q.parentOptionId);
  }

  // Submit
  submit(): void {
    this.isSubmitted = true;

    if (this.formGroup.invalid || !this.formMetadata) {
      const invalids = this.responses.controls
        .map((g, i) => ({ i, g, q: this.allQuestions[i] }))
        .filter(x => x.g.enabled && x.g.invalid);
      console.warn('Form invalide, questions en faute :',
        invalids.map(x => ({ id: x.q.id, text: x.q.text, type: x.q.type })));
      this.responses.markAllAsTouched();
      return;
    }

    const ids = new Set(this.allQuestions.map(q => q.id));
    const raw: Array<{ questionId: number, value: any, optionIds: any[] }> = this.responses.getRawValue();

    const onlyProjectResponses = raw
      .filter(r => ids.has(r.questionId))
      .map(r => ({
        questionId: r.questionId,
        value: (typeof r.value === 'string' && r.value.trim() === '') ? null : r.value,
        optionIds: Array.isArray(r.optionIds) ? r.optionIds.filter(v => v != null) : []
      }))
      .filter(r => r.value !== null || (r.optionIds && r.optionIds.length));

    const payload: {
      formId: any;
      stepId: number;
      pillar: string;
      dossierId: string | null;
      responses: any;
      comment?: string;
    } = {
      formId: this.formMetadata.id,
      stepId: this.stepId,
      pillar: this.pillar,
      dossierId: this.dossierId,
      responses: this.isAdmin ? [] : onlyProjectResponses
    };
    if (this.isAdmin) {
      payload.comment = this.formGroup.get('comment')?.value || '';
    }

    console.log('🚀 Payload Projet', payload);

    this.formService.submitStep(payload, this.stepId, Number(this.dossierId))
      .subscribe({
        next: () => this.router.navigate([`/projects/edit/${this.dossierId}/step4`]),
        error: err => console.error('submit error', err)
      });
  }

  // Upload
  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.uploadedFiles[index] = file;

    const qid = String(this.responses.at(index).get('questionId')?.value);
    const did = this.dossierId ? String(this.dossierId) : '';

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('questionId', qid);
    if (did) formData.append('dossierId', did);

    this.formService.uploadFile(formData).subscribe({
      next: (res: any) => {
        const url = res?.url || res?.path || res?.location;
        if (!url) { console.error('Upload OK mais pas d’URL', res); return; }
        const group = this.responses.at(index) as FormGroup;
        group.get('value')?.setValue(url);
        group.markAsDirty();
        group.updateValueAndValidity({ emitEvent: false });
        console.log('📎 URL fichier enregistrée :', url);
      },
      error: err => console.error('Erreur upload', err)
    });
  }

  // Options
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
    this.applyVisibilityState();
  }

  onRadioChange(i: number, selectedId: number): void {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;
    while (optionIds.length) optionIds.removeAt(0);
    optionIds.push(this.fb.control(selectedId));
    this.applyVisibilityState();
  }

  isOptionChecked(index: number, optionId: number): boolean {
    const control = this.responses.at(index).get('optionIds') as FormArray;
    return control.value.includes(optionId);
  }

  isRadioSelected(index: number, optionId: number): boolean {
    const control = this.responses.at(index).get('optionIds') as FormArray;
    return control.value?.[0] === optionId;
  }

  // UI helpers
  showError(index: number): boolean {
    const control = this.responses.at(index).get('value');
    return !!control?.invalid && this.isSubmitted;
  }

  onFieldBlur(_index: number): void { }
}
