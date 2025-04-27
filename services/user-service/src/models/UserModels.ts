export interface User {
  id: number;
  first_name: string;
  last_name: string;
  password: string;
  email: string;
  pfp?: string;
  role: number;
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  author: string;
  permissions: any[];
  createdAt: Date;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
}
