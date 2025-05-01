export interface Plugin {
  id: number;
  name: string;
  description?: string;
  requirements?: Record<string, any>;
  repoLink: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
