
export interface Response {
  id: number;
  value: string;
  isValid: boolean;
  comment?: string;
  userId: number;
  formId: number;
  dossierId: number;
  optionId?: number;
}