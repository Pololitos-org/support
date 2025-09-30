// src/lib/services/dashboard.ts
import { api } from './api';
import { DashboardStats } from '../types/dashboard';

export const dashboardService = {
  // Obtener estadísticas del dashboard
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardStats>('/api/admin/dashboard/stats');
      
      if (!response.data) {
        throw new Error('No se pudieron obtener las estadísticas');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Método auxiliar para formatear moneda chilena
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  // Formatear tiempo relativo
  formatRelativeTime: (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }
};