import { QuestionOption } from "./QuestionOption";

export interface Question {
 id: number;
  text: string;
  type: 'TEXT' | 'NUMERIQUE' | 'CHOIXMULTIPLE';
  is_required: boolean;
  options: QuestionOption[];
}