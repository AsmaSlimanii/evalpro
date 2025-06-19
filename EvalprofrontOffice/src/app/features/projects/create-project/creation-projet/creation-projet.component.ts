import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormService } from '../../../../core/services/form.service';

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

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router
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

    this.initForm();
    this.loadForm();
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
      responses: this.fb.array([])
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

      this.questions.forEach((q) => {
        if (q.id === 11) {
          q.options.forEach((opt: any) => {
            if ([28, 29, 30].includes(opt.id)) opt.parent_option_id = 25;
            if ([76, 77, 78, 79, 80].includes(opt.id)) opt.parent_option_id = 26;
          });
        }
      });

      this.questions.forEach((q) => {
        if (q.id === 12) {
          q.options.forEach((opt: any) => {
            if ([31, 32, 33, 34, 35, 36, 37, 38, 39].includes(opt.id)) opt.parent_option_id = 28;
            if ([40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55].includes(opt.id)) opt.parent_option_id = 29;
            if ([56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75].includes(opt.id)) opt.parent_option_id = 30;

            if ([81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99].includes(opt.id)) opt.parent_option_id = 76;
            if ([100, 101, 102, 103, 104, 105, 106, 107].includes(opt.id)) opt.parent_option_id = 77;
            if ([108, 109, 110, 111, 112, 113, 114, 115].includes(opt.id)) opt.parent_option_id = 78;
            if ([116, 117, 118, 119, 120, 121, 122, 123, 124].includes(opt.id)) opt.parent_option_id = 79;
            if ([125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135].includes(opt.id)) opt.parent_option_id = 80;
          });
        }
      });





      this.buildFormControlsWithData(form.responses || []);
      const categoryCtrl = this.responses.at(0)?.get('value'); // Question 10
      if (categoryCtrl) {
        this.updateOptionsForQuestion11(categoryCtrl.value);
        categoryCtrl.valueChanges.subscribe((value: any) => {
          this.updateOptionsForQuestion11(Number(value)); // bien forcer en nombre
        });
      }


      this.isLoading = false;

    };

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
  }





  shouldShowQuestion11(): boolean {
    const selected = this.responses.at(0)?.get('value')?.value;
    return selected !== 27 && (selected === 25 || selected === 26);
  }

  shouldShowQuestion12(): boolean {
    const selectedQ11 = this.responses.controls.find(ctrl => ctrl.value.questionId === 11);
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

      const selectedValue = questionResponses.find(r => r.value !== null)?.value || '';

      const group = this.fb.group({
        questionId: [question.id],
        value: [selectedValue, question.isRequired ? Validators.required : null],
        optionIds: this.fb.array(selectedOptionIds.map(id => this.fb.control(id)))

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

      // Pour la question 10 → mise à jour dynamique des options Q11
      if (question.id === 10) {
        // On attend que toutes les questions soient ajoutées (car Q11 est après)
        setTimeout(() => {
          const val = Number(selectedValue);
          this.updateOptionsForQuestion11(val);
        });

        group.get('value')?.valueChanges.subscribe((val: any) => {
          this.updateOptionsForQuestion11(Number(val));
        });
      }

      // Pour la question 11 → mise à jour dynamique des options Q12
      if (question.id === 11) {
        setTimeout(() => {
          const val = Number(selectedValue);
          this.updateOptionsForQuestion12(val);
        });

        group.get('value')?.valueChanges.subscribe((val: any) => {
          this.updateOptionsForQuestion12(Number(val));
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
    this.isSubmitted = true;

    Object.keys(this.fieldStates).forEach(key => {
      this.fieldStates[+key].touched = true;
    });

    if (this.formGroup.invalid || !this.formMetadata) {
      this.scrollToFirstInvalidField();
      return;
    }

    const stepId = 2;

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
        questionId: 15,
        value: this.autresCtrl.value?.trim() || null,
        optionIds: []
      });
    }

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
          state: { fromStep2: true }
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
