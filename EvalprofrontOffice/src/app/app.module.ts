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
//import { RecaptchaModule, RecaptchaFormsModule, } from 'ng-recaptcha';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { ResetPasswordConfirmComponent } from './features/auth/reset-password-confirm/reset-password-confirm.component';
import { HomeAuthenticatedComponent } from './pages/home-authenticated/home-authenticated.component';
import { TopbarComponent } from './core/components/topbar/topbar.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';

import { CreateProjectComponent } from './features/projects/create-project/create-project.component';
import { PreIdentificationComponent } from './features/projects/create-project/pre-identification/pre-identification.component';
import { CreationProjetComponent } from './features/projects/create-project/creation-projet/creation-projet.component';
import { AutoEvaluationComponent } from './features/projects/create-project/auto-evaluation/auto-evaluation.component';
import { RequeteFinancementComponent } from './features/projects/create-project/requete-financement/requete-financement.component';
import { SchemaFinancementComponent } from './features/projects/create-project/schema-financement/schema-financement.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ProjectListComponent } from './features/projects/project-list/project-list.component';
import { TimeAgoPipe } from './shared/pipes/time-ago.pipe';
import { LayoutComponent } from './layout/layout.component';
import { PilierEconomiqueComponent } from './features/projects/create-project/auto-evaluation/pilier-economique/pilier-economique.component';
import { PilierSocioComponent } from './features/projects/create-project/auto-evaluation/pilier-socio/pilier-socio.component';
import { PilierEnvironnementalComponent } from './features/projects/create-project/auto-evaluation/pilier-environnemental/pilier-environnemental.component';
import { ProfilComponent } from './features/projects/create-project/requete-financement/profil/profil.component';
import { EntrepriseComponent } from './features/projects/create-project/requete-financement/entreprise/entreprise.component';
import { ProjetComponent } from './features/projects/create-project/requete-financement/projet/projet.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { AdminDossiersComponent } from './features/AdminDossiersComponent/AdminDossiersComponent';




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
    AutoEvaluationComponent,
    PilierEconomiqueComponent,
    PilierSocioComponent,
    PilierEnvironnementalComponent,
    RequeteFinancementComponent,
    ProfilComponent,
    ProjetComponent,
    SchemaFinancementComponent,
    ProjectListComponent,
    EntrepriseComponent,
    TimeAgoPipe,
    NotificationsComponent,
    AdminDossiersComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    // RecaptchaModule,
    //RecaptchaFormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
 
    ReactiveFormsModule,



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
export class AppModule { }