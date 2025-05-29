export interface Module {
  id: number;
  name: string;
  description?: string;
  repoLink: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
