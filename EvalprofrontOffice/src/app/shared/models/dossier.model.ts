
import { Step } from './step.model';

export interface Dossier {
  id: number;
  createdAt: string;
  status: 'EN_COURS' | 'VALIDE' | 'REJETE';
  userId: number;
  steps: Step[];
}

export interface DossierIdResponse {
  id: number;
}
