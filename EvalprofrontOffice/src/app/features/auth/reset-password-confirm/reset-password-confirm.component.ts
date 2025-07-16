import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar'; // ou utilisez un autre toast si tu n’as pas Angular Material


@Component({
  selector: 'app-reset-password-confirm',
  templateUrl: './reset-password-confirm.component.html',
  styleUrls: ['./reset-password-confirm.component.scss']
})
export class ResetPasswordConfirmComponent implements OnInit {
  form: FormGroup;
  token: string = '';
  errorMessage = '';
 successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
     private snackBar: MatSnackBar // ou autre système de notification
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator.bind(this) });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      alert('Lien invalide ou expiré.');
      this.router.navigate(['/mot-de-passe-oublie']);
    }
  }

  get f() {
    return this.form.controls;
  }

  passwordsMatchValidator(group: FormGroup): any {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

 onSubmit() {
  if (this.form.valid) {
    const data = {
      token: this.token,
      newPassword: this.form.value.password
    };

    this.http.post('http://localhost:8080/api/auth/reset-password/confirm', data, { responseType: 'text' }).subscribe({
  next: (response) => {
    this.successMessage = response; // ça contiendra "Mot de passe modifié avec succès."
    this.errorMessage = '';

    setTimeout(() => {
      this.router.navigate(['/connexion']);
    }, 3000);
  },
  error: (error) => {
    this.successMessage = '';
    this.errorMessage = error.error || '❌ Erreur lors de la réinitialisation.';
  }
});

  } else {
    this.form.markAllAsTouched();
  }
}

}
