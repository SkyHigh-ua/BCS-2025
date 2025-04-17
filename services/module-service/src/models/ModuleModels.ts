export interface Module {
  id: number;
  name: string;
  description: string;
  scriptFile: string;
  inputs: any;
  outputs: any;
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
