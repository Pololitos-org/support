// lib/types/user.ts
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  bio?: string;
  verificationLevel: VerificationLevel;
  identityVerified: boolean;
  criminalRecordVerified: boolean;
  location?: string;
  totalTasks: number;
  totalRatings: number;
  averageRating: number;
  earningsTotal: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  createdAt: string;
  state: 'INCOMPLETE_REGISTRATION' | 'OK' | 'DISABLED' | 'BLOCKED';
}

// lib/types/verification.ts
export enum VerificationLevel {
  BASIC = 'BASIC',
  VERIFIED = 'VERIFIED',
  PREMIUM = 'PREMIUM',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DocumentType {
  IDENTITY_CARD_FRONT = 'IDENTITY_CARD_FRONT',
  IDENTITY_CARD_BACK = 'IDENTITY_CARD_BACK',
  CRIMINAL_RECORD = 'CRIMINAL_RECORD',
  ADDRESS_PROOF = 'ADDRESS_PROOF',
}

export interface VerificationDocument {
  id: number;
  documentType: DocumentType;
  status: DocumentStatus;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface AdminVerificationDocument extends VerificationDocument {
  userId: number;
  userName: string;
  userEmail?: string;
  profilePictureUrl?: string;
}

// lib/types/support.ts
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
  assignedTo?: number;
  assignedToName?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderName: string;
  content: string;
  isFromStaff: boolean;
  createdAt: string;
  attachments?: string[];
}

// lib/types/admin.ts
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
}

export interface DashboardMetric {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ActivityItem {
  id: string;
  type: 'user_registered' | 'task_created' | 'verification_pending' | 'ticket_created';
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
}