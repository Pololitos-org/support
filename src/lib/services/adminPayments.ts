// lib/services/adminPayments.ts
import { api } from './api';

// ==================== INTERFACES ====================

export interface PaymentAnalyticsFilters {
  hasBankAccount?: boolean;
  minBalance?: number;
  maxBalance?: number;
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  identityVerified?: boolean;
  criminalRecordVerified?: boolean;
  addressVerified?: boolean;
  registeredAfter?: string;
  registeredBefore?: string;
  lastActiveAfter?: string;
  hasCompletedTasks?: boolean;
  minTasks?: number;
  state?: 'OK' | 'BLOCKED' | 'DISABLED';
  page?: number;
  limit?: number;
  sortBy?: 'balance' | 'registeredDate' | 'tier' | 'totalTasks' | 'earnings';
  sortOrder?: 'ASC' | 'DESC';
  export?: boolean;
}

export interface UserPaymentData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  state: string;
  tier?: string;
  createdAt: string;
  updatedAt: string;
  totalTasks: number;
  completedTasksCount: number;
  averageRating: number;
  verificationLevel: string;
  identityVerified: boolean;
  criminalRecordVerified: boolean;
  addressVerified: boolean;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  lastTransactionAt?: string;
  hasBankAccount: boolean;
  bankAccount?: {
    nombreCompleto: string;
    rut: string;
    banco: string;
    tipoCuenta: string;
    numeroCuenta: string;
    numeroCuentaEnmascarado: string;
  } | null;
}

export interface PaymentAnalyticsStatistics {
  totalUsers: number;
  usersWithBank: number;
  usersWithoutBank: number;
  percentWithBank: string;
  bronzeTier: number;
  silverTier: number;
  goldTier: number;
  platinumTier: number;
  totalAvailableBalance: number;
  totalPendingBalance: number;
  totalEarningsSum: number;
  avgAvailableBalance: number;
  identityVerifiedCount: number;
  criminalRecordVerifiedCount: number;
  addressVerifiedCount: number;
  percentIdentityVerified: string;
}

export interface PaymentAnalyticsResponse {
  success: boolean;
  data: {
    users: UserPaymentData[];
    statistics: PaymentAnalyticsStatistics;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    } | null;
    filters: PaymentAnalyticsFilters;
    sortBy: string;
    sortOrder: string;
  };
}

// ==================== SERVICE ====================

export const adminPaymentsService = {
  /**
   * Obtener analytics de pagos y balances de usuarios
   */
  getPaymentAnalytics: async (
    filters?: PaymentAnalyticsFilters
  ): Promise<PaymentAnalyticsResponse['data']> => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const endpoint = `/api/admin/users/analytics${params.toString() ? `?${params}` : ''}`;
      console.log('💰 Fetching payment analytics from:', endpoint);
      
      const response = await api.get<PaymentAnalyticsResponse>(endpoint);
      
      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching payment analytics:', error);
      throw error;
    }
  },

  /**
   * Exportar analytics de pagos a CSV
   */
  exportPaymentAnalyticsCSV: async (
    filters?: PaymentAnalyticsFilters
  ): Promise<void> => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      params.append('export', 'true');

      const endpoint = `/api/admin/users/analytics?${params.toString()}`;
      window.open(endpoint, '_blank');
      
      console.log('📥 Exporting payment analytics to CSV');
    } catch (error) {
      console.error('❌ Error exporting payment analytics:', error);
      throw error;
    }
  },
};