export interface CreationProjetDto {
  objectif: string;
  montant: number;
  duree: number;
  secteurActivite: string;
  description?: string;

}


   export interface Payload {
      formId: any;
      stepId: number;
      dossierId: string | null;
      responses: { questionId: any; value: any; optionIds: any; }[];
      comment?: string;
      
    
     
   }
   