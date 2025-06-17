import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DossierService } from '../../../../core/services/dossier.service';

interface Option { id: number; value: string; }
interface Question {
  id: number;
  text: string;
  type: 'TEXT' | 'NUMERIQUE' | 'CHOIXMULTIPLE' | 'RADIO' | 'SECTION_TITLE';
  is_required?: boolean;
  isSectionTitle?: boolean;
  placeholder?: string;
  options: Option[];
}

@Component({
  selector: 'app-creation-projet',
  templateUrl: './creation-projet.component.html',
  styleUrls: ['./creation-projet.component.scss']
})
export class CreationProjetComponent implements OnInit {
  form!: FormGroup;
  questions: Question[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dossierService: DossierService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dossierService.getStepForm('creation-projet').subscribe({
      next: (response: { questions: Question[] }) => {
        this.questions = response.questions;
        this.buildForm(this.questions);
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement du formulaire', 'Fermer', { duration: 3000 });
      }
    });
  }

  buildForm(questions: Question[]): void {
    const group: { [key: string]: any } = {};
    for (const q of questions) {
      if (q.isSectionTitle) continue;
      
      if (q.type === 'CHOIXMULTIPLE') {
        const multiple: { [key: string]: any } = {};
        q.options.forEach(opt => multiple[opt.value] = [false]);
        group[q.text] = this.fb.group(multiple);
      } else if (q.type === 'RADIO') {
        group[q.text] = ['', q.is_required ? Validators.required : null];
      } else {
        group[q.text] = ['', q.is_required ? Validators.required : null];
      }
    }
    this.form = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.getCurrentUserId().subscribe({
      next: (userId: number) => {
        const answers = this.form.value;
        this.dossierService.saveStep2(userId, answers).subscribe({
          next: () => {
            this.snackBar.open('Projet enregistré avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/projects/create'], { state: { fromStep2: true } });
          },
          error: () => this.snackBar.open("Erreur lors de l'enregistrement", 'Fermer', { duration: 3000 })
        });
      }
    });
  }
}