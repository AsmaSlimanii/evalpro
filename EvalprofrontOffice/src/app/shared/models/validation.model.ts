import { Response } from './response.model';
import { User } from './user.model';

export interface Validation {
  id: number;
  comment: string;
  status: 'VALIDE' | 'REJETE';
  response: Response;
  validator: User;
}
