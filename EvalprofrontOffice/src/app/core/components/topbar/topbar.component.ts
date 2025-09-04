import { Component, Inject, Renderer2, HostListener, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NotificationDto, NotificationService, NotificationType } from '../../services/notification.service';


@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  menuOpen = false;
  isOpen = false; // dropdown cloche

  // données notifs
  items$!: Observable<NotificationDto[]>;
  unread$!: Observable<number>;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private notif: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    if (saved) this.renderer.addClass(this.document.body, 'sidebar-collapsed');


    this.items$ = this.notif.items$;
    this.unread$ = this.notif.unread$;
    this.notif.load().subscribe(); // charge liste + compteur
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }

  toggleSidebar() {
    const b = this.document.body;
    const has = b.classList.contains('sidebar-collapsed');
    has ? this.renderer.removeClass(b, 'sidebar-collapsed')
      : this.renderer.addClass(b, 'sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', String(!has));
  }

  // ====== cloche ======
  toggleDropdown(evt?: MouseEvent) { if (evt) evt.stopPropagation(); this.isOpen = !this.isOpen; }
  @HostListener('document:click') closeOnOutsideClick() { if (this.isOpen) this.isOpen = false; }

  // Remplace TOUT le corps de cette méthode :
  openNote(n: NotificationDto) {
    if (n && !n.readFlag) this.notif.markRead(n.id).subscribe(); // (optionnel) marque lu
    this.isOpen = false;
    this.router.navigateByUrl('/notifications');                  // 👉 force /notifications
  }


  markAll() { this.notif.markAll().subscribe(); }
  goAll() { this.isOpen = false; this.router.navigateByUrl('/notifications'); }

  trackById(_i: number, n: NotificationDto) { return n.id; }

  // pour tes icônes Font Awesome dans le menu
  faIconOf(t: NotificationType): string {
    switch (t) {
      case 'STEP_COMMENT': return 'fa-comment-dots';
      case 'DOSSIER_ACCEPTED': return 'fa-check-circle';
      case 'DOSSIER_REJECTED': return 'fa-times-circle';
      case 'DOSSIER_NEEDS_CHANGES':
      case 'NEEDS_CHANGES': return 'fa-exclamation-triangle';
      default: return 'fa-bell';
    }
  }

  logout() { console.log('Déconnexion'); }
}
