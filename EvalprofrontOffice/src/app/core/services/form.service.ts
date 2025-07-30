import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FormService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly formApiUrl = `${this.baseUrl}/api/forms`;
  private readonly responseApiUrl = `${this.baseUrl}/api/responses`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getFormByStep(stepName: string, pillar?: string): Observable<any> {
    const url = pillar
      ? `${this.formApiUrl}/step?step=${stepName}&pillar=${pillar}`
      : `${this.formApiUrl}/by-step/${stepName}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  getFormWithResponses(step: string, dossierId: string | null, pillar?: string): Observable<any> {
    const url = pillar
      ? `${this.formApiUrl}/${step}/dossier/${dossierId}?pillar=${pillar}`
      : `${this.formApiUrl}/${step}/dossier/${dossierId}`;
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  submitResponses(payload: any): Observable<any> {
    return this.http.post(`${this.responseApiUrl}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  getResponses(dossierId: string, stepId: string) {
    return this.http.get<any[]>(
      `${this.responseApiUrl}/step${stepId}/${dossierId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  submitStep(payload: any, stepId: number, dossierId?: number | null): Observable<any> {
    const url = dossierId != null
      ? `${this.responseApiUrl}/step${stepId}/${dossierId}`
      : `${this.responseApiUrl}/step${stepId}`;
    return this.http.post(url, payload, { headers: this.getAuthHeaders() });
  }

  // getPillarProgress(dossierId: number): Observable<any> {
  // return this.http.get(`${this.responseApiUrl}/step3-pillar-progress/${dossierId}`, {
  //    headers: this.getAuthHeaders()
  //  });
  //}


  // getProgress(stepId: number, dossierId: string, pillar: string): Observable<number> {
  //  return this.http.get<number>(
  //  `${this.responseApiUrl}/progress/${stepId}/${dossierId}?pillar=${pillar}`,
  //   { headers: this.getAuthHeaders() }
  // );
  // }
  getStep3PillarProgress(dossierId: number): Observable<{ [key: string]: number }> {
    // ✅ URL correcte vers FormController
    return this.http.get<{ [key: string]: number }>(
      `${this.formApiUrl}/step3-pillar-progress/${dossierId}`,
      { headers: this.getAuthHeaders() }
    );

  }


  getPillarScores(dossierId: number): Observable<any> {
    return this.http.get(`${this.responseApiUrl}/step3-score/${dossierId}`, {
      headers: this.getAuthHeaders()
    });
  }


  uploadFile(formData: FormData): Observable<{ url: string }> {
    const uploadUrl = `${this.responseApiUrl}/upload`;
    return this.http.post<{ url: string }>(uploadUrl, formData);
  }
}
