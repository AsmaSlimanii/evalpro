import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../../../core/services/form.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { HistoryService, StepHistory } from '../../../../../core/services/HistoryService';

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
  isAdmin = false;
  history: StepHistory[] = [];
  historyLoaded = false;
  confirmOpen = false;
  toDelete?: StepHistory;

  trackByHistory = (_: number, h: StepHistory) => h.id ?? _;

  readonly step = 'requete-financement';
  readonly stepId = 4;
  readonly pillar = 'ENTREPRISE'; // <- fixe

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private historyService: HistoryService
  ) 
    { }

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.params['id'] || localStorage.getItem('dossierId');
    this.isEditMode = !!this.dossierId;

    this.isAdmin = this.authService.isAdmin(); // 👈 Détermine si l'utilisateur est admin
    this.initForm();
    this.loadForm();
    this.loadHistoryForThisStep();
  }
  private setReadOnlyMode(): void {
    const responses = this.formGroup.get('responses') as FormArray;

    responses.controls.forEach(g => {
      // value = TEXTE / NUMERIQUE / SELECT / DATE / UPLOAD
      g.get('value')?.disable({ emitEvent: false });

      const opts = g.get('optionIds');
      if (opts instanceof FormArray) {
        opts.disable({ emitEvent: false });
        opts.controls.forEach(c => c.disable({ emitEvent: false }));
      }
    });

    // laisser le commentaire admin actif si tu en as un
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

  trackByQuestionId(index: number, question: any): number {
    return question.id;
  }

  loadForm(): void {
    this.loadHistoryForThisStep();
    const callback = (form: any) => {
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

      this.applyVisibilityState(); // ⬅ IMPORTANT (initial)

      // Recalcule visibilité quand les options changent
      this.responses.controls.forEach(ctrl => {
        const fa = ctrl.get('optionIds');
        if (fa instanceof FormArray) {
          fa.valueChanges.subscribe(() => this.applyVisibilityState()); // ⬅ IMPORTANT
        }
      });
    };

    (this.isEditMode && this.dossierId
      ? this.formService.getFormWithResponses(this.step, this.dossierId)
      : this.formService.getFormByStep(this.step)
    ).subscribe({ next: callback, error: _ => this.isLoading = false });
  }


  // 1) Calcule la visibilité réelle d’une question (SECTION_TITLE = toujours visible)
  private isQuestionVisible(q: any): boolean {
    if (q.type === 'SECTION_TITLE') return true;
    if (!q.parentQuestionId || !q.parentOptionId) return true;

    const parent = this.responses.controls.find(ctrl =>
      ctrl.get('questionId')?.value === q.parentQuestionId
    );
    if (!parent) return true; // si pas trouvé, on ne bloque pas

    const selected = (parent.get('optionIds')?.value || []) as any[];
    return selected.includes(q.parentOptionId);
  }

  // 2) Applique la visibilité aux contrôles (désactive/active + (dé)valide)
  private applyVisibilityState(): void {
    this.allQuestions.forEach((q, i) => {
      const group = this.responses.at(i) as FormGroup;
      const visible = this.isQuestionVisible(q) && !q.isHidden;

      if (visible) {
        group.enable({ emitEvent: false });

        const valueCtrl = group.get('value');
        if (valueCtrl) {
          const mustBeRequired =
            (q.type === 'TEXTE' || q.type === 'NUMERIQUE' || q.type === 'SELECT' || q.type === 'DATE') && !!q.required;
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
    if (this.isAdmin) {
      this.responses.disable({ emitEvent: false });
      return;
    }
  }






  buildFormControlsWithData(existingResponses: any[]): void {
    while (this.responses.length) this.responses.removeAt(0);

    this.allQuestions.forEach((q, index) => {
      const matches = existingResponses.filter((r: any) => r.questionId === q.id);

      const valueFromDb = matches.find((r: any) => r.value !== undefined && r.value !== null)?.value;

      // ✅ valeur initiale selon le type (comme à l’étape 3)
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

    const parentResponse = this.responses.controls.find(ctrl =>
      ctrl.get('questionId')?.value === q.parentQuestionId
    );

    if (!parentResponse) return false;

    const selectedOptions = parentResponse.get('optionIds')?.value || [];
    return selectedOptions.includes(q.parentOptionId);
  }

  submit(): void {
    this.isSubmitted = true;

    if (this.formGroup.invalid || !this.formMetadata) {
      // aide debug : montre quelles questions bloquent
      const invalids = this.responses.controls
        .map((g, i) => ({ i, g, q: this.allQuestions[i] }))
        .filter(x => x.g.enabled && x.g.invalid);
      console.warn('Form invalide, questions en faute :',
        invalids.map(x => ({ id: x.q.id, text: x.q.text, type: x.q.type })));

      // (optionnel) marque tout comme touché pour afficher les erreurs
      this.responses.markAllAsTouched();
      return;
    }

    const ids = new Set(this.allQuestions.map(q => q.id));
    const raw: Array<{ questionId: number, value: any, optionIds: any[] }> = this.responses.getRawValue();
    this.loadHistoryForThisStep();
    const onlyEntrepriseResponses = raw
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
      responses: this.isAdmin ? [] : onlyEntrepriseResponses
    };
    if (this.isAdmin) {
      payload.comment = this.formGroup.get('comment')?.value || '';
    }

    console.log('🚀 Payload Entreprise', payload);

    this.formService.submitStep(payload, this.stepId, Number(this.dossierId))
      .subscribe({
        next: () => this.router.navigate([`/projects/edit/${this.dossierId}/step4`]),
        error: err => console.error('submit error', err)
      });
  }


  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('questionId', String(this.responses.at(index).get('questionId')?.value));
    if (this.dossierId) formData.append('dossierId', String(this.dossierId));

    this.formService.uploadFile(formData).subscribe({
      next: (res: any) => {
        const url = res?.url || res?.path || res?.location;
        if (!url) { console.error('Upload OK mais pas d’URL', res); return; }
        (this.responses.at(index) as FormGroup).get('value')?.setValue(url);
      },
      error: err => console.error('Erreur upload', err)
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
    this.applyVisibilityState(); // ⬅ IMPORTANT
  }

  onRadioChange(i: number, selectedId: number): void {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;
    while (optionIds.length !== 0) optionIds.removeAt(0);
    optionIds.push(this.fb.control(selectedId));
    this.applyVisibilityState(); // ⬅ IMPORTANT
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




  private loadHistoryForThisStep(): void {
    this.historyLoaded = false;

    if (!this.dossierId) {
      this.history = [];
      this.historyLoaded = true;
      return;
    }
    const stepId = 4;
    console.log('[HIST] load for dossier', this.dossierId, 'step', stepId);

    this.historyService
      .byDossierAndStep(Number(this.dossierId), stepId)
      .subscribe({
        next: (items) => {
          console.log('[HIST] items', items);
          this.history = items ?? [];
          this.historyLoaded = true;
        },
        error: (err) => {
          console.error('[HIST] error', err); // regarde l’onglet Network si 401/403/404
          this.history = [];
          this.historyLoaded = true;
        }
      });
  }


  prettifyAction(a: string): string {
    if (!a) return '';
    const clean = a.toString().replace(/_/g, ' ').toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  openDeleteConfirm(h: StepHistory) { this.toDelete = h; this.confirmOpen = true; }
  cancelDelete() { this.confirmOpen = false; this.toDelete = undefined; }
  doDelete() {
    if (!this.toDelete?.id) return;
    this.historyService.delete(this.toDelete.id).subscribe({
      next: () => { this.history = this.history.filter(x => x.id !== this.toDelete!.id); this.cancelDelete(); },
      error: () => alert("Échec de suppression de l'historique.")
    });
  }
}
