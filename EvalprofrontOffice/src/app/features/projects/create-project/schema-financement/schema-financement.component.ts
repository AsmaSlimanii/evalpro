// schema-financement.component.ts
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIfContext } from '@angular/common';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FormService } from '../../../../core/services/form.service';
import { AuthService } from '../../../../core/services/auth.service';

type Cat = 'immobilier' | 'mobilier' | 'services' | 'fonds';
type SubImm = 'construction' | 'amenagement' | 'genieCivil';
type SubMob = 'roulant' | 'equipement' | 'cheptel' | 'vegetal';

interface Line { label: string; amount: number; file?: string | null; }
interface FundsWorking { monthly: number; months: number; note: string; }

@Component({
  selector: 'app-schema-financement',
  templateUrl: './schema-financement.component.html',
  styleUrls: ['./schema-financement.component.scss']
})
export class SchemaFinancementComponent implements OnInit {

  // === Reactive form (structure identique step3)
  formGroup!: FormGroup;
  formMetadata: any;
  formId: number | null = null;
  isSaving = false;
  // UI
  isLoading = true;
  isSubmitted = false;
  activeTab: 'needs' | 'funding' = 'needs';
  cat: Cat = 'immobilier';
  credOrApport: 'credits' | 'apports' = 'credits';

  // routing
  dossierId: string | null = null;
  isEditMode = false;
  projectName = '';
  isAdmin = false;

  readonly stepKey = 'schema-financement';
  readonly stepId = 5;

  private readonly EVALPRO_MAX = 70000; // plafond contribution EVALPRO
  //fundingRight: TemplateRef<NgIfContext<boolean>> | null | undefined;

  // 🔢 % jauge (0 → 100)
  get adaptPct(): number {
    const adapt = Number(this.totals?.adapt || 0);
    return Math.max(0, Math.min(100, Math.round((adapt / this.EVALPRO_MAX) * 100)));
  }
  // 🧭 angle aiguille (-90° → +90°)
  get gaugeAngle(): number {
    return -90 + (this.adaptPct / 100) * 180;
  }

  // === IDs des questions
  readonly Q = {
    immo: {
      construction: { label: 93, amount: 94, file: 95 },
      amenagement: { label: 96, amount: 97, file: 98 },
      genieCivil: { label: 99, amount: 100, file: 101 }
    },
    mob: {
      roulant: { label: 102, amount: 103, file: 104 },
      equipement: { label: 105, amount: 106, file: 107 },
      cheptel: { label: 108, amount: 109, file: 110 },
      vegetal: { label: 111, amount: 112, file: 113 }
    },
    services: {
      constitutionSociete: { amount: 114, file: 115 },
      obtentionCredit: { amount: 116, file: 117 },
      etude: { amount: 118, file: 119 },
      marketing: { amount: 120, file: 121 },
      expertise: { amount: 122, file: 123 },
      assistanceTech: { amount: 124, file: 125 },
      assurance: { amount: 126, file: 127 },
      formalisationEmploi: { amount: 128, file: 129 },
      miseNiveauRegl: { amount: 130, file: 131 },
      autres: { amount: 132, file: 133 }
    },
    fonds: { monthly: 136, months: 137, note: 138 },
    credits: { label: 143, amount: 144, file: 145 },
    apports: { label: 147, amount: 148, file: 149 }
  } as const;

  // === état UI
  immo: Record<SubImm, Line[]> = { construction: [], amenagement: [], genieCivil: [] };
  mob: Record<SubMob, Line[]> = { roulant: [], equipement: [], cheptel: [], vegetal: [] };
  serv: {
    constitutionSociete: Line[]; obtentionCredit: Line[]; etude: Line[]; marketing: Line[];
    expertise: Line[]; assistanceTech: Line[]; assurance: Line[]; formalisationEmploi: Line[];
    miseNiveauRegl: Line[]; autres: Line[];
  } = {
      constitutionSociete: [], obtentionCredit: [], etude: [], marketing: [],
      expertise: [], assistanceTech: [], assurance: [], formalisationEmploi: [],
      miseNiveauRegl: [], autres: []
    };
  fonds: FundsWorking = { monthly: 0, months: 0, note: '' };

  credits: Line[] = [];
  apports: Line[] = [];
  ownFunds = 0;

