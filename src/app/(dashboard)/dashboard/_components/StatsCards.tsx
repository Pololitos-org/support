// src/app/(dashboard)/dashboard/_components/StatsCards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Shield, 
  MessageSquare,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DashboardStats } from '@/lib/types/dashboard';
import { dashboardService } from '@/lib/services/dashboard';

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  description: string; 
  icon: React.ElementType;
  trend?: number;
}) => {
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend && trend > 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center mr-2 ${trendColor}`}>
              <TrendIcon className="h-3 w-3 mr-1" />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Usuarios Totales"
        value={stats.totalUsers.toLocaleString('es-CL')}
        description="usuarios registrados"
        icon={Users}
        trend={stats.trends.users}
      />
      <StatCard
        title="Tareas Activas"
        value={stats.totalTasks.toLocaleString('es-CL')}
        description="tareas en plataforma"
        icon={ShoppingBag}
        trend={stats.trends.tasks}
      />
      <StatCard
        title="Revenue Total"
        value={dashboardService.formatCurrency(stats.totalRevenue)}
        description="últimos 30 días"
        icon={DollarSign}
        trend={stats.trends.revenue}
      />
      <StatCard
        title="Verificaciones"
        value={stats.pendingVerifications.toLocaleString('es-CL')}
        description="pendientes"
        icon={Shield}
      />
      <StatCard
        title="Tickets Abiertos"
        value={stats.openTickets.toLocaleString('es-CL')}
        description="requieren atención"
        icon={MessageSquare}
      />
    </div>
  );
}