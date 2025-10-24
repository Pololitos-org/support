// lib/services/adminUsers.ts
import { api } from './api';

// ==================== INTERFACES ====================

export interface BankAccount {
  nombreCompleto: string;
  rut: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  numeroCuentaEnmascarado: string;
  numeroCuentaCompleto?: string;
}

export interface UserBalance {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  lastTransactionAt?: string;
}

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
  bankAccount?: BankAccount | null;
  balance?: UserBalance | null;
}

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

export interface PendingPayoutsResponse {
  success: boolean;
  data: PendingPayoutUser[];
  count: number;
  filters: {
    minBalance: number;
  };
}

// 🆕 Interfaces para tareas
export interface UserTask {
  id: number;
  title: string;
  description: string;
  budget: number;
  originalBudget?: number;
  paymentStatus: string;
  completed?: string;
  cancelled?: string;
  createdAt: string;
  updatedAt: string;
  completionRating?: number;
  completionFeedback?: string;
  whenMode: string;
  whenDate?: string;
  locationMode: string;
  locationName?: string;
  // Si es cliente
  workerId?: number;
  workerName?: string;
  workerProfilePicture?: string;
  workerRating?: number;
  workerTotalTasks?: number;
  // Si es trabajador
  clientId?: number;
  clientName?: string;
  clientProfilePicture?: string;
  clientRating?: number;
  // Oferta
  offerId?: number;
  offerAmount?: number;
  offerStatus?: string;
  offerCreatedAt?: string;
  platformFee?: number;
  netAmount?: number;
  totalOffers?: number;
  // Transacción
  transactionId?: number;
  transactionStatus?: string;
  earnedAmount?: number;
  paymentCompletedAt?: string;
}

export interface UserTasksResponse {
  success: boolean;
  data: {
    asClient: UserTask[];
    asWorker: UserTask[];
    stats: {
      totalAsClient: number;
      totalAsWorker: number;
      completedAsWorker: number;
      activeAsWorker: number;
      cancelledAsClient: number;
      totalEarningsAsWorker: number;
      totalSpentAsClient: number;
    };
  };
}

// 🆕 Interfaces para actividad
export interface UserActivity {
  activityType: string;
  activityId: number;
  subType?: string;
  amount?: number;
  netAmount?: number;
  platformFee?: number;
  status?: string;
  createdAt: string;
  completedAt?: string;
  taskId?: number;
  taskTitle?: string;
  tier?: string;
  icon?: string;
  description?: string;
  completionRating?: number;
  completionFeedback?: string;
  offerCount?: number;
}

export interface UserActivityResponse {
  success: boolean;
  data: UserActivity[];
  period: {
    from: string;
    to: string;
    days: number;
  };
}

// ==================== SERVICIO ====================

export const adminUsersService = {
  /**
   * Obtener todos los usuarios con paginación y filtros
   */
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

  /**
   * Obtener detalles completos de un usuario (incluye banco y balance)
   */
  getUserDetails: async (userId: number): Promise<AdminUser> => {
    try {
      console.log('👤 Fetching user details for ID:', userId);
      const response = await api.get<{success: boolean; data: AdminUser}>(`/api/admin/users/${userId}`);
      
      if (response.data?.success) {
        const user = response.data.data;
        
        if (user.bankAccount) {
          console.log('💳 Bank account loaded for user:', user.id);
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

  /**
   * 🆕 Obtener tareas del usuario (como cliente y trabajador)
   */
  getUserTasks: async (
    userId: number, 
    options?: {
      limit?: number;
      offset?: number;
      role?: 'client' | 'worker' | 'all';
      status?: 'completed' | 'active' | 'cancelled' | 'all';
    }
  ): Promise<UserTasksResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.role) params.append('role', options.role);
      if (options?.status) params.append('status', options.status);

      const endpoint = `/api/admin/users/${userId}/tasks${params.toString() ? `?${params}` : ''}`;
      console.log('📋 Fetching user tasks:', endpoint);
      
      const response = await api.get<UserTasksResponse>(endpoint);
      
      if (response.data?.success) {
        console.log('✅ Tasks loaded:', {
          asClient: response.data.data.asClient.length,
          asWorker: response.data.data.asWorker.length
        });
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching user tasks:', error);
      throw error;
    }
  },

  /**
   * 🆕 Obtener timeline de actividad del usuario
   */
  getUserActivity: async (
    userId: number,
    options?: {
      limit?: number;
      days?: number;
    }
  ): Promise<UserActivityResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.days) params.append('days', options.days.toString());

      const endpoint = `/api/admin/users/${userId}/activity${params.toString() ? `?${params}` : ''}`;
      console.log('⚡ Fetching user activity:', endpoint);
      
      const response = await api.get<UserActivityResponse>(endpoint);
      
      if (response.data?.success) {
        console.log('✅ Activity loaded:', response.data.data.length, 'events');
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching user activity:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado del usuario
   */
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

  /**
   * Obtener usuarios con pagos pendientes
   */
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

  /**
   * Obtener estadísticas del dashboard
   */
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