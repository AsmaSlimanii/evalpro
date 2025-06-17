import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  menuOpen = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleSidebar() {
    const body = this.document.body;
    if (body.classList.contains('sidebar-collapsed')) {
      this.renderer.removeClass(body, 'sidebar-collapsed');
    } else {
      this.renderer.addClass(body, 'sidebar-collapsed');
    }
    console.log('toggleSidebar called');
  }

  logout() {
    console.log('Déconnexion');
  }
}
