export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  pfp: string;
  role: number;
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
