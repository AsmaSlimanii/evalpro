import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
//import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent {
 // siteKey: string = environment.recaptcha.siteKey;
  form: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
   //   recaptcha: ['', Validators.required],
      remember: [false]
    });
  }

  get f() {
    return this.form.controls;
  }

 // onCaptchaResolved(token: string | null): void {
 // this.form.patchValue({
  //  recaptcha: token || ''
 // });
//}
  onSubmit(): void {
    if (this.form.valid) {
      const payload = this.form.value;
       console.log('Payload envoyé au backend :', payload); // 👈 AJOUTE ÇA

      this.http.post('http://localhost:8080/api/auth/login', payload).subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);
        //  localStorage.setItem('userName', response.userName); 
           localStorage.setItem('user', JSON.stringify({ email: response.email })); // 👈 Correction ici
           localStorage.setItem('role', response.role); // ✅ AJOUT ICI
          this.router.navigate(['/home-authenticated']);
        },
        error: (err) => {
          this.errorMessage = 'Email ou mot de passe incorrect.';
          console.error('Erreur backend :', err);
        }
      });
    } else {
      this.form.markAllAsTouched();
      console.warn('Formulaire invalide', this.form.value);
    }
  }
}
