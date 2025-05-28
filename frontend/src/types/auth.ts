export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: AuthResponseData;
} 