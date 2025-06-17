import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ConnexionComponent } from './features/auth/connexion/connexion.component';
import { InscriptionComponent } from './features/auth/inscription/inscription.component';
import { DashboardComponent } from './core/components/dashboard/dashboard.component';
import { RecaptchaModule , RecaptchaFormsModule, } from 'ng-recaptcha';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { ResetPasswordConfirmComponent } from './features/auth/reset-password-confirm/reset-password-confirm.component';
import { HomeAuthenticatedComponent } from './pages/home-authenticated/home-authenticated.component';
import { TopbarComponent } from './core/components/topbar/topbar.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { LayoutComponent } from './layout/layout.component';
import { CreateProjectComponent } from './features/projects/create-project/create-project.component';
import {  PreIdentificationComponent } from './features/projects/create-project/pre-identification/pre-identification.component';
import { CreationProjetComponent } from './features/projects/create-project/creation-projet/creation-projet.component';
import { AutoEvaluationComponent } from './features/projects/create-project/auto-evaluation/auto-evaluation.component';
import { RequeteFinancementComponent } from './features/projects/create-project/requete-financement/requete-financement.component';
import { SchemaFinancementComponent } from './features/projects/create-project/schema-financement/schema-financement.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    AppComponent,
    ConnexionComponent,
    InscriptionComponent,
    DashboardComponent,
    ResetPasswordComponent,
    ResetPasswordConfirmComponent,
    HomeAuthenticatedComponent,
    TopbarComponent,      
    SidebarComponent,
    LayoutComponent,
    CreateProjectComponent,
    PreIdentificationComponent,
    CreationProjetComponent,
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
   CommonModule,
    RouterModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    BrowserAnimationsModule,
     MatSnackBarModule,
     
  
        
  ],
   providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent] // ✅ INDISPENSABLE
})
export class AppModule {}