// lib/services/admin.ts - Migrado de tu proyecto móvil
import { api, ApiResponse } from './api';
import { SupportTicket, TicketMessage } from '../types/support';

// Interfaces (migradas de tu código)
export interface AdminTicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: number;
  search?: string;
}

export interface AdminTicketUpdate {
  status?: string;
  priority?: string;
  assignedTo?: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalTasks: number;
  totalRevenue: number;
  pendingVerifications: number;
  openTickets: number;
  recentActivity: any[];
}

// Servicio principal (adaptado de tu adminService)
export const adminService = {
  // Dashboard stats
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get<AdminDashboardStats>('/api/admin/dashboard/stats');
    return response.data!;
  },

  // Get all tickets with optional filters
  getAllTickets: async (filters?: AdminTicketFilters): Promise<SupportTicket[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const endpoint = `/api/support/admin/tickets${params.toString() ? `?${params}` : ''}`;
    const response = await api.get<SupportTicket[]>(endpoint);
    return response.data!;
  },

  // Get specific ticket details
  getTicketDetails: async (ticketId: number): Promise<SupportTicket> => {
    const response = await api.get<SupportTicket>(`/api/support/admin/tickets/${ticketId}`);
    return response.data!;
  },

  // Update ticket status/priority/assignment
  updateTicket: async (ticketId: number, updates: AdminTicketUpdate): Promise<SupportTicket> => {
    const response = await api.patch<SupportTicket>(`/api/support/admin/tickets/${ticketId}`, updates);
    return response.data!;
  },

  // Check if current user is staff
  checkStaffStatus: async (): Promise<{ isStaff: boolean; role: string }> => {
    const response = await api.get<{ isStaff: boolean; role: string }>('/api/support/admin/check-staff');
    return response.data!;
  },

  // Assign ticket to staff member
  assignTicket: async (ticketId: number, staffId: number): Promise<void> => {
    await api.post(`/api/support/admin/tickets/${ticketId}/assign`, { staffId });
  },

  // Get staff performance metrics
  getStaffMetrics: async (staffId?: number): Promise<any> => {
    const params = staffId ? `?staffId=${staffId}` : '';
    const response = await api.get(`/api/support/admin/metrics${params}`);
    return response.data!;
  },

  // Users management
  getAllUsers: async (page = 1, limit = 50, search?: string): Promise<any> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);

    const response = await api.get(`/api/admin/users?${params}`);
    return response.data!;
  },

  // Block/unblock user
  updateUserStatus: async (userId: number, status: 'OK' | 'BLOCKED' | 'DISABLED'): Promise<void> => {
    await api.patch(`/api/admin/users/${userId}/status`, { status });
  },
};

// Helper functions (migradas de tu código)
export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    LOW: '#10B981',     // Green
    MEDIUM: '#F59E0B',  // Orange  
    HIGH: '#EF4444',    // Red
    URGENT: '#DC2626',  // Dark Red
  };
  return colorMap[priority] || '#6B7280';
};

export const getPriorityDisplayText = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media', 
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };
  return priorityMap[priority] || priority;
};

export const getStatusDisplayText = (status: string): string => {
  const statusMap: Record<string, string> = {
    NEW: 'Nuevo',
    OPEN: 'Abierto',
    IN_PROGRESS: 'En Progreso',
    PENDING_CUSTOMER: 'Esperando Cliente',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
  };
  return statusMap[status] || status;
};