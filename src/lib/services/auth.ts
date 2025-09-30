// lib/services/auth.ts
import { api } from './api';
import { 
  ApiError, 
  AuthError, 
  AuthErrorCode, 
  getErrorMessage,
  logError 
} from '@/lib/types/errors';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
}

export interface StaffCheckResponse {
  isStaff: boolean;
  role: string;
  permissions?: string[];
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('🔐 Attempting login for:', credentials.email);

      const response = await api.post<LoginResponse>('/api/auth/login', credentials);

      if (!response.data?.accessToken) {
        throw new AuthError(
          'Respuesta inválida del servidor',
          AuthErrorCode.INVALID_TOKEN,
          500
        );
      }

      localStorage.setItem('accessToken', response.data.accessToken);
      console.log('✅ Login successful');

      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      logError(error, 'Auth login');
      throw error;
    }
  },

  checkStaffStatus: async (): Promise<StaffCheckResponse> => {
    try {
      console.log('🛡️ Checking staff status...');

      const response = await api.get<StaffCheckResponse>('/api/support/admin/check-staff');

      if (!response.data) {
        throw new AuthError(
          'Respuesta inválida del servidor',
          AuthErrorCode.INVALID_TOKEN,
          500
        );
      }

      console.log('✅ Staff status verified:', response.data);
      return response.data;
    } catch (error) {
      logError(error, 'Staff check');
      throw error;
    }
  },

  logout: (): void => {
    console.log('👋 Logging out...');
    localStorage.removeItem('accessToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  loginAsAdmin: async (credentials: LoginRequest): Promise<{
    loginData: LoginResponse;
    staffData: StaffCheckResponse;
  }> => {
    try {
      // 1. Login normal
      const loginData = await authService.login(credentials);

      // 2. Verificar permisos de staff
      const staffData = await authService.checkStaffStatus();

      if (!staffData.isStaff) {
        authService.logout();
        throw new AuthError(
          'No tienes permisos de administrador',
          AuthErrorCode.NOT_STAFF,
          403
        );
      }

      return { loginData, staffData };
    } catch (error) {
      authService.logout();
      throw error;
    }
  },
};