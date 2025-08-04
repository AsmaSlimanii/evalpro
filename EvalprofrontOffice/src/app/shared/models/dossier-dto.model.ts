export interface DossierDto {
  id: number;
  code: string;
  nomOfficielProjet: string;
  categorie?: string;
  situation?: string;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  steps: {
    [key: string]: number; // Exemple: { step1: 100, step2: 60 }
  };
}
