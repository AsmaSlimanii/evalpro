import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormService } from '../../../../core/services/form.service';

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

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router
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

    this.initForm();
    this.loadForm();
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
      responses: this.fb.array([])
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

      const selectedOptionIds = questionResponses
        .filter(r => r.optionId !== undefined && r.optionId !== null)
        .map(r => r.optionId);

      const group = this.fb.group({
        questionId: [question.id],  // ✅ obligatoire pour éviter null côté Java
        value: [
          questionResponses.find(r => r.value !== null)?.value || '',
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


    const payload = {
      formId: this.formMetadata.id,
      stepId: stepId,
      responses: cleanedResponses
    };

    const dossierIdToSend: number | null = this.dossierId ? Number(this.dossierId) : null;
    const onSuccess = (res: any): void => {
      const dossierId = res.dossierId || dossierIdToSend;

      if (dossierId) {
        localStorage.setItem('dossierId', String(dossierId));

        this.router.navigate([`/projects/edit/${dossierId}`], {
          state: { fromPreIdentification: true }
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