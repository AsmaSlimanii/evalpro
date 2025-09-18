import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormService } from '../../../../core/services/form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Payload } from '../../../../shared/models/creation-projet.dto';
import { HistoryService, StepHistory } from '../../../../core/services/HistoryService';


@Component({
  selector: 'app-creation-projet',
  templateUrl: './creation-projet.component.html',
  styleUrls: ['./creation-projet.component.scss']
})
export class CreationProjetComponent implements OnInit {
  formGroup!: FormGroup;
  formMetadata: any;
  questions: any[] = [];
  isLoading = true;
  isSubmitted = false;
  fieldStates: { [key: number]: { touched: boolean } } = {};
  dossierId: string | null = null;
  isEditMode = false;
  filteredOptions11: any[] = [];
  filteredOptions12: any[] = [];
  autresCtrl: any;
  isAdmin = false;
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
    private authService: AuthService,  // ⬅️ Ajoute ceci
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
      }
    }

    this.isAdmin = this.authService.isAdmin(); // 👈 Détermine si l'utilisateur est admin
    this.initForm();
    this.loadForm();
    this.loadHistoryForThisStep();



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


  private setupRouteListener(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      if (url.includes('/projects/edit/') && url.includes('/step2')) {
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
    const step = 'creation-projet';
    this.isLoading = true;
    this.loadHistoryForThisStep(); // <— charge l’historique

    const onFormLoad = (form: any) => {
      this.formMetadata = form;
      this.questions = form.questions;
      this.formGroup.patchValue({
        comment: form.comment || ''
      });

      // 🔧 Ajout des parent_option_id pour Q11
      this.questions.forEach((q) => {
        if (q.id === 11) {
          q.options.forEach((opt: any) => {
            const optId = Number(opt.id);
            // 🔧 Sous-secteurs pour APII (option ID 15)
            if ([65, 66, 67, 68, 69].includes(opt.id)) opt.parent_option_id = 15;


            // 🔧 Sous-secteurs pour APIA (option ID 14)
            if ([17, 18, 19].includes(opt.id)) opt.parent_option_id = 14;

          });
        }
      });

      // Pour Q12
      this.questions.forEach((q) => {
        if (q.id === 12) {
          q.options.forEach((opt: any) => {
            const optId = Number(opt.id);
            if ([20, 21, 22, 23, 24, 25, 26, 27, 28].includes(optId)) opt.parent_option_id = 17;
            if ([29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].includes(optId)) opt.parent_option_id = 18;
            if ([45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64].includes(optId)) opt.parent_option_id = 19;
            if ([70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97].includes(optId)) opt.parent_option_id = 65;
            if ([98, 99, 100, 101, 102, 103, 104, 105].includes(optId)) opt.parent_option_id = 66;
            if ([106, 107, 108, 109, 110, 111, 112, 113].includes(optId)) opt.parent_option_id = 67;
            if ([114, 115, 116, 117, 118, 119, 120, 121, 122].includes(optId)) opt.parent_option_id = 68;
            if ([123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133].includes(optId)) opt.parent_option_id = 69;

          });
        }
      });

      // 🧱 On construit les contrôles de formulaire
      this.buildFormControlsWithData(form.responses || []);

      // ✅ Désactiver les champs si admin (après construction du formulaire)
      if (this.isAdmin) {
        this.setReadOnlyMode();
      }

      // 🎯 Trouver la valeur sélectionnée de la Q10 (Catégorie investissement)
      const categoryCtrl = this.responses.at(0)?.get('value');
      if (categoryCtrl) {
        const selectedVal = Number(categoryCtrl.value);
        console.log('🔍 Q10 sélectionnée (Catégorie):', selectedVal);

        // 🔁 Mise à jour des options filtrées de Q11
        this.updateOptionsForQuestion11(selectedVal);

        // 🧠 Observer les changements en Q10
        categoryCtrl.valueChanges.subscribe((val: any) => {
          const numVal = Number(val);
          console.log('🔄 Q10 modifiée → nouvelle valeur:', numVal);
          this.updateOptionsForQuestion11(numVal);
        });
      }

      // 🚀 Fin
      this.isLoading = false;
    };

    // 📦 Récupération du formulaire
    if (this.isEditMode && this.dossierId) {
      this.formService.getFormWithResponses(step, this.dossierId).subscribe({
        next: onFormLoad,
        error: () => this.isLoading = false
      });
    } else {
      this.formService.getFormByStep(step).subscribe({
        next: onFormLoad,
        error: () => this.isLoading = false
      });
    }
  }

  isFieldDisabled(qId: number): boolean {
    // Tous les champs sont désactivés si admin SAUF Q11 et Q12
    return this.isAdmin && qId !== 11 && qId !== 12;
  }


  updateOptionsForQuestion11(selectedOptionId: number): void {
    const question11 = this.questions.find(q => q.id === 11);
    if (!question11) return;

    this.filteredOptions11 = question11.options.filter(
      (opt: any) => opt.parent_option_id === selectedOptionId
    );
  }
  updateOptionsForQuestion12(parentOptionId: number): void {
    const question12 = this.questions.find(q => q.id === 12);
    if (!question12) return;

    this.filteredOptions12 = question12.options.filter(
      (opt: any) => opt.parent_option_id === parentOptionId
    );

    console.log('📌 Options Q12 filtrées =', this.filteredOptions12);
    console.log('🔎 parentOptionId reçu =', parentOptionId);
    console.log('🧾 Tous parent_option_id disponibles dans q12 =', question12.options.map((o: { parent_option_id: any; }) => o.parent_option_id));

  }

  shouldShowQuestion11(): boolean {
    const selected = this.responses.at(0)?.get('value')?.value;
    return selected !== 27 && (selected === 25 || selected === 26);
  }

  shouldShowQuestion12(): boolean {
    const selectedQ11 = this.responses.controls.find(ctrl => +ctrl.value.questionId === 11);
    const selectedQ10 = this.responses.at(0)?.get('value')?.value;
    return selectedQ10 !== 27 && !!selectedQ11?.get('value')?.value;
  }


  shouldShowAutresTextField(): boolean {
    const selectedQ10 = this.responses.at(0)?.get('value')?.value;
    return selectedQ10 === 27; // ID de "Autres"
  }

  private buildFormControlsWithData(existingResponses: any[]): void {
    while (this.responses.length) this.responses.removeAt(0);

    this.questions.forEach((question, index) => {
      this.fieldStates[index] = { touched: false };

      const questionResponses = existingResponses.filter(r => r.questionId === question.id);

      const selectedOptionIds = questionResponses
        .filter(r => r.optionId !== undefined && r.optionId !== null)
        .map(r => r.optionId);

      let selectedValue = questionResponses.find(r => r.value !== null)?.value || '';

      // ✅ Injecter optionId[0] si pas de value
      if (!selectedValue && selectedOptionIds.length > 0) {
        selectedValue = selectedOptionIds[0];
      }

      if (typeof selectedValue === 'string' && question.type === 'SELECT') {
        selectedValue = Number(selectedValue);
      }

      const group = this.fb.group({
        questionId: [question.id],
        value: [{ value: selectedValue, disabled: this.isAdmin }, question.isRequired ? Validators.required : null],
        optionIds: this.fb.array(
          selectedOptionIds.map(id => this.fb.control({ value: id, disabled: this.isAdmin }))
        )
      });

      this.responses.push(group);

      // 🔁 Dynamique pour "Autres"
      if (question.id === 15) {
        this.autresCtrl = this.fb.control(
          selectedValue || '',
          question.isRequired ? Validators.required : null
        );
        this.formGroup.addControl('autres', this.autresCtrl);
      }

      // 🔄 Q10 → Q11
      if (question.id === 10) {
        setTimeout(() => {
          const val = Number(selectedValue);
          this.updateOptionsForQuestion11(val);
        });

        group.get('value')?.valueChanges.subscribe((val: any) => {
          this.updateOptionsForQuestion11(Number(val));
        });
      }

      // 🔄 Q11 → Q12
      if (question.id === 11) {
        setTimeout(() => {
          const val = typeof selectedValue === 'object' ? selectedValue?.id : selectedValue;
          this.updateOptionsForQuestion12(Number(val));
        });

        group.get('value')?.valueChanges.subscribe((val: any) => {
          const optionId = typeof val === 'object' ? val?.id : val;
          this.updateOptionsForQuestion12(Number(optionId));
        });
      }
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
      this.router.navigate([`/projects/edit/${this.dossierId}/step2`]);
    } else {
      this.router.navigate(['/projects/create/step2']);
    }
  }

  submit(): void {
    // 1) validation UI
    this.formGroup.markAllAsTouched();
    this.isSubmitted = true;
    Object.keys(this.fieldStates).forEach(k => (this.fieldStates[+k].touched = true));

    // 2) ne bloque pas un admin qui poste juste un commentaire
    if (!this.isAdmin && (this.formGroup.invalid || !this.formMetadata)) {
      this.scrollToFirstInvalidField();
      return;
    }

    const stepId = 2;

    // 3) construire le payload (vide côté réponses si admin)
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

    if (this.shouldShowAutresTextField()) {
      cleanedResponses.push({
        questionId: 15, // garde ton id
        value: this.autresCtrl.value?.trim() || null,
        optionIds: []
      });
    }

    let payload: Payload = {
      formId: this.formMetadata.id,
      stepId,
      dossierId: this.dossierId, // ok si ton API l’accepte
      responses: this.isAdmin ? [] : cleanedResponses
    };
    if (this.isAdmin) {
      payload.comment = this.formGroup.get('comment')?.value || '';
    }

    const dossierIdToSend: number | null = this.dossierId ? Number(this.dossierId) : null;

    // 4) au succès: stocker l'id, avancer la barre, et renvoyer au hub AVEC message + progression
    const onSuccess = (res: any): void => {

      this.loadHistoryForThisStep();   // <-- refresh de la timeline

      const dossierId = res?.dossierId || dossierIdToSend;

      if (!dossierId) return;

      localStorage.setItem('dossierId', String(dossierId));

      // avance la progression au moins à 2
      const prev = Number(localStorage.getItem('completedStep') || '0');
      if (prev < 2) localStorage.setItem('completedStep', '2');

      this.router.navigate(['/projects/edit', dossierId], {
        state: {
          successMessage: 'Étape 2 terminée avec succès !',
          completedStep: 2
        }
      });
    };

    // 5) call API
    if (this.isEditMode && dossierIdToSend) {
      this.formService.submitStep(payload, stepId, dossierIdToSend).subscribe({
        next: onSuccess,
        error: (err: any) => console.error('Erreur envoi (edit)', err)
      });
    } else {
      this.formService.submitStep(payload, stepId, null).subscribe({
        next: onSuccess,
        error: (err: any) => console.error('Erreur envoi (création)', err)
      });
    }
  }


  onSelectChange(questionId: number, event: Event): void {
    const selectedValue = Number((event.target as HTMLSelectElement).value);
    const ctrl = this.responses.controls.find(c => c.value.questionId === questionId);
    if (ctrl) {
      ctrl.get('value')?.setValue(selectedValue);
    }

    if (questionId === 10) {
      this.updateOptionsForQuestion11(selectedValue);
    }
    if (questionId === 11) {
      this.updateOptionsForQuestion12(selectedValue);
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




  // === ÉTAT MINIMAL DE L’ASSISTANT IA ===
  // === ÉTAT MINIMAL DE L’ASSISTANT IA (step2) ===
  ai = {
    open: false,
    description: ''
  };

  // Ouvre/ferme le drawer
  openAi(): void {
    this.ai.open = true;
    this.ai.description = this.buildBriefFromForm(); // pré-rempli depuis le formulaire
  }
  closeAi(): void { this.ai.open = false; }

  /** Construit un petit brief depuis les réponses existantes (sert à pré-remplir le textarea) */
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

      if (this.shouldShowAutresTextField() && this.autresCtrl?.value) {
        lines.push(`Autres : ${this.autresCtrl.value}`);
      }
      return lines.join('\n');
    } catch { return ''; }
  }

  /* -------------------- Parsing & application (step2) -------------------- */

  // normalisation
  private norm(s: any): string {
    return (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  /** Synonymes/mots-clés utilisés pour retrouver les options (Étape 2) */
  private STEP2_SYNONYMS: Record<string, string[]> = {
    // Q9 (grande liste à cocher) — mets ici les libellés EXACTS de tes options à gauche :
    'Toute activité ayant un impact négatif direct, significatif et irréversible avec des risques pour la santé et la sécurité des communautés concernées': [
      'impact négatif direct', 'risques pour la santé', 'sécurité des communautés'
    ],
    'Toute activité de tannerie': ['tannerie'],
    'La capacité journalière de traitement de lait (ou dérivés) de l’activité collecte, transformation, etc est supérieure à 30 000 l': [
      'traitement de lait', '30000', '30 000'
    ],
    'La capacité totale des vases d’extraction pour la distillation est supérieure à 5 m3': ['distillation', '5 m3', 'extraction'],
    'Tout élevage de ruminants intégralement hors sol': ['ruminants', 'hors sol'],
    'Toute arboriculture monospecifique en intensif ou hyper intensif sans pratiques agricoles durables ni diversification': [
      'arboriculture', 'monospécifique', 'hyper intensif'
    ],
    'Toute grande culture en monoculture et sans rotation culturale ni amendement organique': [
      'grande culture', 'monoculture', 'sans rotation', 'amendement organique'
    ],
    'Tout projet ne respectant pas la réglementation applicable': ['ne respectant pas la réglementation'],
    'Toute activité de pêche illégale': ['pêche illégale', 'peche illegale'],
    'Aucun de ces choix': ['aucun']
    // ➜ Ajoute ici les autres libellés de Q9 s’il en manque
    ,

    // Étude de faisabilité (Q?) — SELECT
    'Non, pas encore': ['non', 'pas encore', 'non pas encore'],
    'Oui, elle est en cours': ['en cours', 'oui en cours'],
    'Oui, elle est disponible': ['oui', 'disponible', 'oui disponible'],

    // Catégorie APIA/APII (Q10) — SELECT
    'APIA': ['apia'],
    'APII': ['apii'],
    'Autres': ['autre', 'autres'],

    // Sous-secteur APIA (Q11) — SELECT (exemples, adapte aux tiens)
    'Production : Agriculture & élevage (APIA)': ['agriculture', 'élevage', 'production apia', 'elevage'],
    'Première transformation (APIA)': ['première transformation', '1ere transformation', 'premiere transformation'],
    'Services à la production (APIA)': ['services à la production', 'services production'],

    // Catégorie d’investissement (Q12) — SELECT (exemples fréquents)
    'Grandes Cultures': ['grandes cultures'],
    'Cultures Maraîchères': ['maraicheres', 'maraîchères'],
    'Arboriculture (y compris les oliviers)': ['arboriculture', 'oliviers'],
    'Production de Semences et de Plants': ['semences', 'plants'],
    'Floriculture, plantes aromatiques et médicinales': ['floriculture', 'plantes aromatiques', 'médicinales'],
    'Cultures sous serres': ['serres', 'cultures sous serres'],
    'Élevage (y compris l’Aviculture, la Cuniculture, l’Apiculture, l’élevage de dindes, …)': [
      'elevage', 'aviculture', 'cuniculture', 'apiculture', 'dindes'
    ]
  };

  /** Essaie de retrouver l’ID d’option à partir d’une réponse texte */
  private pickOptionId(q: any, answer: string): number | null {
    if (!q?.options?.length) return null;
    const a = this.norm(answer);

    // match direct/partiel
    let opt =
      q.options.find((o: any) => this.norm(o.value) === a) ||
      q.options.find((o: any) => a.includes(this.norm(o.value))) ||
      q.options.find((o: any) => this.norm(o.value).includes(a));
    if (opt) return opt.id ?? null;

    // synonymes (ajuste/complète au besoin)
    const SYN: Record<string, string[]> = this.STEP2_SYNONYMS ?? {};
    for (const o of q.options) {
      const key = o.value as string;
      const syns = SYN[key] ?? [key];
      if (syns.some(s => a.includes(this.norm(s)))) return o.id ?? null;
    }
    return null;
  }


  /** Affecte la réponse à la question i (gère toutes les variantes + dépendances Q10 → Q11 → Q12) */
  /** Affecte la réponse en respectant les dépendances Q10 -> Q11 -> Q12 */
  private setAnswer(i: number, q: any, answer: string): void {
    const grp = this.responses.at(i);
    if (!grp) return;

    if (q.type === 'TEXTE') {
      // ne mets pas un nombre pur dans "Nom du projet"
      const digitsOnly = String(answer).replace(/[^\d]/g, '');
      const looksLikeOnlyNumber = digitsOnly.length && digitsOnly === String(answer).replace(/\s/g, '');
      if (looksLikeOnlyNumber && /nom.*projet/i.test(this.norm(q.text))) return;
      grp.get('value')?.setValue(answer);
      return;
    }


    if (q.type === 'NUMERIQUE') {
      const onlyDigits = String(answer).replace(/[^\d.]/g, '');
      grp.get('value')?.setValue(onlyDigits);
      return;
    }

    if (q.type === 'SELECT') {
      const id = this.pickOptionId(q, answer);
      if (id == null) return;
      grp.get('value')?.setValue(id);
      if (q.id === 10) this.updateOptionsForQuestion11(Number(id));
      if (q.id === 11) this.updateOptionsForQuestion12(Number(id));
      return;
    }

    if (q.type === 'RADIO') {
      const id = this.pickOptionId(q, answer);
      if (id != null) {
        const arr = grp.get('optionIds') as FormArray;
        while (arr.length) arr.removeAt(0);
        arr.push(this.fb.control(id));
      }
      return;
    }

    if (q.type === 'CHOIXMULTIPLE') {
      const parts = String(answer).split(/[;,/]\s*|\n/).map(s => s.trim()).filter(Boolean);
      const ids = parts.map(p => this.pickOptionId(q, p)).filter((x): x is number => x != null);
      const arr = grp.get('optionIds') as FormArray;
      while (arr.length) arr.removeAt(0);
      ids.forEach(id => arr.push(this.fb.control(id)));
    }
  }







  /** Applique la description : tente d’abord “clé: valeur”, sinon “par ordre” */

  applyAnswersFromDescription(): void {
    if (this.isAdmin) return;
    const raw = (this.ai.description || '').trim();
    if (!raw) return;

    const hasColon = raw.includes(':');
    const applied = hasColon ? this.applyByKeywords(raw) : 0;
    if (!hasColon && applied === 0) this.applyByOrder(raw);  // fallback rare

    this.formGroup.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    this.questions.forEach((_, i) => this.onFieldBlur(i));
    this.closeAi();
  }

  /** Mode 1 : “clé: valeur” (ordre logique respecté pour les dépendances) */
  /** Mode 1 : “clé: valeur” (renvoie combien de champs ont été appliqués) */
  private applyByKeywords(raw: string): number {
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.some(l => l.includes(':'))) return 0;

    const pairs = lines.map(l => {
      const [k, ...r] = l.split(':');
      return { k: this.norm(k), v: r.join(':').trim() };
    });

    // Indices cibles trouvés UNIQUEMENT par libellé (plus d’ID figés)
    const findIdx = (re: RegExp) => this.questions.findIndex(q => re.test(this.norm(q.text)));

    const idxName = findIdx(/nom.*projet/);
    const idxChecklist = this.questions.findIndex(q =>
      q.type === 'CHOIXMULTIPLE' ||
      /correspond.*descriptions|liste.*cocher|exclusions?/.test(this.norm(q.text))
    );
    const idxStudy = findIdx(/etude.*faisabilite|plan.*affaire/);
    const idxCatA = findIdx(/categorie.*(apia|apii)/);                 // Catégorie APIA/APII
    const idxSous = findIdx(/sous.*secteur/);                          // Sous secteur (APIA)
    const idxCatInv = findIdx(/categorie.*invest(?!.*nom.*projet)/);     // Catégorie d’investissement (exclut le titre du nom)
    const idxAmount = findIdx(/(estimez|montant)(.*global)?|en\s*tnd/);  // Montant global en TND
    const idxAutres = findIdx(/autres?/);

    let count = 0;

    // 1) Nom du projet
    for (const { k, v } of pairs) {
      if (/nom.*projet|titre/.test(k) && idxName >= 0) {
        // évite de mettre un nombre pur dans le nom
        const onlyDigits = v.replace(/[^\d]/g, '');
        if (!(onlyDigits && onlyDigits === v.replace(/\s/g, ''))) {
          this.setAnswer(idxName, this.questions[idxName], v); count++;
        }
        break;
      }
    }

    // 2) Cases à cocher (descriptions)
    for (const { k, v } of pairs) {
      if ((/description|liste|exclusion/.test(k)) && idxChecklist >= 0) {
        this.setAnswer(idxChecklist, this.questions[idxChecklist], v); count++;
        break;
      }
    }

    // 3) Étude de faisabilité
    for (const { k, v } of pairs) {
      if ((/etude|faisabilite|plan.*affaire/.test(k)) && idxStudy >= 0) {
        this.setAnswer(idxStudy, this.questions[idxStudy], v); count++;
        break;
      }
    }

    // 4) Catégorie APIA/APII  →  5) Sous-secteur  →  6) Catégorie d’investissement
    for (const { k, v } of pairs) {
      if ((/categorie.*(apia|apii)/.test(k)) && idxCatA >= 0) {
        this.setAnswer(idxCatA, this.questions[idxCatA], v); count++;
        // filtre les options de Q11
        const posed = this.responses.at(idxCatA)?.get('value')?.value;
        this.updateOptionsForQuestion11(Number(typeof posed === 'object' ? posed?.id : posed));
        break;
      }
    }
    for (const { k, v } of pairs) {
      if ((/sous.*secteur/.test(k)) && idxSous >= 0) {
        this.setAnswer(idxSous, this.questions[idxSous], v); count++;
        // filtre les options de Q12
        const posed = this.responses.at(idxSous)?.get('value')?.value;
        this.updateOptionsForQuestion12(Number(typeof posed === 'object' ? posed?.id : posed));
        break;
      }
    }
    for (const { k, v } of pairs) {
      if ((/categorie.*invest/.test(k)) && idxCatInv >= 0) {
        this.setAnswer(idxCatInv, this.questions[idxCatInv], v); count++;
        break;
      }
    }

    // 7) Montant global
    for (const { k, v } of pairs) {
      if ((/(estimez|montant)(.*global)?|en\s*tnd/.test(k)) && idxAmount >= 0) {
        this.setAnswer(idxAmount, this.questions[idxAmount], v); count++;
        break;
      }
    }

    // 8) Autres
    for (const { k, v } of pairs) {
      if ((/autres?/.test(k)) && idxAutres >= 0) {
        this.setAnswer(idxAutres, this.questions[idxAutres], v); count++;
        break;
      }
    }

    return count;
  }

  /** Mode 2 : par ordre des questions (1 ligne par réponse) */
  /** Mode 2 : par ordre des questions (1 ligne par réponse) */
  private applyByOrder(raw: string): void {
    const parts = raw.split(/\r?\n|;/).map(s => s.trim()).filter(Boolean);
    let j = 0;

    for (let i = 0; i < this.questions.length && j < parts.length; i++) {
      // si la question a déjà une valeur, on saute
      const existing = this.responses.at(i)?.get('value')?.value;
      if (existing != null && existing !== '') continue;

      let ans = parts[j++];
      if (ans.includes(':')) ans = ans.split(':').slice(1).join(':').trim(); // ne garde que la valeur

      this.setAnswer(i, this.questions[i], ans);

      // gère les dépendances si on vient de poser Q "Catégorie" → "Sous-secteur" → "Catégorie d’invest"
      const posed = this.responses.at(i)?.get('value')?.value;
      const posedId = typeof posed === 'object' ? posed?.id : posed;
      const label = this.norm(this.questions[i].text);

      if (/categorie.*(apia|apii)/.test(label)) this.updateOptionsForQuestion11(Number(posedId));
      if (/sous.*secteur/.test(label)) this.updateOptionsForQuestion12(Number(posedId));
    }
  }

private loadHistoryForThisStep(): void {
    this.historyLoaded = false;

    if (!this.dossierId) {
      this.history = [];
      this.historyLoaded = true;
      return;
    }
    const stepId = 2;
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