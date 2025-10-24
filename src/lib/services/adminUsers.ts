// lib/services/adminUsers.ts
import { api } from './api';

// 🆕 Nueva interfaz para cuenta bancaria
export interface BankAccount {
  nombreCompleto: string;
  rut: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string; // Completo (solo para admin)
  numeroCuentaEnmascarado: string; // **** últimos 4 dígitos
  numeroCuentaCompleto?: string; // Alias para consistencia
}

// 🆕 Nueva interfaz para balance
export interface UserBalance {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  lastTransactionAt?: string;
}

// Interfaz actualizada con datos bancarios
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
  earningsLast30Days?: number;
  tier?: string;
  verificationLevel: string;
  identityVerified: boolean;
  criminalRecordVerified: boolean;
  addressVerified: boolean;
  location?: string;
  bio?: string;
  
  // 🆕 Datos bancarios y balance
  bankAccount?: BankAccount | null;
  balance?: UserBalance | null;
}

// 🆕 Interface para usuarios con pagos pendientes
export interface PendingPayoutUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  earningsTotal: number;
  earningsLast30Days: number;
  tier: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  hasBankAccount: boolean;
  bankAccountHolder?: string;
  state: string;
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

// 🆕 Response para pending payouts
export interface PendingPayoutsResponse {
  success: boolean;
  data: PendingPayoutUser[];
  count: number;
  filters: {
    minBalance: number;
  };
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
      
      const response = await api.get<{success: boolean; data: UsersResponse}>(endpoint);
      
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

  // Obtener detalles de un usuario específico (ahora incluye datos bancarios)
  getUserDetails: async (userId: number): Promise<AdminUser> => {
    try {
      console.log('👤 Fetching user details (including bank account) for ID:', userId);
      const response = await api.get<{success: boolean; data: AdminUser}>(`/api/admin/users/${userId}`);
      
      if (response.data?.success) {
        const user = response.data.data;
        
        // Log para debug
        if (user.bankAccount) {
          console.log('💳 Bank account loaded for user:', {
            userId: user.id,
            hasBankAccount: true,
            banco: user.bankAccount.banco
          });
        } else {
          console.log('⚠️ No bank account found for user:', userId);
        }
        
        return user;
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
      const response = await api.patch<{success: boolean; message?: string}>(`/api/admin/users/${userId}/status`, updates);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      throw error;
    }
  },

  // 🆕 Obtener usuarios con pagos pendientes
  getPendingPayouts: async (minBalance: number = 1000): Promise<PendingPayoutsResponse> => {
    try {
      console.log('💰 Fetching users with pending payouts (min:', minBalance, ')');
      const response = await api.get<PendingPayoutsResponse>(
        `/api/admin/users/pending-payouts?minBalance=${minBalance}`
      );
      
      if (response.data?.success) {
        console.log('✅ Pending payouts fetched:', response.data.count, 'users');
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching pending payouts:', error);
      throw error;
    }
  },

  // Obtener estadísticas del dashboard
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await api.get<any>('/api/admin/dashboard/stats');
      return response.data || {};
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },
};