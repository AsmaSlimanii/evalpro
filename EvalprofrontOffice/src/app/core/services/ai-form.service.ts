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
  value?: string | number | boolean | null;   // 👈 valeur initiale (pré-remplissage)
}

export interface FormSchema {
  title: string;
  fields: FieldDef[];
}

/** Format des données persistées */
interface AiFormRow {
  id?: number;
  stepId: number;
  title?: string;
  schemaJson: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AiFormService {
  private readonly base = `${environment.apiBaseUrl}/api/ai/forms`;

  constructor(private http: HttpClient, private auth: AuthService) { }

  private headers(): HttpHeaders {
    const token = this.auth.getToken?.();
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) h = h.set('Authorization', `Bearer ${token}`);
    return h;
  }

  generate(stepId: number, stepName: string, description: string): Observable<FormSchema> {
    return this.http
      .post<FormSchema | AiFormRow>(
        `${this.base}/generate`,
        { stepId, stepName, description },
        { headers: this.headers() }
      )
      .pipe(map(this.toFormSchema));
  }

  save(stepId: number, schema: FormSchema): Observable<{ id: number }> {
    const body = { stepId, schema };           // ✅ et pas title/schemaJson
    return this.http.post<{ id: number }>(this.base, body, { headers: this.headers() });
  }

  get(stepId: number): Observable<FormSchema | undefined> {
    return this.http
      .get<FormSchema | AiFormRow | null>(`${this.base}/${stepId}`, { headers: this.headers() })
      .pipe(map(res => (res ? this.toFormSchema(res) : undefined)));
  }

  /** Normalisation */
  private toFormSchema = (res: any): FormSchema => {
    if (res && Array.isArray(res.fields)) {
      return { title: res.title ?? 'Formulaire', fields: res.fields as FieldDef[] };
    }
    if (res && typeof res.schemaJson === 'string') {
      try {
        const parsed = JSON.parse(res.schemaJson);
        return {
          title: parsed?.title ?? res.title ?? 'Formulaire',
          fields: Array.isArray(parsed?.fields) ? parsed.fields : []
        };
      } catch {
        return { title: res.title ?? 'Formulaire', fields: [] };
      }
    }
    return { title: res?.title ?? 'Formulaire', fields: [] };
  };
}
