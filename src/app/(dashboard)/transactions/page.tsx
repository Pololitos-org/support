// src/app/(dashboard)/transactions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  PieChart as PieChartIcon,
  Download,
  Filter
} from 'lucide-react';
import { transactionsService, TransactionStats, Transaction } from '@/lib/services/transactions';

export default function TransactionsPage() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`💰 Loading transactions for ${selectedPeriod} days...`);
      
      const [statsData, transactionsData] = await Promise.all([
        transactionsService.getStats(selectedPeriod),
        transactionsService.getRecentTransactions(50, 0)
      ]);
      
      console.log('✅ Data loaded:', { statsData, transactionsData });
      setStats(statsData);
      setTransactions(transactionsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error loading transactions:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TASK_PAYMENT: 'Pago de Tarea',
      TASK_COMPLETION: 'Tarea Completada',
      PLATFORM_FEE: 'Comisión',
      REFUND: 'Reembolso',
      WITHDRAWAL: 'Retiro',
      CANCELLATION_FEE: 'Penalización',
      ADJUSTMENT: 'Ajuste'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: 'default', label: 'Pendiente' },
      HELD: { variant: 'default', label: 'Retenido' },
      COMPLETED: { variant: 'default', label: 'Completado' },
      FAILED: { variant: 'destructive', label: 'Fallido' },
      REFUNDED: { variant: 'secondary', label: 'Reembolsado' },
      CANCELLED: { variant: 'secondary', label: 'Cancelado' }
    };
    
    const config = variants[status] || { variant: 'default', label: status };
    
    return (
      <Badge variant={config.variant} className={
        status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
        status === 'HELD' ? 'bg-blue-100 text-blue-800' :
        status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        ''
      }>
        {config.label}
      </Badge>
    );
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cargando transacciones...
        </h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error al cargar transacciones
        </h3>
        <p className="text-sm text-gray-600 mb-6">{error}</p>
        <Button onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transacciones y Comisiones</h1>
          <p className="text-gray-600 mt-1">
            Gestión financiera y análisis de comisiones
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedPeriod.toString()}
            onValueChange={(value) => setSelectedPeriod(parseInt(value))}
          >
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalFeesCollected)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              {formatCurrency(stats.periodFeesCollected)} ({selectedPeriod} días)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagado a Trabajadores</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalPaidToWorkers)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.completedTasks} tareas completadas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Escrow (Retenido)</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.heldAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.pendingTasks} tareas pendientes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <PieChartIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalTransactions || 0).toLocaleString('es-CL')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.activeUsers} usuarios activos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comisiones por mes */}
        <Card>
          <CardHeader>
            <CardTitle>Comisiones por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyFees}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('es-CL', { month: 'short' });
                  }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Comisiones']}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
                  }}
                />
                <Bar dataKey="fees" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transacciones por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byType.map((item, index) => {
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium">
                        {getTransactionTypeLabel(item.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {item.count} txns
                      </span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Tabla */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Historial de Transacciones</CardTitle>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="TASK_PAYMENT">Pagos</SelectItem>
                  <SelectItem value="TASK_COMPLETION">Completadas</SelectItem>
                  <SelectItem value="PLATFORM_FEE">Comisiones</SelectItem>
                  <SelectItem value="REFUND">Reembolsos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="HELD">Retenido</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="FAILED">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Tarea</TableHead>
                <TableHead>Monto Bruto</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Monto Neto</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">
                    #{transaction.id}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(transaction.createdAt).toLocaleDateString('es-CL')}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{transaction.userName}</span>
                      <span className="text-xs text-gray-500">{transaction.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <span className="text-sm">{transaction.taskTitle || '-'}</span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(transaction.grossAmount)}
                  </TableCell>
                  <TableCell className="text-orange-600">
                    {transaction.platformFee > 0 ? formatCurrency(transaction.platformFee) : '-'}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(transaction.netAmount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay transacciones que coincidan con los filtros</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}