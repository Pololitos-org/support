import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Filter } from 'lucide-react';
import { Transaction } from '@/lib/services/transactions';

interface Props {
  transactions: Transaction[];
}

export default function TransactionsTable({ transactions }: Props) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
                <TableHead>Tipo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Monto</TableHead>
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
                    <div>
                      <div className="text-sm font-medium">{transaction.userName}</div>
                      <div className="text-xs text-gray-500">{transaction.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(transaction.grossAmount)}
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
        </div>
      </CardContent>
    </Card>
  );
}