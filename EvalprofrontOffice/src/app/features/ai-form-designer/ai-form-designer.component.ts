import { Component } from '@angular/core';
import { AiFormService, FormSchema } from '../../core/services/ai-form.service';



type Msg = { role:'user'|'assistant', text:string };

@Component({
  selector: 'app-ai-form-designer',
  templateUrl: './ai-form-designer.component.html',
  styleUrls: ['./ai-form-designer.component.scss']
})
export class AiFormDesignerComponent {
  stepId = 1;
  stepName = 'Pré-identification';
  description = 'Nom du projet, budget, catégorie, description courte';
  schema?: FormSchema;

  loading = false;
  saving  = false;
  error   = '';

  // chat (optionnel)
  chatMode = false;
  messages: Msg[] = [];
  chatText = '';

  constructor(private ai: AiFormService) {}

  generate() {
    this.error = ''; this.loading = true;
    this.ai.generate(this.stepId, this.stepName, this.description).subscribe({
      next: s => { this.schema = s; this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Erreur génération'; this.loading = false; }
    });
  }

  save() {
    if (!this.schema) return;
    this.saving = true;
    this.ai.save(this.stepId, this.schema).subscribe({
      next: () => this.saving = false,
      error: () => { this.saving = false; this.error = 'Erreur sauvegarde'; }
    });
  }

  // chat -> on réutilise generate, mais on alimente un fil
  send() {
    const text = this.chatText.trim();
    if (!text) return;
    this.messages.push({ role:'user', text });
    this.chatText = '';
    this.loading = true;

    // on considère le dernier message comme "description"
    this.ai.generate(this.stepId, this.stepName, text).subscribe({
      next: (s: { title: any; fields: string | any[]; }) => {
        // Ensure fields is always an array
        const schema: FormSchema = {
          ...s,
          fields: Array.isArray(s.fields) ? s.fields : []
        };
        this.schema = schema;
        this.messages.push({ role:'assistant', text: `Formulaire généré : ${s.title} (${schema.fields.length} champs)` });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ role:'assistant', text: 'Désolé, échec de génération.' });
        this.loading = false;
      }
    });
  }
}
