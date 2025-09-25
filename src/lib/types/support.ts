// lib/types/support.ts - Tipos completos para el sistema de soporte
export type TicketStatus = 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'TECHNICAL' | 'BILLING' | 'GENERAL' | 'VERIFICATION' | 'COMPLAINT';

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  userId: number;
  userName: string;
  userEmail?: string;
  assignedTo?: number;
  assignedToName?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderName: string;
  senderEmail?: string;
  content: string;
  isFromStaff: boolean;
  createdAt: string;
  attachments?: TicketAttachment[];
}

export interface TicketAttachment {
  id: number;
  messageId: number;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export interface CreateMessageData {
  ticketId: number;
  content: string;
  attachments?: File[];
}

// Para estadísticas admin
export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  avgResponseTime: number;
  avgResolutionTime: number;
}