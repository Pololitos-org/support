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