export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
}
