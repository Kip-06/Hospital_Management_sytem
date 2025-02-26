// src/types.ts
export interface User {
    id: number;
    email: string;
    role: 'patient' | 'doctor' | 'staff' | 'admin';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AuthResponse {
    token: string;
    role: string;
  }