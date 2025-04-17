export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
