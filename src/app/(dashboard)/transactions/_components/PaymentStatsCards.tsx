import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, Building2, PieChart } from 'lucide-react';
import { PaymentAnalyticsStatistics } from '@/lib/services/adminPayments';

interface Props {
  statistics: PaymentAnalyticsStatistics;
}

export default function PaymentStatsCards({ statistics }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.totalUsers.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.percentWithBank}% con banco
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Balance Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(statistics.totalAvailableBalance)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Disponible para pagar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Con Banco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.usersWithBank.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sin banco: {statistics.usersWithoutBank}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Verificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.identityVerifiedCount.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.percentIdentityVerified}% del total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}