import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  data: Array<{ type: string; count: number; total: number }>;
}

export default function TransactionTypeBreakdown({ data }: Props) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
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
  );
}