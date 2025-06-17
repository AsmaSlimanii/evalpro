
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EXPERT' | 'CLIENT';
  password?: string;
}
