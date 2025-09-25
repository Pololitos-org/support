'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Shield, 
  MessageSquare,
  TrendingUp,
  Eye,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTasks: number;
  totalRevenue: number;
  pendingVerifications: number;
  openTickets: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'task_created' | 'verification_pending' | 'ticket_created';
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
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
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-xs text-muted-foreground">
        {trend !== undefined && (
          <div className={`flex items-center mr-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
        <span>{description}</span>
      </div>
    </CardContent>
  </Card>
);

const ActivityItem = ({ item }: { item: ActivityItem }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return <Users className="h-4 w-4 text-blue-500" />;
      case 'task_created': return <ShoppingBag className="h-4 w-4 text-green-500" />;
      case 'verification_pending': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'ticket_created': return <MessageSquare className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
      <div className="mt-0.5">
        {getActivityIcon(item.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{item.description}</p>
        <p className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data por ahora - después conectas con tu API
  const mockStats: DashboardStats = {
    totalUsers: 1247,
    totalTasks: 856,
    totalRevenue: 45230000, // en pesos chilenos
    pendingVerifications: 23,
    openTickets: 12,
    recentActivity: [
      {
        id: '1',
        type: 'user_registered',
        description: 'Nuevo usuario registrado: María González',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        userId: 1248,
        userName: 'María González'
      },
      {
        id: '2', 
        type: 'verification_pending',
        description: 'Documento de identidad enviado por Carlos Ruiz',
        timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
        userId: 1200,
        userName: 'Carlos Ruiz'
      },
      {
        id: '3',
        type: 'task_created',
        description: 'Nueva tarea creada: Limpieza de oficina',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: '4',
        type: 'ticket_created',
        description: 'Nuevo ticket de soporte sobre pagos',
        timestamp: new Date(Date.now() - 1000 * 60 * 67).toISOString(),
      },
    ]
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Simular llamada API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
      } catch (err) {
        setError('Error al cargar estadísticas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStats(mockStats);
      setIsLoading(false);
    }, 1000);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Resumen general de Pololitos
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Usuarios Totales"
          value={stats?.totalUsers || 0}
          description="usuarios registrados"
          icon={Users}
          trend={12}
        />
        <StatCard
          title="Tareas Activas"
          value={stats?.totalTasks || 0}
          description="tareas en plataforma"
          icon={ShoppingBag}
          trend={8}
        />
        <StatCard
          title="Revenue Total"
          value={stats ? formatCurrency(stats.totalRevenue) : '$0'}
          description="ingresos del mes"
          icon={DollarSign}
          trend={15}
        />
        <StatCard
          title="Verificaciones"
          value={stats?.pendingVerifications || 0}
          description="pendientes"
          icon={Shield}
        />
        <StatCard
          title="Tickets Abiertos"
          value={stats?.openTickets || 0}
          description="requieren atención"
          icon={MessageSquare}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats?.recentActivity.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Tareas comunes de administración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/verification">
                <Shield className="h-4 w-4 mr-2" />
                Revisar Verificaciones
                {stats && stats.pendingVerifications > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {stats.pendingVerifications}
                  </Badge>
                )}
              </a>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/support">
                <MessageSquare className="h-4 w-4 mr-2" />
                Tickets de Soporte
                {stats && stats.openTickets > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {stats.openTickets}
                  </Badge>
                )}
              </a>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/users">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </a>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Analytics
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}