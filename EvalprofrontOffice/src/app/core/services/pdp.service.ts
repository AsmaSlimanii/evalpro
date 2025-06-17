// src/app/core/services/pdp.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PdpService {
  private apiUrl = 'http://localhost:8080/api/dossiers'; // 🔁 à adapter à ton backend

  constructor(private http: HttpClient) {}

  submitDossier(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
