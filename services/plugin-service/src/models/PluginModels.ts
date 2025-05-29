export interface Site {
  id: number;
  domain: string;
  name: string;
  description: string;
  author: number;
  createdAt: Date;
}

export interface Plugin {
  id: number;
  name: string;
  description: string;
  requirements: any;
  repoLink: string;
  fqdn?: string;
  outputs?: any;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
