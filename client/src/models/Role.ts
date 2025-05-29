export interface Role {
  id: number;
  name: string;
  description?: string;
  author: number;
  permissions?: Record<string, any>;
  createdAt: string;
}
