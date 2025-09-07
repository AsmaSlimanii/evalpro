// src/app/core/services/ai-form.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  options?: string[];
}

export interface FormSchema {
  title: string;
  fields: FieldDef[];
}

/** Format que ton backend peut renvoyer depuis la table `ai_form` */
interface AiFormRow {
  id?: number;
  stepId: number;
  title?: string;
  schemaJson: string;       // JSON stringifié côté DB
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AiFormService {
  private readonly base = `${environment.apiBaseUrl}/api/ai/forms`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) h = h.set('Authorization', `Bearer ${token}`);
    return h;
  }

  /** Demande de génération IA */
  generate(stepId: number, stepName: string, description: string): Observable<FormSchema> {
    return this.http
      .post<FormSchema | AiFormRow>(
        `${this.base}/generate`,
        { stepId, stepName, description },
        { headers: this.headers() }
      )
      .pipe(map(this.toFormSchema));
  }

  /** Sauvegarde dans la table ai_form (schemaJson stringifié) */
  save(stepId: number, schema: FormSchema): Observable<{ id: number }> {
    const body = {
      stepId,
      title: schema.title,
      schemaJson: JSON.stringify(schema),
    };
    return this.http.post<{ id: number }>(this.base, body, { headers: this.headers() });
  }

  /** Récupération d’un schéma sauvegardé pour un step */
  get(stepId: number): Observable<FormSchema | undefined> {
    return this.http
      .get<FormSchema | AiFormRow | null>(`${this.base}/${stepId}`, { headers: this.headers() })
      .pipe(map(res => (res ? this.toFormSchema(res) : undefined)));
  }

  /** Normalisation: accepte un objet déjà structuré ou un row DB (schemaJson) */
  private toFormSchema = (res: any): FormSchema => {
    // Cas 1: le backend renvoie directement { title, fields }
    if (res && Array.isArray(res.fields)) {
      return { title: res.title ?? 'Formulaire', fields: res.fields as FieldDef[] };
    }

    // Cas 2: le backend renvoie { schemaJson: string }
    if (res && typeof res.schemaJson === 'string') {
      try {
        const parsed = JSON.parse(res.schemaJson);
        const fields = Array.isArray(parsed?.fields) ? parsed.fields : [];
        return { title: parsed?.title ?? res.title ?? 'Formulaire', fields };
      } catch {
        return { title: res.title ?? 'Formulaire', fields: [] };
      }
    }

    // Fallback
    return { title: res?.title ?? 'Formulaire', fields: [] };
  };
}
