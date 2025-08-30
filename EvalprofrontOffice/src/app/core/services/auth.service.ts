import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = 'http://localhost:8080/api'; // adapte si besoin

  constructor(private http: HttpClient) { }


  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUserId(): Observable<number> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<{ id: number }>(`${this.apiUrl}/auth/current-user`, { headers }).pipe(
      map(response => response.id),
      catchError((error) => {
        // ✅ Déconnexion UNIQUEMENT si 401
        if (error?.status === 401) {
          this.logout();
        }
        // ⛔ NE PAS déconnecter sur 403 (forbidden) ou autres
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/connexion'; // ajuste si le path est différent
  }

  getCurrentUserRole(): string | null {
    return localStorage.getItem('role');
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
  }

  getUserEmail(): string | null {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;

      const user = JSON.parse(userData);
      if (typeof user.email === 'string' && user.email.includes('@')) {
        return user.email;
      }

      return null;
    } catch (e) {
      console.error('Erreur de parsing dans getUserEmail:', e);
      return null;
    }
  }


  getRoles(): string[] {
    const t = this.getToken();
    if (!t) return [];
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      // selon ce que tu mets dans le JWT: roles / authorities …
      const raw = payload.roles || payload.authorities || [];
      return raw.map((r: string) => r.startsWith('ROLE_') ? r : `ROLE_${r}`);
    } catch {
      return [];
    }
  }

}
