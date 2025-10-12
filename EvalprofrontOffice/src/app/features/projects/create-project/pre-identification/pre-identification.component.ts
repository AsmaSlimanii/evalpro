import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormService } from '../../../../core/services/form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Payload } from '../../../../shared/models/creation-projet.dto';
import { HistoryService, StepHistory } from '../../../../core/services/HistoryService';



/**
 * Composant Étape 1 — Pré-identification
 * - Charge la métadonnée du formulaire + réponses existantes
 * - Construit dynamiquement les contrôles (FormArray responses)
 * - Gère le mode édition/création, le rôle admin (lecture seule), et l’historique
 * - Soumet les réponses au backend et redirige vers la page dossier
 */
@Component({
  selector: 'app-pre-identification',
  templateUrl: './pre-identification.component.html',
  styleUrls: ['./pre-identification.component.scss']
})
export class PreIdentificationComponent implements OnInit {
  // Racine du formulaire réactif
  formGroup!: FormGroup;
  // Métadonnées du formulaire (id, questions, etc.)
  formMetadata: any;
  // Liste des questions (enrichies par isHidden pour du conditionnel)
  questions: any[] = [];
  // États d’UI
  isLoading = true;  // spinner pendant chargement
  isSubmitted = false; // déclenche l’affichage des erreurs

  // Suivi des champs touchés (clé: index de question)
  fieldStates: { [key: number]: { touched: boolean } } = {};

  // Contexte dossier (null en création)
  dossierId: string | null = null;
  // Flags mode d’édition et rôle
  isEditMode = false;
  isAdmin = false;

  // --- Mini assistant (drawer) : juste une description et un bouton ---
  ai = {
    open: false,     // ouvre/ferme le panneau
    description: '' // texte libre saisi par l’utilisateur
  };

  // Historique (timeline) de l’étape
  history: StepHistory[] = [];
  historyLoaded = false;
  // Confirmation suppression d’un item d’historique
  confirmOpen = false;
  toDelete?: StepHistory;

  // Optimisation *ngFor sur la timeline

  trackByHistory = (_: number, h: StepHistory) => h.id ?? _;

  constructor(
    private fb: FormBuilder,    // fabrique de contrôles réactifs
    private formService: FormService,   // API formulaire
    private route: ActivatedRoute, // lecture des params de route
    private router: Router,   // navigation + écoute NavigationEnd
    private authService: AuthService,  // rôle (admin ou pas)
    private historyService: HistoryService // API historique
  ) { }

  ngOnInit(): void {
    // Recharger proprement si on revient sur la même route (ex: éditer step1)
    this.setupRouteListener();
    // Lecture robuste du dossierId (parent > courant > localStorage)
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

    // Détermine le rôle utilisateur
    this.isAdmin = this.authService.isAdmin();
    // Initialise la structure du formulaire
    this.initForm();
    // Charge la méta + réponses (selon mode)
    this.loadForm();
    // Charge la timeline de l’étape
    this.loadHistoryForThisStep();
  }

  /**
  * Réécoute NavigationEnd pour recharger si on reste sur /edit/.../step1
  * (utile après validation et retour sur l’étape)
  */

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
  /** Crée le squelette du form (FormArray responses + champ comment) */
  private initForm(): void {
    this.formGroup = this.fb.group({
      responses: this.fb.array([]), // chaque item = {questionId, value, optionIds[]}
      comment: ['']  // commentaire réservé à l’admin
    });
  }
  /** Getter pratique pour le FormArray de réponses */
  get responses(): FormArray {
    return this.formGroup.get('responses') as FormArray;
  }
  /**
     * Charge la définition du formulaire + réponses existantes (si édition)
     * puis construit dynamiquement les contrôles.
     */
  private loadForm(): void {
    const step = 'pre-identification';
    this.isLoading = true;

    const onFormLoad = (form: any) => {
      this.formMetadata = form;
      this.questions = form.questions;
      // Au départ, tout est visible
      this.questions.forEach(q => q.isHidden = false);
      // Construit les contrôles avec les valeurs existantes
      this.buildFormControlsWithData(form.responses || []);


      // Remplit le commentaire (si présent)
      this.formGroup.patchValue({ comment: form.comment || '' });
      // Si admin : fige les champs de réponse mais laisse le commentaire éditable
      if (this.isAdmin) this.setReadOnlyMode();

      this.isLoading = false;
    };
    // Choix de l’API selon mode
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
    // Recharge aussi l’historique (utile si d’autres actions viennent d’avoir lieu)
    this.loadHistoryForThisStep(); // <— charge l’historique
  }

  /**
 * Construit le FormArray `responses` à partir des questions + réponses existantes
 * - value = string/number (selon type)
 * - optionIds = FormArray<number> pour RADIO/CHOIXMULTIPLE
 */

