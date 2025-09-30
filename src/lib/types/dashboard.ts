// src/lib/types/dashboard.ts
export interface DashboardStats {
  totalUsers: number;
  totalTasks: number;
  totalRevenue: number;
  pendingVerifications: number;
  openTickets: number;
  recentActivity: ActivityItem[];
  trends: {
    users: number;
    tasks: number;
    revenue: number;
  };
}

export interface ActivityItem {
  id: string;
  type: 'user_registered' | 'task_created' | 'verification_pending' | 'ticket_created';
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
}