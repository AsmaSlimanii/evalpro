// ai-form-designer.component.ts
import { Component } from '@angular/core';
import { AiFormService, FormSchema } from '../../core/services/ai-form.service';

type Msg = { role: 'user' | 'assistant'; text: string };

// Petit helper de typage local pour éviter les erreurs TS sur `value`
type FieldWithValue = FormSchema['fields'][number] & { value?: any };

@Component({
  selector: 'app-ai-form-designer',
  templateUrl: './ai-form-designer.component.html',
  styleUrls: ['./ai-form-designer.component.scss'],
})
export class AiFormDesignerComponent {
  // Saisie gauche
  stepId = 1;
  stepName = 'Pré-identification';
  description = 'Nom du projet, budget, catégorie, description courte';

  // Schéma généré (droite)
  schema?: FormSchema;

  // UI state
  loading = false;
  saving = false;
  error = '';

  // (optionnel) chat
  chatMode = false;
  messages: Msg[] = [];
  chatText = '';
  

  constructor(private ai: AiFormService) {}

  trackByIndex = (i: number) => i;

  /** Normalise le schéma pour garantir la présence de `value` sur chaque field. */
  private normalizeSchema(s: FormSchema): FormSchema {
    const fields: FieldWithValue[] = (s.fields ?? []).map((f) => {
      // Valeur par défaut par type (utile pour les ngModel)
      const defaultValue =
        f.type === 'select' ? null :
        f.type === 'checkbox' ? false :
        '';

      return {
        ...f,
        value: (f as any).value ?? defaultValue,
      };
    });

    return { ...s, fields: fields as any };
  }

  /** Changement d’étape côté gauche : on tente de charger un schéma sauvegardé. */
  onStepChange(val: any) {
    const id = Number(val);
    this.stepId = id;

    // Ne rien faire si l'id est invalide
    if (!Number.isFinite(id) || id <= 0) {
      this.schema = undefined;
      return;
    }

    this.error = '';
    this.ai.get(id).subscribe({
      next: (s) => (this.schema = s ? this.normalizeSchema(s) : undefined),
      error: () => (this.schema = undefined),
    });
  }

  /** Génération depuis l’IA ou le fallback (selon le back). */
  generate() {
    // Sécurité : ne pas appeler avec un step invalide
    if (!Number.isFinite(this.stepId) || this.stepId <= 0) {
      this.error = 'Step ID invalide.';
      return;
    }

    this.error = '';
    this.loading = true;

    this.ai.generate(this.stepId, this.stepName, this.description).subscribe({
      next: (s) => {
        this.schema = this.normalizeSchema(s);
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Erreur génération';
        this.loading = false;
      },
    });
  }

  /** Sauvegarde le schéma (y compris les `value` saisis à droite). */
  save() {
    if (!this.schema) return;
    if (!Number.isFinite(this.stepId) || this.stepId <= 0) {
      this.error = 'Step ID invalide.';
      return;
    }

    this.saving = true;
    this.error = '';

    this.ai.save(this.stepId, this.schema).subscribe({
      next: () => (this.saving = false),
      error: () => {
        this.saving = false;
        this.error = 'Erreur sauvegarde';
      },
    });
  }

  /** (Optionnel) en mode chat, on pourrait réutiliser generate() */
  send() {
    const text = this.chatText?.trim();
    if (!text) return;

    this.messages.push({ role: 'user', text });
    this.chatText = '';
    this.loading = true;

    this.ai.generate(this.stepId, this.stepName, text).subscribe({
      next: (s) => {
        this.schema = this.normalizeSchema(s);
        const count = this.schema.fields?.length ?? 0;
        this.messages.push({
          role: 'assistant',
          text: `Formulaire généré : ${this.schema.title} (${count} champs)`,
        });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ role: 'assistant', text: 'Désolé, échec de génération.' });
        this.loading = false;
      },
    });
  }
}
