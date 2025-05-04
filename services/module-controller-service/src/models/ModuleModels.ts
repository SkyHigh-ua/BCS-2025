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

export interface ModuleResult {
  id?: number;
  siteId: number;
  moduleId: number;
  timestamp: Date;
  data: any;
  site?: Site;
  module?: Module;
}
