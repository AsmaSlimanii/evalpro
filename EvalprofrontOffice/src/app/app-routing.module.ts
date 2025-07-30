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

import { DashboardComponent } from './core/components/dashboard/dashboard.component';
import { HomeAuthenticatedComponent } from './pages/home-authenticated/home-authenticated.component';

// Project Steps
import { CreateProjectComponent } from './features/projects/create-project/create-project.component';
import { PreIdentificationComponent } from './features/projects/create-project/pre-identification/pre-identification.component';
import { CreationProjetComponent } from './features/projects/create-project/creation-projet/creation-projet.component';
import { AutoEvaluationComponent } from './features/projects/create-project/auto-evaluation/auto-evaluation.component';
import { RequeteFinancementComponent } from './features/projects/create-project/requete-financement/requete-financement.component';
import { SchemaFinancementComponent } from './features/projects/create-project/schema-financement/schema-financement.component';

import { ProjectListComponent } from './features/projects/project-list/project-list.component';
import { LayoutComponent } from './layout/layout.component';
import { PilierEconomiqueComponent } from './features/projects/create-project/auto-evaluation/pilier-economique/pilier-economique.component';
import { PilierSocioComponent } from './features/projects/create-project/auto-evaluation/pilier-socio/pilier-socio.component';
import { PilierEnvironnementalComponent } from './features/projects/create-project/auto-evaluation/pilier-environnemental/pilier-environnemental.component';
import { ProfilComponent } from './features/projects/create-project/requete-financement/profil/profil.component';
import { EntrepriseComponent } from './features/projects/create-project/requete-financement/entreprise/entreprise.component';
import { ProjetComponent } from './features/projects/create-project/requete-financement/projet/projet.component';


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
      { path: 'projects/edit/:id/step3/economique', component: PilierEconomiqueComponent },
      { path: 'projects/edit/:id/step3/socio', component: PilierSocioComponent },
      { path: 'projects/edit/:id/step3/environnemental', component: PilierEnvironnementalComponent },

      { path: 'projects/edit/:id/step4', component: RequeteFinancementComponent },
      { path: 'projects/edit/:id/step4/profil', component: ProfilComponent },
      { path: 'projects/edit/:id/step4/entreprise', component: EntrepriseComponent },
      { path: 'projects/edit/:id/step4/projet', component: ProjetComponent },

      { path: 'projects/edit/:id/step5', component: SchemaFinancementComponent },
      { path: 'projects/edit/:id', component: CreateProjectComponent },

      { path: 'projects/list', component: ProjectListComponent }  // ✅ ajout ici
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
export class AppRoutingModule { }