  private buildFormControlsWithData(existingResponses: any[]): void {
    // Reset propre du FormArray
    while (this.responses.length) this.responses.removeAt(0);

    this.questions.forEach((question, index) => {
      // Initialise l’état "touched" du champ
      this.fieldStates[index] = { touched: false };
      // Filtre toutes les réponses correspondant à cette question
      const questionResponses = existingResponses.filter(r => r.questionId === question.id);
      // Valeur textuelle/numérique si présente (première occurrence)
      const selectedValue = questionResponses.length > 0 && questionResponses[0].value !== undefined
        ? questionResponses[0].value
        : '';
      // Liste des options sélectionnées (ids) si c’est du multi/radio
      const selectedOptionIds = questionResponses
        .filter(r => r.optionId !== undefined && r.optionId !== null)
        .map(r => r.optionId);
      // Crée le form group d’une réponse
      const group = this.fb.group({
        questionId: [question.id],
        // value est désactivé si admin ; required si la question l’est
        value: [{ value: selectedValue, disabled: this.isAdmin }, question.isRequired ? Validators.required : null],
        // ⚠️ on stocke des nombres (pas des objets), car on lit .value plus tard
        optionIds: this.fb.array(selectedOptionIds.map(id => this.fb.control(id)))
      });

      this.responses.push(group);
    });
  }
  /**
   * Mode lecture seule pour les réponses (admin) — seul 'comment' reste éditable
   */
  setReadOnlyMode(): void {
    const responsesArray = this.formGroup.get('responses') as FormArray;
    responsesArray.controls.forEach((control) => {
      control.get('value')?.disable({ emitEvent: false });
      const optionIdsControl = control.get('optionIds') as FormArray;
      optionIdsControl.disable({ emitEvent: false });
    });
    this.formGroup.get('comment')?.enable({ emitEvent: false });
  }
  /** Marque le champ comme "touché" au blur pour afficher d’éventuelles erreurs */
  onFieldBlur(index: number): void {
    this.fieldStates[index].touched = true;
  }

  /** Indique si on affiche l’erreur de validation pour un champ donné */
  showError(index: number): boolean {
    const control = this.responses.at(index).get('value');
    return !!(control?.invalid && (this.fieldStates[index].touched || this.isSubmitted));
  }

  /**
  * Gestion CHOIXMULTIPLE (checkbox) : ajoute/enlève l’id d’option sélectionné
  */
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
  /** Vérifie si une option (checkbox) est cochée pour l’index de question donné */
  isOptionChecked(questionIndex: number, optionId: number): boolean {
    const optionIdsControl = this.responses.at(questionIndex).get('optionIds') as FormArray;
    return (optionIdsControl?.value || []).includes(optionId);
    // FormArray.value => number[]
  }
  /** Retour à l’écran étape 1 (création ou édition selon contexte) */
  goBack(): void {
    if (this.dossierId) {
      this.router.navigate([`/projects/edit/${this.dossierId}/step1`]);
    } else {
      this.router.navigate(['/projects/create/step1']);
    }
  }

  /**
   * Soumission de l’étape :
   * - Valide le form, scrolle au 1er champ invalide si besoin
   * - Normalise les réponses (value trim, optionIds filtrés)
   * - Construit le payload et appelle le service
   * - Met à jour localStorage + redirige vers /projects/edit/:dossierId
   */

  submit(): void {
    this.isSubmitted = true;
    // Marque tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.fieldStates).forEach(key => (this.fieldStates[+key].touched = true));
    // Stop si invalide ou métadonnée manquante
    if (this.formGroup.invalid || !this.formMetadata) {
      this.scrollToFirstInvalidField();
      return;
    }

    const stepId = 1;
    // Nettoyage des réponses (supprime les vides)
    const cleanedResponses = this.responses.controls
      .map(ctrl => {
        const g = ctrl as FormGroup;
        // Normalise value (trim si string)
        const rawVal = g.get('value')?.value;
        const normalizedValue =
          rawVal === null || rawVal === undefined
            ? null
            : typeof rawVal === 'string'
              ? rawVal.trim()
              : rawVal; // number/boolean -> on garde tel quel
        // Récupère le tableau d’ids d’option
        const optionIdsArr = (g.get('optionIds') as FormArray)?.value ?? [];

        return {
          questionId: g.get('questionId')?.value,
          value: normalizedValue,
          optionIds: Array.isArray(optionIdsArr)
            ? optionIdsArr.filter((id: any) => id != null)
            : []
        };
      })
      // Ne garde que les réponses renseignées (value non vide OU options sélectionnées)
      .filter(r =>
        (r.value !== null && r.value !== '') ||
        (Array.isArray(r.optionIds) && r.optionIds.length > 0)
      );
    // Construit le payload — NB: en admin on n’envoie pas de réponses, seulement le commentaire
    let payload: Payload = {
      formId: this.formMetadata.id,
      stepId,
      dossierId: this.dossierId,
      responses: this.isAdmin ? [] : cleanedResponses
    };
    if (this.isAdmin) payload.comment = this.formGroup.get('comment')?.value || '';
    // Dossier Id à envoyer (nombre ou null)
    const dossierIdToSend: number | null = this.dossierId ? Number(this.dossierId) : null;
    // Callback succès : met à jour historique, localStorage et redirige
    const onSuccess = (res: any): void => {
      // Rafraîchit la timeline après soumission
      this.loadHistoryForThisStep();   // <-- refresh de la timeline
      // Récupère l’id dossier retourné (création) ou reprend l’existant
      const dossierId = res.dossierId || dossierIdToSend;

      if (dossierId) {
        // Mémorise l’id dossier pour les étapes suivantes
        localStorage.setItem('dossierId', String(dossierId));
        // Marque l’étape 1 comme complétée si besoin
        const prev = Number(localStorage.getItem('completedStep') || '0');
        // Redirection vers la page récap du dossier (avec message succès)
        if (prev < 1) localStorage.setItem('completedStep', '1');
        this.router.navigate([`/projects/edit/${dossierId}`], {
          state: { successMessage: 'Étape 1 terminée avec succès !', completedStep: 1 }
        });
      }
    };
    // Appel API : différencie création / édition
    if (this.isEditMode && dossierIdToSend) {
      this.formService.submitStep(payload, stepId, dossierIdToSend).subscribe({ next: onSuccess });
    } else {
      this.formService.submitStep(payload, stepId, null).subscribe({ next: onSuccess });
    }
  }



