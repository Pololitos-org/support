// users/[id]/_components/UserTransactionsTab.tsx
import { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaction } from '@/lib/services/transactions';
import { Filter, ArrowUpDown, FileQuestion } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export default function UserTransactionsTab({ 
  transactions, 
  isLoading, 
  formatCurrency, 
  formatDate 
}: Props) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'TASK_PAYMENT': 'Pago de Tarea',
      'TASK_COMPLETION': 'Tarea Completada',
      'PLATFORM_FEE': 'Comisión',
      'REFUND': 'Reembolso',
      'WITHDRAWAL': 'Retiro',
      'BONUS': 'Bonus'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PAYMENT_COMPLETED': 'Completado',
      'PAYMENT_HELD': 'Retenido',
      'PAYMENT_PENDING': 'Pendiente',
      'PAYMENT_FAILED': 'Fallido',
      'PAYMENT_REFUNDED': 'Reembolsado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAYMENT_COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PAYMENT_HELD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAYMENT_PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAYMENT_FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PAYMENT_REFUNDED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TASK_COMPLETION': return 'bg-green-100 text-green-800';
      case 'PLATFORM_FEE': return 'bg-orange-100 text-orange-800';
      case 'REFUND': return 'bg-purple-100 text-purple-800';
      case 'WITHDRAWAL': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  // Ordenar transacciones
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' 
        ? a.grossAmount - b.grossAmount 
        : b.grossAmount - a.grossAmount;
    }
  });

  // Calcular totales
  const totals = filteredTransactions.reduce((acc, t) => {
    if (t.status === 'PAYMENT_COMPLETED') {
      acc.completed += t.netAmount;
      acc.fees += t.platformFee;
    } else if (t.status === 'PAYMENT_HELD') {
      acc.held += t.grossAmount;
    }
    return acc;
  }, { completed: 0, held: 0, fees: 0 });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Cargando transacciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de transacciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Completado</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.completed)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Neto recibido (después de comisiones)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">En Retención</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totals.held)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Fondos en escrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Comisiones Pagadas</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(totals.fees)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Comisiones de la plataforma
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y tabla */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Historial de Transacciones ({sortedTransactions.length})</CardTitle>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="TASK_PAYMENT">Pagos</SelectItem>
                  <SelectItem value="TASK_COMPLETION">Completadas</SelectItem>
                  <SelectItem value="PLATFORM_FEE">Comisiones</SelectItem>
                  <SelectItem value="REFUND">Reembolsos</SelectItem>
                  <SelectItem value="WITHDRAWAL">Retiros</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PAYMENT_COMPLETED">Completado</SelectItem>
                  <SelectItem value="PAYMENT_HELD">Retenido</SelectItem>
                  <SelectItem value="PAYMENT_PENDING">Pendiente</SelectItem>
                  <SelectItem value="PAYMENT_FAILED">Fallido</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileQuestion className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron transacciones
              </p>
              <p className="text-sm text-gray-500">
                {filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Intenta ajustar los filtros' 
                  : 'Este usuario no tiene transacciones registradas'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tarea</TableHead>
                    <TableHead className="text-right">Monto Bruto</TableHead>
                    <TableHead className="text-right">Comisión</TableHead>
                    <TableHead className="text-right">Monto Neto</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-xs">
                        #{transaction.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeColor(transaction.type)}>
                          {getTypeLabel(transaction.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium text-sm truncate">
                            {transaction.taskTitle || `Tarea #${transaction.taskId}`}
                          </p>
                          <p className="text-xs text-gray-500">ID: {transaction.taskId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.grossAmount)}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        -{formatCurrency(transaction.platformFee)}
                        <p className="text-xs text-gray-500">
                          {transaction.platformFeePercentage}%
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(transaction.netAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.appliedTierName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}