export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  pfp?: string;
  role: number;
  parentUser?: number;
  createdAt: string;
  updatedAt: string;
}
