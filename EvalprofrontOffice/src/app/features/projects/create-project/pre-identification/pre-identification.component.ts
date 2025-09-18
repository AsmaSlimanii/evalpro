import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormService } from '../../../../core/services/form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Payload } from '../../../../shared/models/creation-projet.dto';
import { HistoryService, StepHistory } from '../../../../core/services/HistoryService';

@Component({
  selector: 'app-pre-identification',
  templateUrl: './pre-identification.component.html',
  styleUrls: ['./pre-identification.component.scss']
})
export class PreIdentificationComponent implements OnInit {
  formGroup!: FormGroup;
  formMetadata: any;
  questions: any[] = [];
  isLoading = true;
  isSubmitted = false;
  fieldStates: { [key: number]: { touched: boolean } } = {};
  dossierId: string | null = null;
  isEditMode = false;
  isAdmin = false;

  // --- Mini assistant (drawer) : juste une description et un bouton ---
  ai = {
    open: false,
    description: ''
  };
  history: StepHistory[] = [];
  historyLoaded = false;
  confirmOpen = false;
  toDelete?: StepHistory;

  trackByHistory = (_: number, h: StepHistory) => h.id ?? _;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private historyService: HistoryService
  ) { }

  ngOnInit(): void {
    this.setupRouteListener();

    const parentParams = this.route.parent?.snapshot.params;
    const routeParams = this.route.snapshot.params;

    if (parentParams?.['id']) {
      this.dossierId = parentParams['id'];
      this.isEditMode = true;
    } else if (routeParams?.['id']) {
      this.dossierId = routeParams['id'];
      this.isEditMode = true;
    } else {
      const storedId = localStorage.getItem('dossierId');
      if (storedId) {
        this.dossierId = storedId;
        this.isEditMode = true;
      } else {
        this.dossierId = null;
        this.isEditMode = false;
      }
    }

    this.isAdmin = this.authService.isAdmin();
    this.initForm();
    this.loadForm();
    this.loadHistoryForThisStep();
  }

  private setupRouteListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        if (url.includes('/projects/edit/') && url.includes('/step1')) {
          this.initForm();
          this.loadForm();
        }
      });
  }

  private initForm(): void {
    this.formGroup = this.fb.group({
      responses: this.fb.array([]),
      comment: ['']
    });
  }

  get responses(): FormArray {
    return this.formGroup.get('responses') as FormArray;
  }

  private loadForm(): void {
    const step = 'pre-identification';
    this.isLoading = true;

    const onFormLoad = (form: any) => {
      this.formMetadata = form;
      this.questions = form.questions;
      this.questions.forEach(q => q.isHidden = false);

      this.buildFormControlsWithData(form.responses || []);
      this.isLoading = false;
      this.formGroup.patchValue({ comment: form.comment || '' });

      if (this.isAdmin) this.setReadOnlyMode();
    };

    if (this.isEditMode && this.dossierId) {
      this.formService.getFormWithResponses(step, this.dossierId).subscribe({
        next: onFormLoad,
        error: () => { this.isLoading = false; }
      });
    } else {
      this.formService.getFormByStep(step).subscribe({
        next: onFormLoad,
        error: () => { this.isLoading = false; }
      });
    }
    this.loadHistoryForThisStep(); // <— charge l’historique
  }

  private buildFormControlsWithData(existingResponses: any[]): void {
    while (this.responses.length) this.responses.removeAt(0);

    this.questions.forEach((question, index) => {
      this.fieldStates[index] = { touched: false };

      const questionResponses = existingResponses.filter(r => r.questionId === question.id);

      const selectedValue = questionResponses.length > 0 && questionResponses[0].value !== undefined
        ? questionResponses[0].value
        : '';

      const selectedOptionIds = questionResponses
        .filter(r => r.optionId !== undefined && r.optionId !== null)
        .map(r => r.optionId);

      const group = this.fb.group({
        questionId: [question.id],
        value: [{ value: selectedValue, disabled: this.isAdmin }, question.isRequired ? Validators.required : null],
        // ⚠️ on stocke des nombres (pas des objets), car on lit .value plus tard
        optionIds: this.fb.array(selectedOptionIds.map(id => this.fb.control(id)))
      });

      this.responses.push(group);
    });
  }

  setReadOnlyMode(): void {
    const responsesArray = this.formGroup.get('responses') as FormArray;
    responsesArray.controls.forEach((control) => {
      control.get('value')?.disable({ emitEvent: false });
      const optionIdsControl = control.get('optionIds') as FormArray;
      optionIdsControl.disable({ emitEvent: false });
    });
    this.formGroup.get('comment')?.enable({ emitEvent: false });
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
      const idx = optionIds.controls.findIndex(c => c.value === optionId);
      if (idx >= 0) optionIds.removeAt(idx);
    }
  }

  isOptionChecked(questionIndex: number, optionId: number): boolean {
    const optionIdsControl = this.responses.at(questionIndex).get('optionIds') as FormArray;
    return (optionIdsControl?.value || []).includes(optionId);
    // FormArray.value => number[]
  }

  goBack(): void {
    if (this.dossierId) {
      this.router.navigate([`/projects/edit/${this.dossierId}/step1`]);
    } else {
      this.router.navigate(['/projects/create/step1']);
    }
  }

  submit(): void {
    this.isSubmitted = true;
    Object.keys(this.fieldStates).forEach(key => (this.fieldStates[+key].touched = true));

    if (this.formGroup.invalid || !this.formMetadata) {
      this.scrollToFirstInvalidField();
      return;
    }

    const stepId = 1;

    const cleanedResponses = this.responses.controls
      .map(ctrl => {
        const g = ctrl as FormGroup;

        const rawVal = g.get('value')?.value;
        const normalizedValue =
          rawVal === null || rawVal === undefined
            ? null
            : typeof rawVal === 'string'
              ? rawVal.trim()
              : rawVal; // number/boolean -> on garde tel quel

        const optionIdsArr = (g.get('optionIds') as FormArray)?.value ?? [];

        return {
          questionId: g.get('questionId')?.value,
          value: normalizedValue,
          optionIds: Array.isArray(optionIdsArr)
            ? optionIdsArr.filter((id: any) => id != null)
            : []
        };
      })
      .filter(r =>
        (r.value !== null && r.value !== '') ||
        (Array.isArray(r.optionIds) && r.optionIds.length > 0)
      );

    let payload: Payload = {
      formId: this.formMetadata.id,
      stepId,
      dossierId: this.dossierId,
      responses: this.isAdmin ? [] : cleanedResponses
    };
    if (this.isAdmin) payload.comment = this.formGroup.get('comment')?.value || '';

    const dossierIdToSend: number | null = this.dossierId ? Number(this.dossierId) : null;
    const onSuccess = (res: any): void => {

      this.loadHistoryForThisStep();   // <-- refresh de la timeline

      const dossierId = res.dossierId || dossierIdToSend;

      if (dossierId) {
        localStorage.setItem('dossierId', String(dossierId));
        const prev = Number(localStorage.getItem('completedStep') || '0');
        if (prev < 1) localStorage.setItem('completedStep', '1');
        this.router.navigate([`/projects/edit/${dossierId}`], {
          state: { successMessage: 'Étape 1 terminée avec succès !', completedStep: 1 }
        });
      }
    };

    if (this.isEditMode && dossierIdToSend) {
      this.formService.submitStep(payload, stepId, dossierIdToSend).subscribe({ next: onSuccess });
    } else {
      this.formService.submitStep(payload, stepId, null).subscribe({ next: onSuccess });
    }
  }




  onRadioChange(i: number, selectedId: number): void {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;
    while (optionIds.length) optionIds.removeAt(0);
    optionIds.push(this.fb.control(selectedId));

    // Exemple de logique conditionnelle
    const question3Id = 3;
    const question4Index = this.questions.findIndex(q => q.id === 4);
    if (this.questions[i].id === question3Id && question4Index !== -1) {
      this.questions[question4Index].isHidden = (selectedId !== 2);
    }
  }

  isRadioSelected(i: number, optionId: number): boolean {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;
    return optionIds.value?.[0] === optionId;
  }

  private scrollToFirstInvalidField(): void {
    setTimeout(() => {
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // ------- Drawer (simple) --------
  openAi(): void {
    this.ai.open = true;
    this.ai.description = this.buildBriefFromForm(); // auto-préremplissage utile
  }
  closeAi(): void {
    this.ai.open = false;
  }

  /** Construit un petit brief à partir des réponses déjà saisies */
  private buildBriefFromForm(): string {
    try {
      if (!this.questions?.length) return '';
      const lines: string[] = [];
      const arr = this.responses;
      this.questions.forEach((q, i) => {
        const grp = arr.at(i);
        if (!grp) return;

        const value = grp.get('value')?.value;
        const optionIds: number[] = (grp.get('optionIds')?.value ?? []) as number[];
        let pretty = '';

        if (Array.isArray(optionIds) && optionIds.length && q.options?.length) {
          const labels = q.options.filter((o: any) => optionIds.includes(o.id)).map((o: any) => o.value);
          pretty = labels.join(', ');
        } else if (value != null && String(value).trim() !== '') {
          pretty = String(value).trim();
        }

        if (pretty) lines.push(`${q.text} : ${pretty}`);
      });
      return lines.join('\n');
    } catch { return ''; }
  }

  // ------- Parsing de la description pour remplir le formulaire -------
  private norm(s: any): string {
    return (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private pickOptionId(q: any, answer: string): number | null {
    if (!q?.options?.length) return null;
    const a = this.norm(answer);

    let opt =
      q.options.find((o: any) => this.norm(o.value) === a) ||
      q.options.find((o: any) => a.includes(this.norm(o.value))) ||
      q.options.find((o: any) => this.norm(o.value).includes(a));
    if (opt) return opt.id ?? null;

    const synonyms: Record<string, string[]> = {
      'pêche artisanale': ['peche artisanale', 'peche', 'pêche'],
      'aquaculture': ['aquaculture'],
      'produits agricoles, élevage, forestiers': ['agricole', 'agriculture', 'elevage', 'forestier', 'agricoles'],
      'produits halieutiques : pêche, aquaculture': ['halieutique', 'halieutiques', 'peche', 'pêche', 'aquaculture', 'marin'],
      'production primaire': ['production primaire', 'primaire', 'production'],
      'collecte': ['collecte'],
      'transformation': ['transformation'],
      'services': ['service', 'services'],
      'débutant': ['debutant', 'debut', 'débutant'],
      'intermédiaire': ['intermediaire', 'intermédiaire'],
      'confirmé': ['confirme', 'confirmé', 'avance', 'avancé'],
      'création': ['creation', 'nouveau', 'nouvelle'],
      'extension': ['extension', 'agrandissement']
    };

    for (const o of q.options) {
      const key = o.value as string;
      const syns = synonyms[key] ?? [key];
      if (syns.some(s => a.includes(this.norm(s)))) return o.id ?? null;
    }
    return null;
  }

  private setAnswer(i: number, q: any, answer: string): void {
    const grp = this.responses.at(i);
    if (!grp) return;

    if (q.type === 'TEXTE' || q.type === 'NUMERIQUE') {
      grp.get('value')?.setValue(answer);
      return;
    }

    if (q.type === 'SELECT') {
      const id = this.pickOptionId(q, answer);
      if (id != null) grp.get('value')?.setValue(id);
      return;
    }

    if (q.type === 'RADIO') {
      const id = this.pickOptionId(q, answer);
      if (id != null) {
        const arr = grp.get('optionIds') as FormArray;
        while (arr.length) arr.removeAt(0);
        arr.push(this.fb.control(id));
        this.onRadioChange(i, id);
      }
      return;
    }

    if (q.type === 'CHOIXMULTIPLE') {
      const parts = answer.split(/[;,/]\s*|\n/).map(s => s.trim()).filter(Boolean);
      const ids = parts.map(p => this.pickOptionId(q, p)).filter((x): x is number => x != null);
      const arr = grp.get('optionIds') as FormArray;
      while (arr.length) arr.removeAt(0);
      ids.forEach(id => arr.push(this.fb.control(id)));
    }
  }

  applyAnswersFromDescription(): void {
    if (this.isAdmin) return;
    const raw = (this.ai.description || '').trim();
    if (!raw) return;

    const ok = this.applyByKeywords(raw);
    if (!ok) this.applyByOrder(raw);

    // ✅ maj des états/validité
    this.formGroup.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    this.questions.forEach((_, i) => this.onFieldBlur(i));

    this.closeAi();
  }


  private applyByKeywords(raw: string): boolean {
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.some(l => l.includes(':'))) return false;

    const map: Array<{ key: RegExp; pick: (q: any) => boolean }> = [
      { key: /situation|statut/i, pick: (q) => /situation.*entreprise/i.test(q.text) },
      { key: /nom|entreprise/i, pick: (q) => /nom.*entreprise/i.test(q.text) },
      { key: /secteur|sous.*secteur/i, pick: (q) => /sous.*secteur/i.test(q.text) },
      { key: /mode|production/i, pick: (q) => /mode.*production/i.test(q.text) },
      { key: /fonction|chaine|chaîne/i, pick: (q) => /(fonction).*cha[iî]ne/i.test(q.text) },
      { key: /transition|ecolo|écolo|avancement|maturite|maturité/i, pick: (q) => /transition.*durable|avancement/i.test(q.text) },
    ];

    for (const line of lines) {
      const [k, ...rest] = line.split(':');
      if (!rest.length) continue;
      const value = rest.join(':').trim();
      const key = k.trim();

      const idx = this.questions.findIndex(q => map.some(m => m.key.test(key) && m.pick(q)));
      if (idx >= 0) this.setAnswer(idx, this.questions[idx], value);
    }
    return true;
  }

  private applyByOrder(raw: string): void {
    const parts = raw.split(/\r?\n|;/).map(s => s.trim()).filter(Boolean);
    let j = 0;
    for (let i = 0; i < this.questions.length && j < parts.length; i++) {
      const q = this.questions[i];
      const ans = parts[j];
      this.setAnswer(i, q, ans);
      j++;
    }
  }


  private loadHistoryForThisStep(): void {
    this.historyLoaded = false;

    if (!this.dossierId) {
      this.history = [];
      this.historyLoaded = true;
      return;
    }
    const stepId = 1;
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
