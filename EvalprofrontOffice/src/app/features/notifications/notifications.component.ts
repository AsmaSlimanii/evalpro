import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import {
  NotificationService,
  NotificationDto,
  NotificationType
} from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  items$!: Observable<NotificationDto[]>;
  unread$!: Observable<number>;
  n: NotificationDto | null = null;

  constructor(
    private notif: NotificationService,
    private http: HttpClient,           // ✅ injecté
    private authService: AuthService,   // ✅ injecté
    private router: Router
  ) {}

  ngOnInit(): void {
    // branche les streams du service
    this.items$ = this.notif.items$;
    this.unread$ = this.notif.unread$;

    // charge la liste + met à jour le compteur
    this.notif.load().subscribe();

    this.http.get<{ id: number }>('http://localhost:8080/api/me').subscribe({
      next: me => this.notif.startRealtime(me.id),
      error: () => {} // fallback REST only
    });
  }

  ngOnDestroy(): void {
    this.notif.stopRealtime();
  }

  refresh(): void {
    this.notif.load().subscribe();
  }

  open(n: NotificationDto): void {
    const go = () => {
      if (!n.link) return;
      if (/^https?:\/\//i.test(n.link)) window.open(n.link, '_blank');
      else this.router.navigateByUrl(n.link!);
    };
    if (!n.readFlag) this.notif.markRead(n.id).subscribe({ next: go, error: go });
    else go();
  }

  markRead(n: NotificationDto): void {
    if (!n.readFlag) this.notif.markRead(n.id).subscribe();
  }

  markAll(): void {
    this.notif.markAll().subscribe();
  }

  trackById(_i: number, n: NotificationDto) { return n.id; }

  iconOf(type: NotificationType): string {
    switch (type) {
      case 'STEP_COMMENT': return 'chat_bubble';
      case 'DOSSIER_ACCEPTED': return 'check_circle';
      case 'DOSSIER_REJECTED': return 'cancel';
      case 'DOSSIER_NEEDS_CHANGES': return 'warning';
      default: return 'notifications';
    }
  }

  readonly STEP_NAMES: Readonly<Record<number, string>> = {
    1: 'Pré-identification',
    2: 'Identification',
    3: 'Auto-évaluation',
    4: 'Évaluation',
    5: 'Validation'
  };

  labelOf(type: NotificationType): string {
    switch (type) {
      case 'DOSSIER_ACCEPTED': return 'Accepté';
      case 'DOSSIER_REJECTED': return 'Refusé';
      case 'DOSSIER_NEEDS_CHANGES': return 'Modifs requises';
      case 'STEP_COMMENT': return 'Commentaire';
      default: return 'Notification';
    }
  }

  // Confirm modals
  confirm = { open: false, item: null as NotificationDto | null };

  openConfirm(n: NotificationDto, ev?: MouseEvent) {
    ev?.stopPropagation();
    this.confirm = { open: true, item: n };
  }

  closeConfirm(ev?: MouseEvent) {
    ev?.stopPropagation();
    this.confirm = { open: false, item: null };
  }

  deleteConfirmed() {
    const n = this.confirm.item;
    if (!n) return;
    this.notif.delete(n.id).subscribe({
      next: () => this.closeConfirm(),
      error: () => this.closeConfirm()
    });
  }

  confirmAll = { open: false };

  openConfirmAll(ev?: MouseEvent) { ev?.stopPropagation(); this.confirmAll.open = true; }
  closeConfirmAll(ev?: MouseEvent) { ev?.stopPropagation(); this.confirmAll.open = false; }

  deleteAllConfirmed() {
    this.notif.deleteAll().subscribe({
      next: () => this.closeConfirmAll(),
      error: () => this.closeConfirmAll()
    });
  }
}
