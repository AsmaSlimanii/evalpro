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

  constructor(private http: HttpClient, private authService: AuthService) {}

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

  return this.http.get(url, {
    headers: this.getAuthHeaders()
  });
}


getFormWithResponses(step: string, dossierId: string | null, pillar?: string): Observable<any> {
  const url = pillar
    ? `${this.formApiUrl}/${step}/dossier/${dossierId}?pillar=${pillar}`
    : `${this.formApiUrl}/${step}/dossier/${dossierId}`;

  return this.http.get(url, {
    headers: this.getAuthHeaders()
  });
}

  submitResponses(payload: any): Observable<any> {
    return this.http.post(`${this.responseApiUrl}`, payload, {
      headers: this.getAuthHeaders()
    });
  }
   getResponses(dossierId: string, stepId: string) {
    return this.http.get<any[]>(`/api/responses/step${stepId}/${dossierId}`);
  }

submitStep(payload: any, stepId: number, dossierId?: number | null): Observable<any> {
  const url = dossierId != null
    ? `${this.responseApiUrl}/step${stepId}/${dossierId}`
    : `${this.responseApiUrl}/step${stepId}`;

  return this.http.post(url, payload, {
    headers: this.getAuthHeaders()  // ✅ Auth headers obligatoires
  });
}
getPillarProgress(dossierId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/api/responses/progress/${dossierId}`, {
    headers: this.getAuthHeaders()
  });
}




}
