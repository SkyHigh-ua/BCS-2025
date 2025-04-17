export interface Plugin {
  id: number;
  name: string;
  description: string;
  repoLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: number;
  domain: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
