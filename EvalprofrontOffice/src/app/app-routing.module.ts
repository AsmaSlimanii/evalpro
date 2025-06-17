// Correction finale : routing + création + édition fonctionnelles

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Auth
import { ConnexionComponent } from './features/auth/connexion/connexion.component';
import { InscriptionComponent } from './features/auth/inscription/inscription.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { ResetPasswordConfirmComponent } from './features/auth/reset-password-confirm/reset-password-confirm.component';

// Public
import { HomeComponent } from './features/public/home/home.component';

// Layout & Dashboard
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './core/components/dashboard/dashboard.component';
import { HomeAuthenticatedComponent } from './pages/home-authenticated/home-authenticated.component';

// Project Steps
import { CreateProjectComponent } from './features/projects/create-project/create-project.component';
import { PreIdentificationComponent } from './features/projects/create-project/pre-identification/pre-identification.component';
import { CreationProjetComponent } from './features/projects/create-project/creation-projet/creation-projet.component';
import { AutoEvaluationComponent } from './features/projects/create-project/auto-evaluation/auto-evaluation.component';
import { RequeteFinancementComponent } from './features/projects/create-project/requete-financement/requete-financement.component';
import { SchemaFinancementComponent } from './features/projects/create-project/schema-financement/schema-financement.component';

const routes: Routes = [
  // Public
  { path: '', component: HomeComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'mot-de-passe-oublie', component: ResetPasswordComponent },
  { path: 'nouveau-mot-de-passe', component: ResetPasswordConfirmComponent },
  { path: 'home-authenticated', component: HomeAuthenticatedComponent },

  // Authenticated Layout
  {
  path: '',
  component: LayoutComponent,
  children: [
    { path: 'dashboard', component: DashboardComponent },

    { path: 'projects/create/step1', component: PreIdentificationComponent },
    { path: 'projects/create', component: CreateProjectComponent },

    // ✅ Routes plates pour modification
    { path: 'projects/edit/:id/step1', component: PreIdentificationComponent },
    { path: 'projects/edit/:id/step2', component: CreationProjetComponent },
    { path: 'projects/edit/:id/step3', component: AutoEvaluationComponent },
    { path: 'projects/edit/:id/step4', component: RequeteFinancementComponent },
    { path: 'projects/edit/:id/step5', component: SchemaFinancementComponent },
     { path: 'projects/edit/:id', component: CreateProjectComponent  }, 
  ]
}
,

  // fallback
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload'   // ✅ <-- obligatoire pour recharger la même URL
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
