'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@/lib/services/dashboard';
import ActivityFeed from './_components/ActivityFeed';
import QuickActions from './_components/QuickActions';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import StatsCards from './_components/StatsCards';

interface DashboardStats {
  totalUsers: number;
  totalTasks: number;
  totalRevenue: number;
  pendingVerifications: number;
  openTickets: number;
  recentActivity: any[];
  trends: {
    users: number;
    tasks: number;
    revenue: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📊 Loading dashboard stats...');
      const data = await dashboardService.getStats();
      console.log('✅ Dashboard stats loaded:', data);
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error loading stats:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cargando dashboard...
          </h3>
          <p className="text-sm text-gray-600">
            Obteniendo estadísticas de la plataforma
          </p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center max-w-md">
          <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar el dashboard
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {error}
          </p>
          <Button onClick={loadStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Si no hay stats (no debería pasar)
  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Resumen general de Pololitos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vista general de la actividad de la plataforma
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadStats}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Stats Grid */}
      <StatsCards stats={stats} />

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <ActivityFeed activity={stats.recentActivity || []} />
        <QuickActions 
          pendingVerifications={stats.pendingVerifications || 0}
          openTickets={stats.openTickets || 0}
        />
      </div>
    </div>
  );
}