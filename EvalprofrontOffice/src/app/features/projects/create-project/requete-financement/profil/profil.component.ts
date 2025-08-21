import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../../../core/services/form.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {
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


  readonly step = 'requete-financement';
  readonly stepId = 4;
  readonly pillar = 'PROFIL';

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


  trackByQuestionId(index: number, question: any): number {
    return question.id;
  }

  get responses(): FormArray {
    return this.formGroup.get('responses') as FormArray;
  }
  private applyVisibilityState(): void {
    this.allQuestions.forEach((q, i) => {
      const group = this.responses.at(i) as FormGroup;
      const visible = this.shouldDisplayQuestion(q);

      if (visible) {
        // Réactive la question
        group.enable({ emitEvent: false });

        // Remet les bons validateurs uniquement pour TEXTE/NUMERIQUE
        const valueCtrl = group.get('value');
        if (valueCtrl) {
          if ((q.type === 'TEXTE' || q.type === 'NUMERIQUE') && q.required) {
            valueCtrl.setValidators([Validators.required]);
          } else {
            valueCtrl.clearValidators();
          }
          valueCtrl.updateValueAndValidity({ emitEvent: false });
        }
      } else {
        // Réinitialise et désactive (elle ne comptera plus dans la validité)
        const opts = group.get('optionIds') as FormArray;
        while (opts && opts.length) opts.removeAt(0);

        group.get('value')?.setValue('');
        group.disable({ emitEvent: false });
      }
    });
     if (this.isAdmin) {
      this.responses.disable({ emitEvent: false });
      return;
    }
  }


  private loadForm(): void {
    const callback = (form: any) => {
      this.formMetadata = form;
      this.formId = form.id;

      // ✅ normaliser la casse/espaces pour être robuste ('profil', ' PROFIL ', etc.)
      const norm = (v: any) => (v ?? '').toString().trim().toUpperCase();

      // ✅ ne garder que les questions du pilier PROFIL
      const all: any[] = Array.isArray(form?.questions) ? form.questions : [];
      this.allQuestions = all.filter(q => norm(q.pillar) === this.pillar);

      // (optionnel) log si rien n'est trouvé
      if (this.allQuestions.length === 0) {
        console.warn('[Profil] Aucune question pour le pilier', this.pillar,
          'Exemples de pillars:', all.slice(0, 5).map(q => q.pillar));
      }

      // ✅ ne garder que les réponses liées aux questions filtrées
      const ids = new Set(this.allQuestions.map(q => q.id));
      const existing = (form.responses || []).filter((r: any) => ids.has(r.questionId));

      this.buildFormControlsWithData(existing);
      this.isLoading = false;
      this.formGroup.patchValue({ comment: form.comment || '' });
      // ✅ seulement maintenant : désactiver si admin
      if (this.isAdmin) {
        this.setReadOnlyMode();
      }

      // ⬇⬇⬇ AJOUT
      this.applyVisibilityState();

      // Abonnements
      this.responses.controls.forEach(ctrl => {
        const fa = ctrl.get('optionIds');
        if (fa instanceof FormArray) {
          fa.valueChanges.subscribe(() => this.applyVisibilityState());
        }
      });


      // abonnements
      this.responses.controls.forEach(ctrl => {
        const fa = ctrl.get('optionIds');
        if (fa instanceof FormArray) fa.valueChanges.subscribe(() => this.cdRef.detectChanges());
      });
    };

    (this.isEditMode && this.dossierId
      ? this.formService.getFormWithResponses(this.step, this.dossierId)
      : this.formService.getFormByStep(this.step)
    ).subscribe({ next: callback, error: _ => this.isLoading = false });
  }




  private buildFormControlsWithData(existingResponses: any[]): void {
    while (this.responses.length) this.responses.removeAt(0);

    this.allQuestions.forEach((q, index) => {
      const matches = existingResponses.filter(r => r.questionId === q.id);
      const value = matches.find(r => r.value !== undefined && r.value !== null)?.value ?? '';
      const optionIds = matches
        .map(r => r.optionId)
        .filter((id: any) => id !== null && id !== undefined);

      this.uploadedFiles[index] = null!;

      this.responses.push(this.fb.group({
        questionId: [q.id],
        value: [
          value,
          (q.type === 'TEXTE' || q.type === 'NUMERIQUE') && q.required ? Validators.required : null
        ],
        optionIds: this.fb.array(optionIds.map((id: any) => this.fb.control(id)))
      }));
    });
  }

  shouldDisplayQuestion(q: any): boolean {
    if (q.type === 'SECTION_TITLE') return true;

    // ✅ Modification ici : parentQuestionId et parentOptionId
    if (!q.parentQuestionId || !q.parentOptionId) return true;

    const parentResponse = this.responses.controls.find(ctrl =>
      ctrl.get('questionId')?.value === q.parentQuestionId
    );

    if (!parentResponse) return false;

    const selectedOptions = parentResponse.get('optionIds')?.value || [];

    // ✅ Modification ici : parentOptionId
    return selectedOptions.includes(q.parentOptionId);
  }

  submit(): void {
    this.isSubmitted = true;
    if (!this.formMetadata) return;

    if (this.formGroup.invalid) {
      const invalid = this.responses.controls
        .map((g, i) => ({ i, g, q: this.allQuestions[i] }))
        .filter(x => x.g.enabled && x.g.invalid);
      console.warn('Form invalide :', invalid.map(x => ({ id: x.q.id, text: x.q.text, type: x.q.type })));
      return;
    }

    // ⬅⬅⬅ prend toutes les valeurs (même si un champ a été désactivé puis réactivé)
    const raw: Array<{ questionId: number, value: any, optionIds: any[] }> = this.responses.getRawValue();

    const ids = new Set(this.allQuestions.map(q => q.id));
    const onlyProfilResponses = raw
      .filter(r => ids.has(r.questionId))
      .map(r => ({
        questionId: r.questionId,
        value: (typeof r.value === 'string' && r.value.trim() === '') ? null : r.value,
        optionIds: Array.isArray(r.optionIds) ? r.optionIds.filter(v => v != null) : []
      }))
      // ⬇ garde aussi les UPLOAD même si value = URL (pas vide)
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
      responses: this.isAdmin ? [] : onlyProfilResponses
    };
    if (this.isAdmin) {
      payload.comment = this.formGroup.get('comment')?.value || '';
    }

    console.log('🚀 Payload envoyé', payload); // tu dois y voir la question UPLOAD avec value = URL

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

    // Facultatif mais utile côté serveur pour ranger le fichier
    const qid = String(this.responses.at(index).get('questionId')?.value);
    const did = this.dossierId ? String(this.dossierId) : '';

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('questionId', qid);
    if (did) formData.append('dossierId', did);

    this.formService.uploadFile(formData).subscribe({
      next: (res: any) => {
        // Accepte 'url' (préféré), ou 'path' / 'location'
        const url = res?.url || res?.path || res?.location;
        if (!url) {
          console.error('Upload OK mais pas d’URL dans la réponse', res);
          return;
        }

        // ✅ on stocke l’URL dans le contrôle "value" de la question UPLOAD
        const group = this.responses.at(index) as FormGroup;
        group.get('value')?.setValue(url);
        group.markAsDirty();
        group.updateValueAndValidity({ emitEvent: false });

        console.log('📸 URL fichier enregistrée dans le formulaire :', url);
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
    this.cdRef.detectChanges(); // Pour forcer le recalcul d’affichage des questions dépendantes

    this.applyVisibilityState(); // ⬅⬅⬅

  }

  onRadioChange(i: number, selectedId: number): void {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;

    // Vider et mettre à jour
    while (optionIds.length !== 0) optionIds.removeAt(0);
    optionIds.push(this.fb.control(selectedId));

    const questionParentId = 55;
    const expectedOptionId = 248;

    // Liste des IDs des questions à afficher/cacher
    const childQuestionIds = [56, 57, 58, 59];

    // Si on modifie la question parent
    if (this.allQuestions[i].id === questionParentId) {
      for (const childId of childQuestionIds) {
        const index = this.allQuestions.findIndex(q => q.id === childId);
        if (index !== -1) {
          this.allQuestions[index].isHidden = selectedId === expectedOptionId ? false : true;
        }
      }
    }
    this.applyVisibilityState(); // ⬅⬅⬅
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
    // optionnel
  }






}
