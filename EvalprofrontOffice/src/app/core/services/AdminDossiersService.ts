import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DossierStatus } from '../../shared/models/status';

export interface AdminDossierItem {
  id: number;
  titre: string;
  ownerEmail: string;
  submittedAt: string | null;
  status: DossierStatus;
}

@Injectable({ providedIn: 'root' })
export class AdminDossiersService {
  private readonly baseUrl = 'http://localhost:8080';

  private readonly api = `${this.baseUrl}/api/admin/dossiers`; // ✅ Bonne URL


  constructor(private http: HttpClient, private auth: AuthService) { }

  private headers(): HttpHeaders {
    const t = this.auth.getToken();
    if (!t) { throw new Error('JWT manquant'); }
    return new HttpHeaders({ Authorization: `Bearer ${t}` });
  }

  list(
    status: 'SOUMIS' | 'ACCEPTE' | 'REJETE' | 'EN_COURS' = 'SOUMIS',
    page = 0,
    size = 10
  ): Observable<{ items: AdminDossierItem[]; total: number }> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', String(page))
      .set('size', String(size));

    return this.http.get<{ items: AdminDossierItem[]; total: number }>(
      this.api,
      { headers: this.headers(), params }
    );
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/pdf`, {
      headers: this.headers(),
      responseType: 'blob' as const
    });
  }


  updateStatus(id: number, status: 'ACCEPTE' | 'REJETE' | 'EN_COURS', message?: string) {
    return this.http.patch(`${this.api}/${id}/status`, { status, message }, { headers: this.headers() });
  }

}