  totals = {
    immo: 0, mob: 0, serv: 0, fonds: 0,
    invest: 0,
    credits: 0, apports: 0, funding: 0, diff: 0,
    adapt: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,
    private fb: FormBuilder,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.paramMap.get('id') || localStorage.getItem('dossierId');
    this.isEditMode = !!this.dossierId;
    this.isAdmin = this.auth.isAdmin();

    this.initForm();
    this.loadForm();
  }

  private initForm(): void {
    this.formGroup = this.fb.group({
      responses: this.fb.array([]),
      comment: ['']
    });
  }
  get responses(): FormArray { return this.formGroup.get('responses') as FormArray; }

  private setReadOnlyMode(): void {
    // Vue en ngModel : rien à désactiver ici sauf commentaire (réservé admin)
    this.formGroup.get('comment')?.enable({ emitEvent: false });
  }

  private loadForm(): void {
    this.isLoading = true;

    const dossierIdNum = Number(this.dossierId);
    if (!dossierIdNum) {
      this.isLoading = false;
      return;
    }

    this.formService.getFormWithResponses(this.stepKey, String(dossierIdNum)).subscribe({
      next: (form) => {
        this.formMetadata = form;
        this.projectName = form?.projectName || '';
        this.formId = form?.id ?? form?.formId ?? null;

        this.buildFormControlsWithData(form?.responses || []);
        this.formGroup.patchValue({ comment: form?.comment || '' });

        if (this.isAdmin) this.setReadOnlyMode();
        this.isLoading = false;
        this.recompute();
      },
      error: _ => this.isLoading = false
    });
  }

  // ---------- Helpers communs (utilisés par saveAndNext ET submit)
  private push(qid: number | undefined, v: any, bag: any[]) {
    if (!qid) return;
    const s = String(v ?? '').trim();
    if (s !== '') bag.push({ questionId: qid, value: s, optionIds: [] });
  }

  private addLines(
    cfg: { label?: number; amount: number; file?: number; },
    rows: { label?: string; amount?: number; file?: string | null }[],
    acc: any[]
  ) {
    rows.forEach(l => {
      if (cfg.label && l.label && l.label.trim()) this.push(cfg.label, l.label, acc);
      if (l.amount !== null && l.amount !== undefined && !isNaN(+l.amount))
        this.push(cfg.amount, +l.amount, acc);
      if (cfg.file && l.file) this.push(cfg.file, l.file, acc);
    });
  }

  private nextCatOf(c: Cat): Cat | null {
    return c === 'immobilier' ? 'mobilier'
      : c === 'mobilier' ? 'services'
        : c === 'services' ? 'fonds'
          : null;
  }

  // ---------- Sauvegarde pilier + aller au suivant
  saveAndNext(pillar: 'IMMOBILIER' | 'MOBILIER' | 'SERVICES' | 'FONDS'): void {
    if (this.isAdmin) return; // lecture seule
    const cleaned: any[] = [];

    if (pillar === 'IMMOBILIER') {
      this.addLines(this.Q.immo.construction, this.immo.construction, cleaned);
      this.addLines(this.Q.immo.amenagement, this.immo.amenagement, cleaned);
      this.addLines(this.Q.immo.genieCivil, this.immo.genieCivil, cleaned);
    }
    if (pillar === 'MOBILIER') {
      this.addLines(this.Q.mob.roulant, this.mob.roulant, cleaned);
      this.addLines(this.Q.mob.equipement, this.mob.equipement, cleaned);
      this.addLines(this.Q.mob.cheptel, this.mob.cheptel, cleaned);
      this.addLines(this.Q.mob.vegetal, this.mob.vegetal, cleaned);
    }
    if (pillar === 'SERVICES') {
      (Object.keys(this.serv) as (keyof typeof this.serv)[])
        .forEach(k => this.addLines((this.Q.services as any)[k], this.serv[k], cleaned));
    }
    if (pillar === 'FONDS') {
      this.push(this.Q.fonds.monthly, this.fonds.monthly, cleaned);
      this.push(this.Q.fonds.months, this.fonds.months, cleaned);
      this.push(this.Q.fonds.note, this.fonds.note, cleaned);
    }

    const dossierIdToSend = this.dossierId ? Number(this.dossierId) : null;
    const formIdToSend = this.formId ?? this.stepId;

    const payload: any = {
      formId: formIdToSend,
      stepId: this.stepId,
      dossierId: dossierIdToSend,
      pillar: pillar,         // ⬅️ le backend n’écrase que ce pilier
      responses: cleaned
    };

    const onSuccess = () => {
      const next = this.nextCatOf(this.cat);
      if (next) {
        this.cat = next;            // rester dans "Besoins", passer au sous-onglet suivant
        this.activeTab = 'needs';
      } else {
        this.activeTab = 'funding'; // après Fonds → Financement
      }
    };

    if (this.isEditMode && dossierIdToSend) {
      this.formService.submitStep(payload, this.stepId, dossierIdToSend)
        .subscribe({ next: onSuccess, error: err => console.error('[Step5] saveAndNext error (edit):', err) });
    } else {
      this.formService.submitStep(payload, this.stepId, null)
        .subscribe({ next: onSuccess, error: err => console.error('[Step5] saveAndNext error (create):', err) });
    }
  }

