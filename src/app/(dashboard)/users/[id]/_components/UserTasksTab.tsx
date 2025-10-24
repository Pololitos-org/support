// users/[id]/_components/UserTasksTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { adminUsersService, UserTask } from '@/lib/services/adminUsers';
import { 
  Briefcase, 
  User, 
  Clock, 
  MapPin, 
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface Props {
  userId: number;
}

export default function UserTasksTab({ userId }: Props) {
  const [tasks, setTasks] = useState<{ asClient: UserTask[]; asWorker: UserTask[] } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'active' | 'cancelled'>('all');
  const [activeRole, setActiveRole] = useState<'client' | 'worker'>('worker');

  useEffect(() => {
    loadTasks();
  }, [userId, filterStatus]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const response = await adminUsersService.getUserTasks(userId, {
        limit: 50,
        offset: 0,
        role: 'all',
        status: filterStatus
      });
      
      setTasks({
        asClient: response.data.asClient,
        asWorker: response.data.asWorker
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading tasks:', error);
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
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAYMENT_COMPLETED': return 'bg-green-100 text-green-800';
      case 'PAYMENT_HELD': return 'bg-blue-100 text-blue-800';
      case 'PAYMENT_PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PRE_PAYMENT': 'Pre-pago',
      'PAYMENT_CREATED': 'Creado',
      'PAYMENT_PENDING': 'Pendiente',
      'PAYMENT_HELD': 'Retenido',
      'PAYMENT_COMPLETED': 'Completado',
      'PAYMENT_REFUNDED': 'Reembolsado',
      'PAYMENT_FAILED': 'Fallido'
    };
    return labels[status] || status;
  };

  const TaskCard = ({ task, role }: { task: UserTask; role: 'client' | 'worker' }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1">{task.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        </div>
        <div className="ml-4 flex flex-col items-end gap-2">
          {task.completed && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completada
            </Badge>
          )}
          {task.cancelled && (
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="h-3 w-3 mr-1" />
              Cancelada
            </Badge>
          )}
          {!task.completed && !task.cancelled && (
            <Badge className="bg-blue-100 text-blue-800">
              <Clock className="h-3 w-3 mr-1" />
              En curso
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">Presupuesto</p>
          <p className="font-semibold text-sm">{formatCurrency(task.budget)}</p>
        </div>
        {role === 'worker' && task.netAmount && (
          <div>
            <p className="text-xs text-gray-500">Ganancia neta</p>
            <p className="font-semibold text-sm text-green-600">
              {formatCurrency(task.netAmount)}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500">Estado de pago</p>
          <Badge className={getPaymentStatusColor(task.paymentStatus)}>
            {getPaymentStatusLabel(task.paymentStatus)}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-gray-500">Fecha</p>
          <p className="text-sm">{formatDate(task.createdAt)}</p>
        </div>
      </div>

      {role === 'client' && task.workerName && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <User className="h-4 w-4" />
          <span>Trabajador: <span className="font-medium">{task.workerName}</span></span>
          {task.workerRating && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              {task.workerRating.toFixed(1)}
            </span>
          )}
        </div>
      )}

      {role === 'worker' && task.clientName && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <User className="h-4 w-4" />
          <span>Cliente: <span className="font-medium">{task.clientName}</span></span>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        {task.locationMode === 'IN_PERSON' && task.locationName && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {task.locationName}
          </div>
        )}
        {task.locationMode === 'REMOTE' && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Remoto
          </div>
        )}
        {task.whenDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(task.whenDate)}
          </div>
        )}
      </div>

      {task.completed && task.completionRating && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{task.completionRating.toFixed(1)}</span>
            {task.completionFeedback && (
              <span className="text-sm text-gray-600">- {task.completionFeedback}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Cargando tareas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Error al cargar las tareas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Como Trabajador</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalAsWorker}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.completedAsWorker} completadas
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Como Cliente</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalAsClient}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.cancelledAsClient} canceladas
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ganancias Totales</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalEarningsAsWorker)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Como trabajador</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tareas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de tareas */}
      <Tabs value={activeRole} onValueChange={(value: any) => setActiveRole(value)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="worker">
            <Briefcase className="h-4 w-4 mr-2" />
            Como Trabajador ({tasks.asWorker.length})
          </TabsTrigger>
          <TabsTrigger value="client">
            <User className="h-4 w-4 mr-2" />
            Como Cliente ({tasks.asClient.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="worker" className="space-y-4 mt-6">
          {tasks.asWorker.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay tareas como trabajador</p>
              </CardContent>
            </Card>
          ) : (
            tasks.asWorker.map((task) => (
              <TaskCard key={task.id} task={task} role="worker" />
            ))
          )}
        </TabsContent>

        <TabsContent value="client" className="space-y-4 mt-6">
          {tasks.asClient.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay tareas como cliente</p>
              </CardContent>
            </Card>
          ) : (
            tasks.asClient.map((task) => (
              <TaskCard key={task.id} task={task} role="client" />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}