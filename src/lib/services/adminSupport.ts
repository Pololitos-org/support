// lib/services/adminSupport.ts - Servicio de tickets de soporte
import { api } from './api';

// Interfaces para tickets de soporte
export interface SupportTicket {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  assignedTo?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  responseCount?: number;
  lastResponseAt?: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  fromUserId?: number;
  fromStaffId?: number;
  fromUserName: string;
  message: string;
  isFromCustomer: boolean;
  isFromStaff: boolean;
  createdAt: string;
  attachments?: any[];
}

export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TicketUpdate {
  status?: 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: number;
}

export interface TicketsResponse {
  tickets: SupportTicket[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalTickets: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Servicio de administración de soporte
export const adminSupportService = {
  // Obtener todos los tickets con filtros
  getAllTickets: async (filters?: TicketFilters): Promise<SupportTicket[]> => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
        if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
        if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
        if (filters.assignedTo) params.append('assignedTo', filters.assignedTo.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
      }

      const endpoint = `/api/support/admin/tickets${params.toString() ? `?${params}` : ''}`;
      console.log('🎫 Fetching tickets from:', endpoint);
      
      const response = await api.get<SupportTicket[]>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      throw error;
    }
  },

  // Obtener detalles de un ticket específico
  getTicketDetails: async (ticketId: number): Promise<SupportTicket> => {
    try {
      console.log('🎫 Fetching ticket details for ID:', ticketId);
      const response = await api.get<SupportTicket>(`/api/support/admin/tickets/${ticketId}`);
      
      if (!response.data) {
        throw new Error('Invalid response format');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching ticket details:', error);
      throw error;
    }
  },

  // Obtener mensajes de un ticket
  getTicketMessages: async (ticketId: number): Promise<TicketMessage[]> => {
    try {
      const response = await api.get<TicketMessage[]>(`/api/support/admin/tickets/${ticketId}/messages`);
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching ticket messages:', error);
      throw error;
    }
  },

  // Actualizar ticket (estado, prioridad, asignación)
  updateTicket: async (ticketId: number, updates: TicketUpdate): Promise<SupportTicket> => {
    try {
      console.log('🔄 Updating ticket:', { ticketId, ...updates });
      const response = await api.patch<SupportTicket>(`/api/support/admin/tickets/${ticketId}`, updates);
      
      if (!response.data) {
        throw new Error('Invalid response format');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating ticket:', error);
      throw error;
    }
  },

  // Responder a un ticket
  replyToTicket: async (ticketId: number, message: string): Promise<TicketMessage> => {
    try {
      console.log('💬 Replying to ticket:', ticketId);
      const response = await api.post<TicketMessage>(`/api/support/admin/tickets/${ticketId}/reply`, { 
        message 
      });
      
      if (!response.data) {
        throw new Error('Invalid response format');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error replying to ticket:', error);
      throw error;
    }
  },

  // Asignar ticket a staff member
  assignTicket: async (ticketId: number, staffId: number): Promise<void> => {
    try {
      console.log('👤 Assigning ticket:', { ticketId, staffId });
      await api.post(`/api/support/admin/tickets/${ticketId}/assign`, { staffId });
    } catch (error) {
      console.error('❌ Error assigning ticket:', error);
      throw error;
    }
  },

  // Obtener métricas del staff
  getStaffMetrics: async (staffId?: number): Promise<any> => {
    try {
      const params = staffId ? `?staffId=${staffId}` : '';
      const response = await api.get(`/api/support/admin/metrics${params}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching staff metrics:', error);
      throw error;
    }
  },

  // Verificar status de staff
  checkStaffStatus: async (): Promise<{ isStaff: boolean; role: string }> => {
    try {
      const response = await api.get<{ isStaff: boolean; role: string }>('/api/support/admin/check-staff');
      return response.data || { isStaff: false, role: 'USER' };
    } catch (error) {
      console.error('❌ Error checking staff status:', error);
      throw error;
    }
  },
};

// Funciones helper para mostrar datos
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

export const getPriorityDisplayText = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };
  return priorityMap[priority] || priority;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'NEW': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'OPEN': return 'bg-green-100 text-green-800 border-green-200';
    case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'PENDING_CUSTOMER': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'RESOLVED': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};