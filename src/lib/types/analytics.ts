// src/lib/types/analytics.ts
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
  [key: string]: string | number; // Índice de firma para Recharts
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