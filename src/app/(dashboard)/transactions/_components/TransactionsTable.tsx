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
import { Filter, RotateCcw, AlertTriangle } from 'lucide-react';
import { Transaction, transactionsService } from '@/lib/services/transactions';

interface Props {
  transactions: Transaction[];
  onUpdate?: () => void;
}

export default function TransactionsTable({ transactions, onUpdate }: Props) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

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

  const getStatusBadge = (status: string, taskPaymentStatus?: string) => {
    if (taskPaymentStatus === 'CANCELLATION_REQUESTED') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          SOLICITUD DE REEMBOLSO
        </Badge>
      );
    }

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

  const handleRefund = async (transaction: Transaction) => {
    if (!confirm(`¿Estás seguro de que deseas reembolsar ${formatCurrency(transaction.grossAmount)} al cliente? Esta acción es irreversible y anulará el pago en Webpay si aplica.`)) {
      return;
    }

    try {
      setIsProcessing(transaction.id);
      const result = await transactionsService.refundTransaction(transaction.id);

      if (result.success) {
        alert(result.message || 'Reembolso procesado correctamente');
        onUpdate?.();
      } else {
        alert(result.message || 'Error al procesar el reembolso');
      }
    } catch (error) {
      console.error('Refund error:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar el reembolso');
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  return (
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo / Tarea</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className={transaction.taskPaymentStatus === 'CANCELLATION_REQUESTED' ? 'bg-red-50/50' : ''}>
                  <TableCell className="font-mono text-xs">
                    #{transaction.id}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(transaction.createdAt).toLocaleDateString('es-CL')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">
                        {getTransactionTypeLabel(transaction.type)}
                      </div>
                      <div className="text-xs text-gray-500 max-w-[200px] truncate">
                        {transaction.taskTitle || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{transaction.userName}</div>
                      <div className="text-xs text-gray-500">{transaction.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(transaction.grossAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(transaction.status, transaction.taskPaymentStatus)}
                      {transaction.cancellationReason && (
                        <div className="flex items-center gap-1 text-[10px] text-red-600 max-w-[150px]">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span className="truncate" title={transaction.cancellationReason}>
                            {transaction.cancellationReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {(transaction.status === 'HELD' || transaction.taskPaymentStatus === 'CANCELLATION_REQUESTED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRefund(transaction)}
                        disabled={isProcessing === transaction.id}
                      >
                        {isProcessing === transaction.id ? (
                          <RotateCcw className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <RotateCcw className="h-3 w-3 mr-1" />
                        )}
                        Reembolsar
                      </Button>
                    )}
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
        </div>
      </CardContent>
    </Card>
  );
}