import { Question } from "./question.model";

export interface FormResponse {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}