  private buildFormControlsWithData(resps: any[]): void {
    while (this.responses.length) this.responses.removeAt(0);

    const qidOf = (r: any) => r.questionId ?? r.question_id ?? r.question?.id;
    const pickAll = (qid: number): string[] =>
      (resps || []).filter(r => qidOf(r) === qid && r.value !== undefined && r.value !== null)
        .map(r => String(r.value));

    const inflate = (cfg: { label?: number; amount: number; file?: number; }): Line[] => {
      const labels = cfg.label ? pickAll(cfg.label) : [];
      const amounts = pickAll(cfg.amount);
      const files = cfg.file ? pickAll(cfg.file) : [];
      const max = Math.max(labels.length, amounts.length, files.length);
      const out: Line[] = [];
      for (let i = 0; i < max; i++) {
        out.push({
          label: (labels[i] ?? '').trim(),
          amount: Number(amounts[i] ?? 0) || 0,
          file: (files[i] ?? null)
        });
      }
      return out;
    };

    // Immo
    this.immo.construction = inflate(this.Q.immo.construction);
    this.immo.amenagement = inflate(this.Q.immo.amenagement);
    this.immo.genieCivil = inflate(this.Q.immo.genieCivil);

    // Mobilier
    this.mob.roulant = inflate(this.Q.mob.roulant);
    this.mob.equipement = inflate(this.Q.mob.equipement);
    this.mob.cheptel = inflate(this.Q.mob.cheptel);
    this.mob.vegetal = inflate(this.Q.mob.vegetal);

    // Services
    (Object.keys(this.serv) as (keyof SchemaFinancementComponent['serv'])[])
      .forEach(k => this.serv[k] = inflate((this.Q.services as any)[k]));

    // Fonds
    this.fonds.monthly = Number(pickAll(this.Q.fonds.monthly)[0] ?? 0) || 0;
    this.fonds.months = Number(pickAll(this.Q.fonds.months)[0] ?? 0) || 0;
    this.fonds.note = (pickAll(this.Q.fonds.note)[0] ?? '').trim();

    // Financement
    this.credits = inflate(this.Q.credits);
    this.apports = inflate(this.Q.apports);

    const one = (a: Line[]) => {
      if (!a.length && !this.isAdmin) {
        a.push({ label: '', amount: 0, file: null });
      }
    };

    one(this.immo.construction); one(this.immo.amenagement); one(this.immo.genieCivil);
    one(this.mob.roulant); one(this.mob.equipement); one(this.mob.cheptel); one(this.mob.vegetal);
    Object.values(this.serv).forEach(one);
    one(this.credits); one(this.apports);
  }

  // ===== helpers d'affichage
  percentFunding(part: number): number {
    const total = (this.totals.credits + this.totals.apports) || 1;
    return Math.round((part / total) * 100);
  }
  // somme robuste
  private sum(arr: Line[]) {
    return arr.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  }

  recompute(): void {
    const tImmo = this.sum(this.immo.construction) + this.sum(this.immo.amenagement) + this.sum(this.immo.genieCivil);
    const tMob = this.sum(this.mob.roulant) + this.sum(this.mob.equipement) + this.sum(this.mob.cheptel) + this.sum(this.mob.vegetal);
    const tServ = (Object.values(this.serv)).reduce((s, lst) => s + this.sum(lst), 0);
    const tFds = (this.fonds.monthly || 0) * (this.fonds.months || 0);

    const tCredits = this.sum(this.credits);
    const tApports = this.sum(this.apports) + (this.ownFunds || 0);

    this.totals.immo = tImmo; this.totals.mob = tMob; this.totals.serv = tServ; this.totals.fonds = tFds;
    this.totals.invest = tImmo + tMob + tServ + tFds;
    this.totals.credits = tCredits; this.totals.apports = tApports;
    this.totals.funding = tCredits + tApports;
    this.totals.diff = this.totals.funding - this.totals.invest;

    const raw = tCredits * 0.14;
    this.totals.adapt = Math.max(3000, Math.min(this.EVALPRO_MAX, raw));
  }

