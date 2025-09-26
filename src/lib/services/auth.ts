// lib/services/auth.ts - Servicio de autenticación
import { api, ApiError } from './api';

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
  // Login de administrador
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('🔐 Attempting admin login for:', credentials.email);
      
      const response = await api.post<LoginResponse>('/api/auth/login', credentials);
      
      if (!response.data?.accessToken) {
        throw new Error('Invalid response format: missing access token');
      }

      // Guardar token en localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      console.log('✅ Login successful, token saved');
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Limpiar cualquier token existente en caso de error
      localStorage.removeItem('accessToken');
      throw error;
    }
  },

  // Verificar si el usuario actual es staff/admin
  checkStaffStatus: async (): Promise<StaffCheckResponse> => {
    try {
      console.log('🛡️ Checking staff status...');
      
      const response = await api.get<StaffCheckResponse>('/api/support/admin/check-staff');
      
      if (!response.data) {
        throw new Error('Invalid response format');
      }

      console.log('✅ Staff status verified:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Staff check failed:', error);
      throw error;
    }
  },

  // Logout
  logout: (): void => {
    console.log('👋 Logging out...');
    localStorage.removeItem('accessToken');
  },

  // Verificar si hay un token válido
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  // Obtener token actual
  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  // Login completo con verificación de staff
  loginAsAdmin: async (credentials: LoginRequest): Promise<{ 
    loginData: LoginResponse; 
    staffData: StaffCheckResponse;
  }> => {
    try {
      // 1. Hacer login normal
      const loginData = await authService.login(credentials);
      
      // 2. Verificar permisos de staff
      const staffData = await authService.checkStaffStatus();
      
      if (!staffData.isStaff) {
        // Si no es staff, hacer logout y lanzar error
        authService.logout();
        throw new ApiError('No tienes permisos de administrador', 403);
      }

      return { loginData, staffData };
    } catch (error) {
      // Asegurar cleanup en caso de error
      authService.logout();
      throw error;
    }
  }
};