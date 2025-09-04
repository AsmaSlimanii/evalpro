import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  menuOpen = false;

  constructor(private router: Router) {}

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  toggleSidebar() { console.log('Sidebar toggled'); }

  // ➜ Déconnexion + nettoyage des infos auth
 logout() { console.log('Déconnexion'); }

  // ➜ Nouveau projet : démarre à l’étape 1 et reset via ?new=1
  startNewProject(): void {
    this.router.navigate(['/projects/create']);
  }

  // ➜ Liste de projets
  goToMyProjects(): void {
    this.router.navigate(['/projects/list']);
  }
}
