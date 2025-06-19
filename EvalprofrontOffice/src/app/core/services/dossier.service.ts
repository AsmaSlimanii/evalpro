import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface QuestionOption {
  id: number;
  value: string;
}

interface Question {
  id: number;
  text: string;
  type: 'TEXT' | 'NUMERIQUE' | 'CHOIXMULTIPLE' | 'RADIO' | 'SECTION_TITLE';
  is_required?: boolean;
  options: QuestionOption[];
}

@Injectable({
  providedIn: 'root'
})
export class DossierService {
  private readonly baseUrl = 'http://localhost:8081';
  private readonly formApiUrl = `${this.baseUrl}/api/forms`;
  private readonly responseApiUrl = `${this.baseUrl}/api/responses`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /** 🔍 Charger les questions dynamiques d'une étape */
  getStepForm(step: string): Observable<{ questions: Question[] }> {
    return this.http.get<{ questions: Question[] }>(
      `${this.formApiUrl}/structure/${step}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  /** 💾 Soumettre les réponses d'une étape */
  submitStep(payload: any, stepId: number, dossierId?: number | null): Observable<any> {
    const url = dossierId != null
      ? `${this.responseApiUrl}/step${stepId}/${dossierId}`
      : `${this.responseApiUrl}/step${stepId}/null`;

    return this.http.post(url, payload, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /** ✅ Soumettre tout le dossier */
  submit(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/dossiers/submit`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /** 💾 Sauvegarde partielle du dossier */
  saveDraft(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/dossiers/drafts`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  /** 🔐 Gestion des erreurs */
  private handleError(error: HttpErrorResponse): Observable<never> {
    if ([401, 403].includes(error.status)) {
      this.authService.logout();
    }

    console.error('Erreur API :', error);
    return throwError(() =>
      new Error(error.error?.message || 'Une erreur serveur est survenue.')
    );
  }

  /** 📥 JWT Headers */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    if (!token || typeof token !== 'string') {
      throw new Error('Token JWT manquant ou invalide');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
