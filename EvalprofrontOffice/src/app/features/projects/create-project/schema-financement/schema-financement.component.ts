import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../../core/services/form.service';
import { NgIfContext } from '@angular/common';

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
  percentFunding(part: number): number {
    const total = (this.totals.credits + this.totals.apports) || 1;
    return Math.round((part / total) * 100);
  }


  // UI
  isLoading = true;
  activeTab: 'needs' | 'funding' = 'needs';
  cat: Cat = 'immobilier';
  credOrApport: 'credits' | 'apports' = 'credits';

  // routing
  dossierId: string | null = null;
  projectName = '';

  readonly stepKey = 'schema-financement';
  readonly stepId = 5;


  // en haut du composant si tu veux un max configurable
  private readonly ADAPT_MAX = 70000; // plafond contribution ADAPT
  fundingRight: TemplateRef<NgIfContext<boolean>> | null | undefined;

  // 🔢 % affiché dans la jauge (0 → 100)
  get adaptPct(): number {
    const adapt = Number(this.totals?.adapt || 0);
    return Math.max(0, Math.min(100, Math.round((adapt / this.ADAPT_MAX) * 100)));
  }

  // 🧭 angle de l’aiguille (-90° à +90°)
  get gaugeAngle(): number {
    return -90 + (this.adaptPct / 100) * 180;
  }


  // === IDs des questions (adapte si besoin)
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
    credits: { label: 143, amount: 144, file: 145 },  // 140..142 = titres
    apports: { label: 147, amount: 148, file: 149 }   // 146 = titre
  } as const;

  // === état
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
  ownFunds = 0; // si tu ajoutes “fonds propres” en question dédiée

  totals = {
    immo: 0, mob: 0, serv: 0, fonds: 0,
    invest: 0,
    credits: 0, apports: 0, funding: 0, diff: 0,
    adapt: 0 // 14% borné
  };

  constructor(private route: ActivatedRoute, private router: Router, private formService: FormService) { }

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.paramMap.get('id') || localStorage.getItem('dossierId');
    if (!this.dossierId) { this.router.navigate(['/projects/create']); return; }
    this.load();
  }

  // ---------------------------- LOAD ----------------------------
  private load(): void {
    const dossierId = this.dossierId!;
    this.formService.getFormWithResponses(this.stepKey, dossierId).subscribe({
      next: (form) => {
        this.projectName = form?.projectName || '';
        const resps: any[] = form?.responses || [];

        const pickAll = (qid: number): string[] =>
          resps.filter(r => r.questionId === qid && r.value != null && r.value !== '')
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
              amount: +(amounts[i] ?? 0),
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

        // Services (chaque rubrique)
        (Object.keys(this.serv) as (keyof SchemaFinancementComponent['serv'])[])
          .forEach(k => this.serv[k] = inflate((this.Q.services as any)[k]));

        // Fonds
        this.fonds.monthly = +(pickAll(this.Q.fonds.monthly)[0] ?? 0);
        this.fonds.months = +(pickAll(this.Q.fonds.months)[0] ?? 0);
        this.fonds.note = pickAll(this.Q.fonds.note)[0] ?? '';

        // Financement
        this.credits = inflate(this.Q.credits);
        this.apports = inflate(this.Q.apports);

        // UX : au moins une ligne visible
        const one = (arr: Line[]) => { if (!arr.length) arr.push({ label: '', amount: 0, file: null }); };
        one(this.immo.construction); one(this.immo.amenagement); one(this.immo.genieCivil);
        one(this.mob.roulant); one(this.mob.equipement); one(this.mob.cheptel); one(this.mob.vegetal);
        (Object.values(this.serv)).forEach(one);
        one(this.credits); one(this.apports);

        this.isLoading = false;
        this.recompute();
      },
      error: _ => this.isLoading = false
    });
  }

  // ---------------------------- UI helpers ----------------------------
  addLine(target: Line[]): void { target.push({ label: '', amount: 0, file: null }); this.recompute(); }
  removeLine(target: Line[], i: number): void { target.splice(i, 1); if (!target.length) this.addLine(target); this.recompute(); }

  onFile($event: Event, target: Line): void {
    const input = $event.target as HTMLInputElement;
    const file = input?.files?.[0]; if (!file) return;
    const fd = new FormData();
    fd.append('file', file, file.name);
    if (this.dossierId) fd.append('dossierId', String(this.dossierId));
    this.formService.uploadFile(fd).subscribe({
      next: (res: any) => target.file = res?.url || res?.path || res?.location || null,
      error: err => console.error('upload err', err)
    });
  }

  // ---------------------------- Totaux ----------------------------
  private sum(arr: Line[]) { return arr.reduce((s, l) => s + (+l.amount || 0), 0); }

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

    // Contribution ADAPT (comme sur la capture, 14% borné)
    const raw = tCredits * 0.14;
    this.totals.adapt = Math.max(3000, Math.min(70000, raw));
  }

  percent(part: number): number {
    const total = this.totals.invest || 1;
    return Math.round((part / total) * 100);
  }

  // ---------------------------- SAVE ----------------------------
  submit(): void {
    const dossierIdNum = Number(this.dossierId);
    const asResponses = (triple: { label?: number; amount: number; file?: number; }, rows: Line[]) => {
      const out: any[] = [];
      rows.forEach(l => {
        const hasAmount = l.amount != null && !isNaN(+l.amount) && +l.amount > 0;
        const hasLabel = !!(triple.label && l.label && l.label.trim().length);
        const hasFile = !!(triple.file && l.file);

        if (hasLabel) out.push({ questionId: triple.label!, value: l.label.trim(), optionIds: [] });
        if (hasAmount) out.push({ questionId: triple.amount, value: String(+l.amount), optionIds: [] });
        if (hasFile) out.push({ questionId: triple.file!, value: String(l.file), optionIds: [] });
      });
      return out;
    };

    const calls: Array<{ pillar: string; responses: any[]; }> = [];

    // IMMOBILIER
    calls.push({
      pillar: 'IMMOBILIER',
      responses: [
        ...asResponses(this.Q.immo.construction, this.immo.construction),
        ...asResponses(this.Q.immo.amenagement, this.immo.amenagement),
        ...asResponses(this.Q.immo.genieCivil, this.immo.genieCivil),
      ]
    });

    // MOBILIER
    calls.push({
      pillar: 'MOBILIER',
      responses: [
        ...asResponses(this.Q.mob.roulant, this.mob.roulant),
        ...asResponses(this.Q.mob.equipement, this.mob.equipement),
        ...asResponses(this.Q.mob.cheptel, this.mob.cheptel),
        ...asResponses(this.Q.mob.vegetal, this.mob.vegetal),
      ]
    });

    // SERVICES
    type ServMap = SchemaFinancementComponent['serv'];  // ✅ évite "typeof this"
    const servResp: any[] = [];
    (Object.keys(this.serv) as (keyof ServMap)[]).forEach(k => {
      servResp.push(...asResponses((this.Q.services as any)[k], this.serv[k]));
    });
    calls.push({ pillar: 'SERVICES', responses: servResp });

    // FONDS
    // FONDS
    const fondsResp: any[] = [];
    if (this.fonds.monthly > 0) fondsResp.push({ questionId: this.Q.fonds.monthly, value: String(+this.fonds.monthly), optionIds: [] });
    if (this.fonds.months > 0) fondsResp.push({ questionId: this.Q.fonds.months, value: String(+this.fonds.months), optionIds: [] });
    if ((this.fonds.note || '').trim().length) fondsResp.push({ questionId: this.Q.fonds.note, value: this.fonds.note.trim(), optionIds: [] });
    calls.push({ pillar: 'FONDS', responses: fondsResp });


    // FINANCEMENT
    calls.push({ pillar: 'FINANCEMENT_CREDITS', responses: [...asResponses(this.Q.credits, this.credits)] });
    calls.push({ pillar: 'FINANCEMENT_APPORTS', responses: [...asResponses(this.Q.apports, this.apports)] });

    // enchaîne les calls
    const run = (i: number) => {
      if (i >= calls.length) return this.afterSave();
      const payload = {
        formId: this.stepId,
        stepId: this.stepId,
        dossierId: this.dossierId,
        pillar: calls[i].pillar,
        responses: calls[i].responses
      };
      this.formService.submitStep(payload, this.stepId, dossierIdNum).subscribe({
        next: () => run(i + 1),
        error: (e) => { console.error('save error', calls[i].pillar, e); run(i + 1); }
      });
    };
    run(0);
  }

  private afterSave() {
    this.router.navigate([`/projects/edit/${this.dossierId}/step5`], {
      state: { successMessage: 'Étape 5 enregistrée avec succès !' }
    });
  }

  back(): void {
    this.router.navigate([`/projects/edit/${this.dossierId}/step4`]);
  }
}
