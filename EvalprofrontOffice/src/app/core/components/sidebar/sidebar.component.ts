import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
isCollapsed = false;
  
toggleSidebar() {
  this.isCollapsed = !this.isCollapsed;
  
  // Optionnel : Sauvegarder l'état dans localStorage
  localStorage.setItem('sidebarCollapsed', String(this.isCollapsed));
}
ngOnInit() {
  // Optionnel : Récupérer l'état au chargement
  const savedState = localStorage.getItem('sidebarCollapsed');
  if (savedState) {
    this.isCollapsed = savedState === 'true';
  }
}
}
