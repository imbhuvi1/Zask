export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password?: string;
  email?: string;
}
