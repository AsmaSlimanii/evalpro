import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  NotificationService,
  NotificationDto,
  NotificationType
} from '../../core/services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  items$!: Observable<NotificationDto[]>;
  unread$!: Observable<number>;

  constructor(private notif: NotificationService, private router: Router) {}

  ngOnInit(): void {
    // branche les streams du service (évite les field initializers)
    this.items$ = this.notif.items$;
    this.unread$ = this.notif.unread$;

    // charge la liste + met à jour le compteur
    this.notif.load().subscribe();
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
}
