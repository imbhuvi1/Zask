export interface User {
  id: number;
  email: string;
  role: string;
  fullName: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  userId: number;
  message: string;
  fullName: string;
}

export interface LoginRequest {
  username: string;
  password?: string;
  email?: string;
}
