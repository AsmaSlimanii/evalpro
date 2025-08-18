import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormService } from '../../../../core/services/form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Payload } from '../../../../shared/models/creation-projet.dto';


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

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService  // ⬅️ Ajoute ceci
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


}
