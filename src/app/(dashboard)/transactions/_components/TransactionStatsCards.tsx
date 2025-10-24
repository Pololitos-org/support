import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Wallet, CreditCard, PieChart } from 'lucide-react';
import { TransactionStats } from '@/lib/services/transactions';

interface Props {
  stats: TransactionStats;
  selectedPeriod: number;
}

export default function TransactionStatsCards({ stats, selectedPeriod }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
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
          <CardTitle className="text-sm font-medium">En Escrow</CardTitle>
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
          <PieChart className="h-4 w-4 text-purple-600" />
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
  );
}