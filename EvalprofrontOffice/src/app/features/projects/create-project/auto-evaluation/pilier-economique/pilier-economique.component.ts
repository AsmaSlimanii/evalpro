import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
  dossierId: string | null = null;
  isEditMode = false;
  fieldStates: { [key: number]: { touched: boolean } } = {};
  currentSection: number = 1; // 🔽 Gérer la section actuelle
  pillarName: string = 'economique'; // à adapter dans chaque composant


  readonly step = 'auto-evaluation';
  readonly pillar = 'ECONOMIQUE';
  formId: any;
  filteredQuestions: any;
  http: any;


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
      if (url.includes('/step3/economique')) {
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

    const onLoad = (form: any) => {
      console.log('📥 Formulaire brut chargé :', form);
      this.formMetadata = form;
      this.formMetadata.responses = form.responses || [];

      // ✅ Ajout TEMPORAIRE de sections pour test
      form.questions.forEach((q: any, i: number) => {
        q.section = i < 2 ? 'Eco 1' : 'Eco 2'; // ⚠️ adapte selon le nombre de questions
      });

      // ✅ Log pour débogage
      console.log('✅ Questions après injection section :', form.questions.map((q: { section: any; }) => q.section));

      // ✅ Charger la première section
      this.goToSection(1);

      this.isLoading = false;
    };

    if (this.isEditMode && this.dossierId) {
      this.formService.getFormWithResponses(this.step, this.dossierId, this.pillar).subscribe({
        next: onLoad,
        error: () => this.isLoading = false
      });
    } else {
      this.formService.getFormByStep(this.step, this.pillar).subscribe({
        next: onLoad,
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
        .flatMap(r => r.optionIds || [])  // 👈 Important : corrige le chargement des choix multiples
        .filter(id => id !== undefined && id !== null);

      const group = this.fb.group({
        questionId: [question.id],
        value: [
          questionResponses.find(r => r.value !== null && r.value !== undefined)?.value || '',
          question.isRequired ? Validators.required : null
        ],
        optionIds: this.fb.array(selectedOptionIds.map(id => this.fb.control(id)))
      });

      this.responses.push(group);
    });
  }


  onFieldBlur(index: number): void {
    this.fieldStates[index].touched = true;
  }

  showError(index: number): boolean {
    const ctrl = this.responses.at(index).get('value');
    return !!(ctrl?.invalid && (this.fieldStates[index].touched || this.isSubmitted));
  }

  onCheckboxToggle(index: number, optionId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const array = this.responses.at(index).get('optionIds') as FormArray;

    if (checkbox.checked) {
      if (!array.value.includes(optionId)) {
        array.push(this.fb.control(optionId));
      }
    } else {
      const idx = array.controls.findIndex(c => c.value === optionId);
      if (idx >= 0) array.removeAt(idx);
    }

    // Optionnel : log pour débogage
    console.log('➡️ Réponse actuelle pour la question', index, ':', array.value);
  }

  isOptionChecked(index: number, optionId: number): boolean {
    const array = this.responses.at(index).get('optionIds') as FormArray;
    return array.value.includes(optionId);
  }

  goBack(): void {
    if (this.dossierId) {
      this.router.navigate([`/projects/edit/${this.dossierId}/step3`]);
    }
  }

  submit(): void {
    this.isSubmitted = true;
    Object.keys(this.fieldStates).forEach(k => this.fieldStates[+k].touched = true);

    if (this.formGroup.invalid || !this.formMetadata) {
      this.scrollToFirstInvalidField();
      return;
    }

    const cleanedResponses = this.responses.controls
      .map((ctrl: any) => ({
        questionId: ctrl.value.questionId,
        value: ctrl.value.value?.toString().trim() || null,
        optionIds: ((ctrl.get('optionIds') as FormArray).value || []).filter((id: any) => id != null)
      }))
      .filter(r =>
        (r.value !== null && r.value !== '') ||
        (Array.isArray(r.optionIds) && r.optionIds.length > 0)
      );
const payload = {
  formId: this.formId,
  dossierId: this.dossierId,
  stepId: 3,
  pillar: 'economique',
  responses: this.responses
};

// this.http.post(`/api/responses/step3/${this.dossierId}`, payload).subscribe(...);




    const dossierId = this.dossierId ? Number(this.dossierId) : null;
    const onSuccess = (res: any) => {
      const newDossierId = res.dossierId || dossierId;
      if (newDossierId) {
        localStorage.setItem('dossierId', String(newDossierId));

        // 🔽 Afficher la prochaine section
        this.currentSection = 2;
      }
    };

    if (this.isEditMode && dossierId) {
      this.formService.submitStep(payload, 3, dossierId).subscribe({ next: onSuccess });
    } else {
      this.formService.submitStep(payload, 3, null).subscribe({ next: onSuccess });
    }
  }
prepareResponses(): any[] {
  return this.filteredQuestions
    .map((q: { id: any; }) => {
      const response: any = {
        questionId: q.id,
        value: this.formGroup.get(`question_${q.id}`)?.value || null,
        optionIds: this.formGroup.get(`option_${q.id}`)?.value || []
      };

      // Supprimer si aucune valeur n'est donnée
      if (!response.value && (!response.optionIds || response.optionIds.length === 0)) {
        return null;
      }

      return response;
    })
    .filter((r: null) => r !== null);
}

  goToSection(section: number): void {
    this.currentSection = section;

    const label = `eco ${section}`;
    console.log('🟡 Toutes les sections disponibles :', this.formMetadata.questions.map((q: any) => q.section));

    // ✅ C'EST ICI : filtrer les questions pour la section demandée
    this.questions = this.formMetadata.questions.filter((q: any) =>
      (q.section || '').toLowerCase().replace(/\s+/g, '') === label.replace(/\s+/g, '')
    );

    console.log('✅ Questions filtrées pour Eco ' + section + ':', this.questions);

    // ✅ Ajouter ce test pour détecter si le tableau est vide
    if (!this.questions || this.questions.length === 0) {
      console.warn('⚠️ Aucune question trouvée pour la section :', label);
    }

    const sectionResponses = this.formMetadata.responses.filter((r: any) =>
      this.questions.some((q: any) => q.id === r.questionId)
    );

    this.buildFormControlsWithData(sectionResponses);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  onPrevious(): void {
    if (this.currentSection === 2) {
      this.goToSection(1); // 🔁 revient à Eco 1
    } else {
      this.goBack(); // ⬅️ comportement existant si on est déjà en Eco 1
    }
  }


  onRadioSelect(index: number, selectedId: number): void {
    const array = this.responses.at(index).get('optionIds') as FormArray;
    while (array.length) array.removeAt(0);
    array.push(this.fb.control(selectedId));

    // ✅ Important : mettre à jour le champ "value" aussi
    const valueControl = this.responses.at(index).get('value');
    if (valueControl) {
      valueControl.setValue(selectedId);
    }
  }



  private scrollToFirstInvalidField(): void {
    setTimeout(() => {
      const el = document.querySelector('.ng-invalid');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}
