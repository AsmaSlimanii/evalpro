
import { Option } from './option.model';

export interface Question {
  id: number;
  text: string;
  isRequired: boolean;
  type: 'TEXTE' | 'CHOIX_MULTIPLE' | 'NUMERIQUE';
  options: Option[];
}