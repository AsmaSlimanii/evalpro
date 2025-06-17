import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../../core/services/form.service'; // ✅ assurez-vous que ce fichier existe

@Component({
  selector: 'app-creation-projet',
  templateUrl: './creation-projet.component.html',
  styleUrls: ['./creation-projet.component.scss'] // ✅ ajouter ce fichier même vide
})
export class CreationProjetComponent implements OnInit {
  form!: FormGroup;
  isSubmitted = false;
  dossierId!: string;
  formMetadata: any;
  existingResponses: any[] = [];
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      '6': ['', Validators.required],
      '7': ['', Validators.required],
      '8': ['', Validators.required],
      '13': ['', Validators.required],
    });
  }

  loadForm(): void {
    this.formService.getFormByStep('2').subscribe((form: any) => {
      this.formMetadata = form;
      this.formService.getResponses(this.dossierId, '2').subscribe((responses: any[]) => {
        this.existingResponses = responses;
        responses.forEach((res: any) => {
          if (res.value !== null) {
            this.form.get(res.question_id.toString())?.setValue(res.value);
          } else if (res.option_id !== null) {
            this.form.get(res.question_id.toString())?.setValue(res.option_id);
          }
        });
        this.isLoading = false;
      });
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.form.invalid) return;

    const payload = Object.entries(this.form.value).map(([questionId, value]) => {
      const question = this.formMetadata.questions.find((q: any) => q.id === +questionId);
      return {
        questionId: +questionId,
        dossierId: +this.dossierId,
        formId: this.formMetadata.id,
        stepId: 2,
        ...(question.type === 'TEXTE' || question.type === 'NUMERIQUE'
          ? { value: value }
          : { optionId: Number(value) }),
      };
    });

 const dto = {
  formId: this.formMetadata.id,
  stepId: 2,
  responses: payload
};

this.formService.submitStep(dto, 2, Number(this.dossierId)).subscribe({
  next: () => {
    this.router.navigate(['/projects/create'], {
      queryParams: { success: 'step2' }
    });
  },
  error: () => {
    alert('Erreur lors de la soumission du formulaire');
  },
});
  }
}
