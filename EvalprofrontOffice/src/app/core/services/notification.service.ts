// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

export type NotificationType =
  | 'STEP_COMMENT'
  | 'DOSSIER_ACCEPTED'
  | 'DOSSIER_REJECTED'
  | 'DOSSIER_NEEDS_CHANGES'
  | 'NEEDS_CHANGES';

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  createdAt: string;
  readFlag: boolean;
  dossierId?: number | null;
  stepId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = 'http://localhost:8080';
  private readonly apiUrl = `${this.baseUrl}/api/notifications`;

  private _items = new BehaviorSubject<NotificationDto[]>([]);
  readonly items$ = this._items.asObservable();

  private _unread = new BehaviorSubject<number>(0);
  readonly unread$ = this._unread.asObservable();

  private _localMessages = new BehaviorSubject<string[]>([]);
  readonly localMessages$ = this._localMessages.asObservable();

  private client?: Client;
  private sub?: StompSubscription;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ================== Public API ==================

  load(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(list =>
        [...(list || [])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      ),
      tap(list => this._items.next(list)),
      tap(() => this.refreshUnread().subscribe()),
      catchError(err => this.handleLoadError(err))
    );
  }

  refreshUnread(): Observable<number> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(r => r?.count ?? 0),
      tap(c => this._unread.next(c)),
      catchError(err => this.handleUnreadError(err))
    );
  }

  markRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/read`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        const list = this._items.value.map(n => n.id === id ? { ...n, readFlag: true } : n);
        this._items.next(list);
        this._unread.next(Math.max(0, this._unread.value - 1));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  markAll(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        const list = this._items.value.map(n => ({ ...n, readFlag: true }));
        this._items.next(list);
        this._unread.next(0);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  addLocal(message: string): void {
    this._localMessages.next([...this._localMessages.value, message]);
  }
  clearLocal(): void {
    this._localMessages.next([]);
  }

  openAndRead(n: NotificationDto, routerNavigate: (url: string) => void): void {
    if (n.link) routerNavigate(n.link);
    if (!n.readFlag) this.markRead(n.id).subscribe();
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        // ✅ calculer wasUnread AVANT de mettre à jour la liste
        const before = this._items.value;
        const wasUnread = before.find(x => x.id === id)?.readFlag === false;
        const next = before.filter(x => x.id !== id);
        this._items.next(next);
        if (wasUnread) this._unread.next(Math.max(0, this._unread.value - 1));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  deleteAll(): Observable<void> {
    return this.http.delete<void>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      tap(() => { this._items.next([]); this._unread.next(0); }),
      catchError(this.handleError.bind(this))
    );
  }

  // ================== Realtime (STOMP) ==================

  startRealtime(userId: number, token?: string) {
    if (this.client?.active) return;

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: () => {}
    });

    this.client.onConnect = () => {
      this.sub = this.client!.subscribe(`/topic/notifications.${userId}`, (msg: IMessage) => {
        const n = JSON.parse(msg.body) as NotificationDto;

        // ✅ anti-doublon + insertion en tête
        const exists = this._items.value.some(x => x.id === n.id);
        const next = exists
          ? this._items.value.map(x => (x.id === n.id ? n : x))
          : [n, ...this._items.value];
        this._items.next(next);

        if (!n.readFlag) this._unread.next(this._unread.value + 1);
      });
    };

    this.client.onStompError = () => { /* fallback REST */ };
    this.client.activate();
  }

  stopRealtime() {
    this.sub?.unsubscribe();
    this.sub = undefined;
    // deactivate() est async ; on ne bloque pas l’app ici
    this.client?.deactivate();
    this.client = undefined;
  }

  // ================== Helpers ==================

  private handleLoadError(error: HttpErrorResponse): Observable<NotificationDto[]> {
    console.error('[notifications] load error', error);
    this._items.next([]);
    this._unread.next(0);
    return of([]);
  }

  private handleUnreadError(error: HttpErrorResponse): Observable<number> {
    console.error('[notifications] unread error', error);
    this._unread.next(0);
    return of(0);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) this.authService.logout();
    console.error('Erreur API Notifications :', error);
    return throwError(() => new Error(error.error?.message || 'Une erreur serveur est survenue.'));
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token || typeof token !== 'string') {
      throw new Error('Token JWT manquant ou invalide');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
