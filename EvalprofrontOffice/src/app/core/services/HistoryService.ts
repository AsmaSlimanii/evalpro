// src/app/core/services/history.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StepHistory {
  id: number;
  action:
    | 'COMMENT_ADDED' | 'COMMENT_UPDATED'
    | 'FORM_SUBMITTED' | 'STEP_SAVED'
    | 'STATUS_CHANGED' | 'FILE_UPLOADED'
    | 'ANSWER_UPDATED';
  description: string;
  createdAt: string;
  actor?: { id: number; displayName?: string; email?: string; role?: string }; // <-- displayName
  step?: { id: number; name?: string };
}


@Injectable({ providedIn: 'root' })
export class HistoryService {

  private readonly baseUrl = 'http://localhost:8080/api/history';
  constructor(private http: HttpClient) {}

  byDossier(dossierId: number): Observable<StepHistory[]> {
    return this.http.get<StepHistory[]>(`${this.baseUrl}/dossier/${dossierId}`);
  }

  byDossierAndStep(dossierId: number, stepId: number): Observable<StepHistory[]> {
    return this.http.get<StepHistory[]>(`${this.baseUrl}/dossier/${dossierId}/step/${stepId}`);
  }
  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
