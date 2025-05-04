export interface Site {
  id: number;
  domain: string;
  name: string;
  description: string;
  author: number;
  createdAt: Date;
}

export interface Module {
  id: number;
  name: string;
  description: string;
  repoLink: string;
  inputs: any;
  outputs: any;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
