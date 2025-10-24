// users/[id]/_components/UserActivityTab.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminUsersService, UserActivity } from '@/lib/services/adminUsers';
import { Clock, AlertCircle } from 'lucide-react';

interface Props {
  userId: number;
}

export default function UserActivityTab({ userId }: Props) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<{ from: string; to: string; days: number } | null>(null);
  const [days, setDays] = useState<number>(30);

  useEffect(() => {
    loadActivity();
  }, [userId, days]);

  const loadActivity = async () => {
    setIsLoading(true);
    try {
      const response = await adminUsersService.getUserActivity(userId, {
        limit: 50,
        days
      });
      
      setActivities(response.data);
      setPeriod(response.period);
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Hace un momento';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'TRANSACTION': return 'border-l-green-500';
      case 'TASK_CREATED': return 'border-l-blue-500';
      case 'OFFER_SUBMITTED': return 'border-l-purple-500';
      case 'TASK_COMPLETED': return 'border-l-yellow-500';
      default: return 'border-l-gray-500';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'COMPLETED':
      case 'PAYMENT_COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'PAYMENT_PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'HELD':
      case 'PAYMENT_HELD':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
      case 'PAYMENT_FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Cargando actividad...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtro */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Timeline de Actividad</h3>
              {period && (
                <p className="text-sm text-gray-500">
                  Mostrando los últimos {period.days} días
                </p>
              )}
            </div>
            <Select value={days.toString()} onValueChange={(value) => setDays(Number(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
                <SelectItem value="365">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay actividad en este período</p>
            </div>
          ) : (
            <div className="relative">
              {/* Línea vertical del timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Items del timeline */}
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={`${activity.activityType}-${activity.activityId}-${index}`} className="relative pl-12">
                    {/* Icono */}
                    <div className="absolute left-0 top-0 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-lg">
                      {activity.icon}
                    </div>

                    {/* Contenido */}
                    <div className={`border-l-4 ${getActivityColor(activity.activityType)} bg-white rounded-lg shadow-sm p-4`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          {activity.taskTitle && (
                            <p className="text-sm text-gray-600 mt-1">
                              Tarea: {activity.taskTitle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{formatDate(activity.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {activity.status && (
                          <Badge className={getStatusBadgeColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        )}
                        
                        {activity.amount && (
                          <Badge variant="outline" className="font-mono">
                            {formatCurrency(activity.amount)}
                          </Badge>
                        )}

                        {activity.tier && (
                          <Badge variant="outline" className="text-xs">
                            Tier: {activity.tier}
                          </Badge>
                        )}

                        {activity.completionRating && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {activity.completionRating.toFixed(1)}
                          </Badge>
                        )}

                        {activity.offerCount !== undefined && activity.offerCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {activity.offerCount} ofertas
                          </Badge>
                        )}
                      </div>

                      {activity.activityType === 'TRANSACTION' && activity.netAmount && activity.platformFee && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-600 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500">Monto neto:</span>
                            <span className="font-semibold ml-2 text-green-600">
                              {formatCurrency(activity.netAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Comisión:</span>
                            <span className="font-semibold ml-2 text-orange-600">
                              {formatCurrency(activity.platformFee)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}