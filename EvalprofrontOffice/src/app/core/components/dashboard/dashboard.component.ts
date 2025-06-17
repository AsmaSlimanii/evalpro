import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  menuOpen: boolean = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleSidebar() {
    console.log('Sidebar toggled');
  }

  logout() {
    console.log('Déconnexion');
    this.router.navigate(['/home']);
  }


 goToStep1(): void {
  this.router.navigate(['/projects/create/step1']);
}
}
