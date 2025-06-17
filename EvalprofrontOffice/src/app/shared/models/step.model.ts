
import { FormModel } from './form.model';

export interface Step {
  id: number;
  name: string;
  stepOrder: number;
  isCompleted: boolean;
  forms: FormModel[];
}
