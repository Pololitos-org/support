// src/lib/services/analytics.ts
import { api } from './api';

export interface AnalyticsSummary {
  totalUsers: number;
  newUsers: number;
  verifiedUsers: number;
  totalTasks: number;
  newTasks: number;
  totalRevenue: number;
  periodRevenue: number;
  heldMoney: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface MonthlyData {
  month: string;
  users?: number;
  revenue?: number;
  tasks?: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  charts: {
    tasksByCategory: CategoryData[];
    monthlyUsers: MonthlyData[];
    monthlyRevenue: MonthlyData[];
    monthlyTasks: MonthlyData[];
  };
}

export const analyticsService = {
  getStats: async (period: number = 30): Promise<AnalyticsData> => {
    try {
      const response = await api.get<AnalyticsData>(`/api/admin/analytics/stats?period=${period}`);
      
      if (!response.data) {
        throw new Error('No se pudieron obtener las estadísticas de analytics');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching analytics stats:', error);
      throw error;
    }
  },

  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  formatMonth: (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-CL', { 
      year: 'numeric', 
      month: 'short' 
    });
  }
};