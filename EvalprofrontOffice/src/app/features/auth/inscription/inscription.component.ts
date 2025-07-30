import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent {
  form: FormGroup;
  emailExists = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      prenom: ['', Validators.required],
      birthdate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      discovery: [''],
      activation: [''],
      terms: [false, Validators.requiredTrue],
      privacy: [false, Validators.requiredTrue],
      role: ['ADMIN'] // 👈 ajouté ici pour forcer le rôle ADMIN (ou CLIENT)
    }, { validators: this.passwordMatchValidator });
  }

  get f() {
    return this.form.controls;
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.http.post('http://localhost:8080/api/auth/register', this.form.value).subscribe({
        next: () => {
          this.emailExists = false;
          this.successMessage = '✅ Inscription réussie ! Redirection vers la connexion...';
          setTimeout(() => {
            this.router.navigate(['/connexion']);
          }, 2000);
        },
        error: (err) => {
          if (err.status === 409) { // ⚠️ Ton backend doit renvoyer un code 409 si email existe
            this.emailExists = true;
          } else {
            this.emailExists = false;
            console.error(err);
          }
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

}
