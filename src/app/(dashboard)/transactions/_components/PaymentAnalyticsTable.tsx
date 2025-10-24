import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPaymentData } from '@/lib/services/adminPayments';
import Link from 'next/link';

interface Props {
  users: UserPaymentData[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaymentAnalyticsTable({ 
  users, 
  currentPage, 
  totalPages, 
  onPageChange 
}: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      case 'BRONZE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case 'PLATINUM': return '💎';
      case 'GOLD': return '🥇';
      case 'SILVER': return '🥈';
      case 'BRONZE': return '🥉';
      default: return '⭐';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios con Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-center">Banco</TableHead>
                <TableHead className="text-center">Verificación</TableHead>
                <TableHead className="text-center">Tareas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTierColor(user.tier)}>
                      {getTierIcon(user.tier)} {user.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(user.availableBalance)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Total: {formatCurrency(user.totalEarnings)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.hasBankAccount ? (
                      <span className="text-green-600 text-lg">✅</span>
                    ) : (
                      <span className="text-red-600 text-lg">❌</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      {user.identityVerified && (
                        <span title="Identidad" className="text-lg">🆔</span>
                      )}
                      {user.criminalRecordVerified && (
                        <span title="Antecedentes" className="text-lg">📋</span>
                      )}
                      {user.addressVerified && (
                        <span title="Dirección" className="text-lg">🏠</span>
                      )}
                      {!user.identityVerified && !user.criminalRecordVerified && !user.addressVerified && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm text-gray-900">
                      {user.completedTasksCount} / {user.totalTasks}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link 
                      href={`/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Ver detalles →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay usuarios que coincidan con los filtros</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}