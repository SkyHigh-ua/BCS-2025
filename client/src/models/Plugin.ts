export interface Plugin {
  id: number;
  name: string;
  description?: string;
  requirements?: Record<string, any>;
  repoLink: string;
  fqdn?: string;
  outputs?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
