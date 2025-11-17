export interface AuthUser {
  id?: string;
  email: string;
  name?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt?: string;
  roles?: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  roles: string[];
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  employeeId: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  username: string;
  roles: string[];
  enabled: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}
