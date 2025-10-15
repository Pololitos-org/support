// src/lib/services/transactions.ts
import { api } from './api';

export interface Transaction {
  id: number;
  taskId: number;
  offerId: number;
  userId: number;
  type: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  platformFeePercentage: number;
  status: string;
  paymentProvider?: string;
  providerTransactionId?: string;
  appliedTierName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  // Populated fields
  userName?: string;
  userEmail?: string;
  taskTitle?: string;
}

export interface TransactionStats {
  // Resumen general
  totalTransactions: number;
  activeUsers: number;
  completedTasks: number;
  pendingTasks: number;
  
  // Montos
  totalPaidToWorkers: number;
  totalFeesCollected: number;
  periodFeesCollected: number;
  heldAmount: number; // En escrow
  totalRefunds: number;
  
  // Por tipo
  byType: Array<{
    type: string;
    count: number;
    total: number;
  }>;
  
  // Temporal
  monthlyFees: Array<{
    month: string;
    fees: number;
    count: number;
  }>;
  
  dailyTransactions: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
}

export const transactionsService = {
  /**
   * Obtiene estadísticas de transacciones
   */
  async getStats(days: number = 30): Promise<TransactionStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const endDate = new Date();
      
      console.log(`📊 Fetching transaction stats for ${days} days...`);
      
      const response = await api.get<TransactionStats>(
        `/api/admin/transactions/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching transaction stats:', error);
      throw error;
    }
  },

  /**
   * Obtiene transacciones recientes
   */
  async getRecentTransactions(limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    try {
      console.log(`📋 Fetching recent transactions (limit: ${limit}, offset: ${offset})...`);
      
      const response = await api.get<Transaction[]>(
        `/api/admin/transactions/recent?limit=${limit}&offset=${offset}`
      );
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching recent transactions:', error);
      throw error;
    }
  },

  /**
   * Obtiene transacciones de una tarea específica
   */
  async getTaskTransactions(taskId: number): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>(
        `/api/admin/transactions/task/${taskId}`
      );
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching task transactions:', error);
      throw error;
    }
  },

  /**
   * Obtiene transacciones de un usuario específico
   */
  async getUserTransactions(userId: number, limit: number = 50): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>(
        `/api/admin/transactions/user/${userId}?limit=${limit}`
      );
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching user transactions:', error);
      throw error;
    }
  },

  /**
   * Obtiene balance total de la plataforma
   */
  async getPlatformBalance(): Promise<{
    totalAvailable: number;
    totalPending: number;
    totalEarnings: number;
    escrowBalance: number;
  }> {
    try {
      const response = await api.get<any>('/api/admin/transactions/platform-balance');
      return response.data || {
        totalAvailable: 0,
        totalPending: 0,
        totalEarnings: 0,
        escrowBalance: 0
      };
    } catch (error) {
      console.error('❌ Error fetching platform balance:', error);
      throw error;
    }
  }
};