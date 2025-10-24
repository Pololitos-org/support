import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentAnalyticsFilters } from '@/lib/services/adminPayments';

interface Props {
  filters: PaymentAnalyticsFilters;
  onFilterChange: (key: keyof PaymentAnalyticsFilters, value: any) => void;
}

export default function PaymentFilters({ filters, onFilterChange }: Props) {
  const handleReset = () => {
    onFilterChange('hasBankAccount', undefined);
    onFilterChange('minBalance', undefined);
    onFilterChange('maxBalance', undefined);
    onFilterChange('tier', undefined);
    onFilterChange('identityVerified', undefined);
    onFilterChange('criminalRecordVerified', undefined);
    onFilterChange('hasCompletedTasks', undefined);
    onFilterChange('minTasks', undefined);
    onFilterChange('sortBy', 'balance');
    onFilterChange('sortOrder', 'DESC');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Cuenta Bancaria */}
          <div>
            <label className="block text-sm font-medium mb-1">Cuenta Bancaria</label>
            <Select
              value={filters.hasBankAccount === undefined ? 'all' : filters.hasBankAccount.toString()}
              onValueChange={(value) => onFilterChange('hasBankAccount', 
                value === 'all' ? undefined : value === 'true'
              )}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Con cuenta</SelectItem>
                <SelectItem value="false">Sin cuenta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Balance Mínimo */}
          <div>
            <label className="block text-sm font-medium mb-1">Balance Mínimo</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={filters.minBalance || ''}
              onChange={(e) => onFilterChange('minBalance', 
                e.target.value ? parseInt(e.target.value) : undefined
              )}
              placeholder="$0"
            />
          </div>

          {/* Balance Máximo */}
          <div>
            <label className="block text-sm font-medium mb-1">Balance Máximo</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={filters.maxBalance || ''}
              onChange={(e) => onFilterChange('maxBalance', 
                e.target.value ? parseInt(e.target.value) : undefined
              )}
              placeholder="Sin límite"
            />
          </div>

          {/* Tier */}
          <div>
            <label className="block text-sm font-medium mb-1">Tier</label>
            <Select
              value={filters.tier || 'all'}
              onValueChange={(value) => onFilterChange('tier', 
                value === 'all' ? undefined : value
              )}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="BRONZE">🥉 Bronze</SelectItem>
                <SelectItem value="SILVER">🥈 Silver</SelectItem>
                <SelectItem value="GOLD">🥇 Gold</SelectItem>
                <SelectItem value="PLATINUM">💎 Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Identidad Verificada */}
          <div>
            <label className="block text-sm font-medium mb-1">Identidad Verificada</label>
            <Select
              value={filters.identityVerified === undefined ? 'all' : filters.identityVerified.toString()}
              onValueChange={(value) => onFilterChange('identityVerified', 
                value === 'all' ? undefined : value === 'true'
              )}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Verificados</SelectItem>
                <SelectItem value="false">No verificados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Antecedentes Verificados */}
          <div>
            <label className="block text-sm font-medium mb-1">Antecedentes</label>
            <Select
              value={filters.criminalRecordVerified === undefined ? 'all' : filters.criminalRecordVerified.toString()}
              onValueChange={(value) => onFilterChange('criminalRecordVerified', 
                value === 'all' ? undefined : value === 'true'
              )}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Verificados</SelectItem>
                <SelectItem value="false">No verificados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tareas Completadas */}
          <div>
            <label className="block text-sm font-medium mb-1">Tareas Completadas</label>
            <Select
              value={filters.hasCompletedTasks === undefined ? 'all' : filters.hasCompletedTasks.toString()}
              onValueChange={(value) => onFilterChange('hasCompletedTasks', 
                value === 'all' ? undefined : value === 'true'
              )}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Con tareas</SelectItem>
                <SelectItem value="false">Sin tareas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordenar Por */}
          <div>
            <label className="block text-sm font-medium mb-1">Ordenar Por</label>
            <Select
              value={filters.sortBy || 'balance'}
              onValueChange={(value) => onFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance">Balance</SelectItem>
                <SelectItem value="earnings">Ganancias</SelectItem>
                <SelectItem value="totalTasks">Total Tareas</SelectItem>
                <SelectItem value="registeredDate">Fecha Registro</SelectItem>
                <SelectItem value="tier">Tier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botón Limpiar Filtros */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-blue-600 hover:text-blue-800"
          >
            🔄 Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}