export type Role = 'client' | 'business' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
}
