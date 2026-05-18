export interface User {
  id: number;
  userId: number;
  email: string;
  role: string;
  fullName: string;
  username?: string;
  avatarUrl?: string;
  isActive?: boolean;
  active?: boolean;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
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