  /**
   * Gestion RADIO : remplace l’unique option sélectionnée + logique conditionnelle
   * (exemple: si q3 != option 2 alors cacher q4)
   */

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
  /** Vérifie si l’option `optionId` est la sélection radio courante */
  isRadioSelected(i: number, optionId: number): boolean {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;
    return optionIds.value?.[0] === optionId;
  }
  /** UI: scroll vers le premier champ invalide après soumission */
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

  /**
 * Construit une description synthétique depuis les réponses déjà saisies
 * (concatène intitule: valeur/étiquettes sélectionnées)
 */
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
        // Si options sélectionnées, récupère les labels correspondants
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

  /** Normalise une string (sans accents, lowercase, trim) pour matcher des options */
  private norm(s: any): string {
    return (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  /**
 * Essaie de trouver l’id d’option d’une question à partir d’un texte libre
 * - match exact, contient, ou via synonymes
 */
  private pickOptionId(q: any, answer: string): number | null {
    if (!q?.options?.length) return null;
    const a = this.norm(answer);
    // 1) Match direct ou partiel
    let opt =
      q.options.find((o: any) => this.norm(o.value) === a) ||
      q.options.find((o: any) => a.includes(this.norm(o.value))) ||
      q.options.find((o: any) => this.norm(o.value).includes(a));
    if (opt) return opt.id ?? null;

    // 2) Table de synonymes (personnalisable)
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
  /**
   * Applique une réponse textuelle à un contrôle en fonction du type de question
   * - TEXTE/NUMERIQUE: écrit dans value
   * - SELECT: met l’id sélectionné dans value
   * - RADIO/CHOIXMULTIPLE: remplit optionIds (et déclenche onRadioChange pour la logique)
   */
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

  /**
 * Applique le contenu du mini-assistant au formulaire (si non admin) :
 * - tente par mots-clés (label: valeur)
 * - sinon applique par ordre ligne-à-ligne
 * - met à jour la validité et ferme le drawer
 */
  applyAnswersFromDescription(): void {
    if (this.isAdmin) return;
    const raw = (this.ai.description || '').trim();
    if (!raw) return;

    const ok = this.applyByKeywords(raw);
    if (!ok) this.applyByOrder(raw);

  // Met à jour la validité et marque les champs comme touchés
    this.formGroup.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    this.questions.forEach((_, i) => this.onFieldBlur(i));

    this.closeAi();
  }
 /** Stratégie 1 : "clé: valeur" avec quelques heuristiques de mapping vers les questions */

  private applyByKeywords(raw: string): boolean {
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.some(l => l.includes(':'))) return false;
 // Mapping heuristique de mots-clés -> questions
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

      // Trouve l’index de question correspondant à la clé
      const idx = this.questions.findIndex(q => map.some(m => m.key.test(key) && m.pick(q)));
      if (idx >= 0) this.setAnswer(idx, this.questions[idx], value);
    }
    return true;
  }
 /** Stratégie 2 : appliquer les lignes dans l’ordre sur les questions dans l’ordre */
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

  // ------------------ Historique (timeline) ------------------

  /**
   * Charge l’historique pour cette étape et ce dossier.
   * Si pas de dossier, timeline vide.
   */

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

 /** Met une action d’historique en forme (ex: 'CREATED_ENTRY' -> 'Created entry') */
  prettifyAction(a: string): string {
    if (!a) return '';
    const clean = a.toString().replace(/_/g, ' ').toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  /** Ouvre la modale de confirmation de suppression */
  openDeleteConfirm(h: StepHistory) { this.toDelete = h; this.confirmOpen = true; }
    /** Annule la suppression */
  cancelDelete() { this.confirmOpen = false; this.toDelete = undefined; }
   /** Supprime l’item sélectionné et met à jour la liste */
  doDelete() {
    if (!this.toDelete?.id) return;
    this.historyService.delete(this.toDelete.id).subscribe({
      next: () => { this.history = this.history.filter(x => x.id !== this.toDelete!.id); this.cancelDelete(); },
      error: () => alert("Échec de suppression de l'historique.")
    });
  }
}
