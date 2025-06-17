import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'; // ✅ Important : manquant dans ton code initial

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications = new BehaviorSubject<string[]>([]);
  public notifications$ = this._notifications.asObservable();

  add(message: string): void {
    this._notifications.next([...this._notifications.value, message]);
  }

  clear(): void {
    this._notifications.next([]);
  }
}
