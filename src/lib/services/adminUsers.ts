// lib/services/adminUsers.ts - Servicio para gestión de usuarios
import { api } from './api';

// Interfaces
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profilePictureUrl?: string;
  state: 'OK' | 'BLOCKED' | 'DISABLED';
  createdAt: string;
  totalTasks: number;
  totalRatings: number;
  averageRating: number;
  earningsTotal: number;
  verificationLevel: string;
  identityVerified: boolean;
  criminalRecordVerified: boolean;
  addressVerified: boolean;
  location?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'OK' | 'BLOCKED' | 'DISABLED' | 'ALL';
  verified?: boolean;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserStatusUpdate {
  status: 'OK' | 'BLOCKED' | 'DISABLED';
  reason?: string;
}

// Servicio de administración de usuarios
export const adminUsersService = {
  // Obtener todos los usuarios con paginación y filtros
  getAllUsers: async (filters?: UserFilters): Promise<UsersResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
        if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
      }

      const endpoint = `/api/admin/users${params.toString() ? `?${params}` : ''}`;
      console.log('🔍 Fetching users from:', endpoint);
      
      const response = await api.get(endpoint);
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  },

  // Obtener detalles de un usuario específico
  getUserDetails: async (userId: number): Promise<AdminUser> => {
    try {
      console.log('👤 Fetching user details for ID:', userId);
      const response = await api.get(`/api/admin/users/${userId}`);
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      throw error;
    }
  },

  // Actualizar estado del usuario (bloquear/desbloquear)
  updateUserStatus: async (userId: number, updates: UserStatusUpdate): Promise<void> => {
    try {
      console.log('🔄 Updating user status:', { userId, ...updates });
      const response = await api.patch(`/api/admin/users/${userId}/status`, updates);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      throw error;
    }
  },

  // Obtener estadísticas del dashboard
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await api.get('/api/admin/dashboard/stats');
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },
};