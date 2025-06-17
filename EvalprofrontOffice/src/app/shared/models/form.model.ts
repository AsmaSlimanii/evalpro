
import { Question } from './question.model';
import { Response } from './response.model';

export interface FormModel {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  responses: Response[];
}