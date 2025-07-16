import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  form: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const payload = { email: this.form.value.email };

      this.http.post('http://localhost:8080/api/auth/reset-password/request', payload, { responseType: 'text' }).subscribe({
        next: (response: string) => {
          this.successMessage = response || 'Un lien de réinitialisation vous a été envoyé.';
          this.errorMessage = '';
        },
        error: (error) => {
          this.successMessage = '';
          this.errorMessage =
            typeof error.error === 'string'
              ? error.error
              : 'Erreur lors de la demande.';
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