  percent(part: number): number {
    const total = this.totals.invest || 1;
    return Math.round((part / total) * 100);
  }

  addLine(target: Line[]): void {
    if (this.isAdmin) return;
    target.push({ label: '', amount: 0, file: null });
    this.recompute();
  }
  removeLine(target: Line[], i: number): void {
    if (this.isAdmin) return;
    target.splice(i, 1);
    this.recompute();
  }


  onFile($event: Event, target: Line, qid?: number): void {
    if (this.isAdmin) return;
    const input = $event.target as HTMLInputElement;
    const file = input?.files?.[0]; if (!file) return;

    const fd = new FormData();
    fd.append('file', file, file.name);
    if (this.dossierId) fd.append('dossierId', String(this.dossierId));
    if (qid != null) fd.append('questionId', String(qid));

    this.formService.uploadFile(fd).subscribe({
      next: (res: any) => {
        target.file = typeof res === 'string'
          ? res
          : (res?.url || res?.path || res?.location || res?.fileUrl || null);
      },
      error: err => console.error('upload err', err)
    });
  }

  // ===== submit (tout envoyer à la fin)
  submit(): void {
    const cleaned: any[] = [];
    // Besoins
    this.addLines(this.Q.immo.construction, this.immo.construction, cleaned);
    this.addLines(this.Q.immo.amenagement, this.immo.amenagement, cleaned);
    this.addLines(this.Q.immo.genieCivil, this.immo.genieCivil, cleaned);

    this.addLines(this.Q.mob.roulant, this.mob.roulant, cleaned);
    this.addLines(this.Q.mob.equipement, this.mob.equipement, cleaned);
    this.addLines(this.Q.mob.cheptel, this.mob.cheptel, cleaned);
    this.addLines(this.Q.mob.vegetal, this.mob.vegetal, cleaned);

    (Object.keys(this.serv) as (keyof SchemaFinancementComponent['serv'])[])
      .forEach(k => this.addLines((this.Q.services as any)[k], this.serv[k], cleaned));

    this.push(this.Q.fonds.monthly, this.fonds.monthly, cleaned);
    this.push(this.Q.fonds.months, this.fonds.months, cleaned);
    this.push(this.Q.fonds.note, this.fonds.note, cleaned);

    // Financement
    this.addLines(this.Q.credits, this.credits, cleaned);
    this.addLines(this.Q.apports, this.apports, cleaned);

    // Sécurités
    const dossierIdToSend = this.dossierId ? Number(this.dossierId) : null;
    const formIdToSend = this.formId ?? this.stepId;

    // ⛔ PAS de pillar ici : on valide tout l'étape.
    const payload: any = {
      formId: formIdToSend,
      stepId: this.stepId,
      dossierId: dossierIdToSend,
      responses: this.isAdmin ? [] : cleaned
    };
    if (this.isAdmin) payload.comment = this.formGroup.get('comment')?.value || '';

    const onSuccess = (res: any) => {
      const id = res?.dossierId || dossierIdToSend;
      if (id) {
        localStorage.setItem('dossierId', String(id));
        const prev = Number(localStorage.getItem('completedStep') || '0');
        if (prev < 5) localStorage.setItem('completedStep', '5');

        this.router.navigate(['/projects/edit', id], {
          state: { successMessage: 'Étape 5 terminée avec succès !', completedStep: 5 }
        });
      }
    };

    if (this.isEditMode && dossierIdToSend) {
      this.formService.submitStep(payload, this.stepId, dossierIdToSend).subscribe({
        next: onSuccess,
        error: err => console.error('[Step5] Erreur envoi (edit):', err)
      });
    } else {
      this.formService.submitStep(payload, this.stepId, null).subscribe({
        next: onSuccess,
        error: err => console.error('[Step5] Erreur envoi (création):', err)
      });
    }
  }

  back(): void { this.router.navigate([`/projects/edit/${this.dossierId}/step4`]); }

  goBack(): void {
    this.router.navigate(['/projects/create']);
    const prev = Number(localStorage.getItem('completedStep') || '0');
    if (prev < 5) localStorage.setItem('completedStep', '5');
    this.router.navigate(['/projects/edit', this.dossierId], {
      state: { successMessage: 'Étape 5 terminée avec succès !', completedStep: 5 }
    });
  }
}
