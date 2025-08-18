import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormService } from '../../../../core/services/form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Payload } from '../../../../shared/models/creation-projet.dto';

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


  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService  // ⬅️ Ajoute ceci
  ) { }

  ngOnInit(): void {
    this.setupRouteListener(); // <<✅ ajoute cette méthode pour écouter les navigations



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
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      if (url.includes('/projects/edit/') && url.includes('/step1')) {
        console.log('[🔁] Reload triggered for step1');
        this.initForm();
        this.loadForm(); // <<< FORCER CHARGEMENT
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
      this.questions.forEach(q => q.isHidden = false); // initialise tout à visible

      this.buildFormControlsWithData(form.responses || []);
      this.isLoading = false;
      this.formGroup.patchValue({ comment: form.comment || '' });
      // ✅ seulement maintenant : désactiver si admin
      if (this.isAdmin) {
        this.setReadOnlyMode();
      }
    };



    if (this.isEditMode && this.dossierId) {
      this.formService.getFormWithResponses(step, this.dossierId).subscribe({
        next: onFormLoad,
        error: (err: any) => {
          console.error('Erreur chargement formulaire (edit)', err);
          this.isLoading = false;
        }
      });
    } else {
      this.formService.getFormByStep(step).subscribe({
        next: onFormLoad,
        error: (err: any) => {
          console.error('Erreur chargement formulaire (create)', err);
          this.isLoading = false;
        }
      });
    }
  }

  private buildFormControlsWithData(existingResponses: any[]): void {
    while (this.responses.length) this.responses.removeAt(0);

    this.questions.forEach((question, index) => {
      this.fieldStates[index] = { touched: false };

      const questionResponses = existingResponses.filter(r => r.questionId === question.id);

      // Extract selectedValue from responses (assumes 'value' field exists)
      const selectedValue = questionResponses.length > 0 && questionResponses[0].value !== undefined
        ? questionResponses[0].value
        : '';

      const selectedOptionIds = questionResponses
        .filter(r => r.optionId !== undefined && r.optionId !== null)
        .map(r => r.optionId);

      const group = this.fb.group({
        questionId: [question.id],
        value: [{ value: selectedValue, disabled: this.isAdmin }, question.isRequired ? Validators.required : null],
        optionIds: this.fb.array(
          selectedOptionIds.map(id => this.fb.control({ value: id, disabled: this.isAdmin }))
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

  /* ✅ je change cette bloc aussi  */
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
      this.router.navigate([`/projects/edit/${this.dossierId}/step1`]);
    } else {
      this.router.navigate(['/projects/create/step1']);
    }
  }

  submit(): void {
    this.isSubmitted = true;

    // Marquer tous les champs comme touchés
    Object.keys(this.fieldStates).forEach(key => {
      this.fieldStates[+key].touched = true;
    });

    if (this.formGroup.invalid || !this.formMetadata) {
      this.scrollToFirstInvalidField();
      return;
    }


    /* je change cette bloc   */
    const stepId = 1;
    /*👉 Filtrer le payload avant l’envoi pour ne garder que les réponses valides :*/
    /*Cela supprimera automatiquement les réponses vides du tableau.*/
    const cleanedResponses = this.responses.controls
      .map((ctrl: any) => ({
        questionId: ctrl.value.questionId,
        value: ctrl.value.value?.trim() || null,
        optionIds: ((ctrl.get('optionIds') as FormArray).value || []).filter((id: any) => id != null)
      }))
      .filter(r =>
        (r.value !== null && r.value !== '') ||
        (Array.isArray(r.optionIds) && r.optionIds.length > 0)
      );



    console.log('🚀 Payload envoyé:', cleanedResponses);


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
    const onSuccess = (res: any): void => {
      const dossierId = res.dossierId || dossierIdToSend;

      if (dossierId) {
        localStorage.setItem('dossierId', String(dossierId));

        // (optionnel) sécurité: si completedStep est vide, mets-le à 1
        const prev = Number(localStorage.getItem('completedStep') || '0');
        if (prev < 1) localStorage.setItem('completedStep', '1');

        // ✅ ENVOIE le message et la progression à l'écran "Constitution du dossier"
        this.router.navigate([`/projects/edit/${dossierId}`], {
          state: {
            successMessage: 'Étape 1 terminée avec succès !',
            completedStep: 1
          }
        });
      }
    };



    if (this.isEditMode && dossierIdToSend) {
      this.formService.submitStep(payload, stepId, dossierIdToSend).subscribe({
        next: onSuccess,
        error: (err: any) => {
          console.error('Erreur envoi (edit)', err);
        }
      });
    } else {
      this.formService.submitStep(payload, stepId, null).subscribe({
        next: onSuccess,
        error: (err: any) => {
          console.error('Erreur envoi (création)', err);
        }
      });
    }
  }
  onRadioChange(i: number, selectedId: number): void {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;

    // Met à jour la valeur
    while (optionIds.length !== 0) optionIds.removeAt(0);
    optionIds.push(this.fb.control(selectedId));

    // 👉 cacher ou afficher la question 4 selon le choix de la question 3
    const question3Id = 3; // l’ID réel de ta question 3
    const question4Index = this.questions.findIndex(q => q.id === 4); // ID réel de la question à cacher

    if (this.questions[i].id === question3Id && question4Index !== -1) {
      // si option 2 sélectionnée
      const selectedOption = selectedId; // ex: id = 11 par exemple
      if (selectedOption === 2) {
        this.questions[question4Index].isHidden = false;
      } else {
        this.questions[question4Index].isHidden = true;
      }
    }
  }


  isRadioSelected(i: number, optionId: number): boolean {
    const optionIds = this.responses.at(i).get('optionIds') as FormArray;
    return optionIds.value?.[0] === optionId;
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